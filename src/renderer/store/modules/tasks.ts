import { ModuleOption, RootCommit } from '../definition'
import { useTasksAPIs, useIpcRenderer, useModelsAPIs } from '../../hooks/apis'
import { IpcRendererEvent } from 'electron/main'
import { SimplifiedProjection } from '@shared/dataModelTypes/runs/projections'
import { ProcessType, taskMonit, PrintLines, Task } from '@shared/dataModelTypes/tasks/index'
import modelsDataSource from './modelsDataSource'
import { once } from '@shared/functional'
import { ElMessage } from 'element-plus'
import { checkCurrentProjection } from './tasksSource'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import { asyncForEach } from '@shared/commonUtils'
import { v4 as uuid } from 'uuid'
interface TaskStatus {
  id: number
  status: number | undefined
  pid: number | undefined
  submitTime: number | undefined
}
interface State {
  isCompiling: boolean
  isRunning: number
  hideConsole: boolean
  printLines: { [key: string]: string[] }
  tasks: Task[],
  taskMonits: taskMonit[]
  curTaskId: number[]
  curTaskIdCount: number
  taskConsoleFolderPath: Object | ''
  curCompilingPid: number
  currentTaskId: string
}

interface Getters {
  compileDisabled: boolean
  runDisabled: boolean
  getTaskList: taskMonit[]
}

interface Mutations {
  addNewPrintLines: PrintLines[]
  startCompiling: null
  endCompiling: null
  stopCurrentTask: null
  startRunning: null
  endRunning: null
  setConsoleHide: boolean
  clearPrintLines: string
  recoverTaskMonits: taskMonit[]
  deleteTaskMonits: number
  changeTaskMonitsStatus: TaskStatus
  changeTaskConsoleFolderPath: taskMonit
  resetTasks: void
  resetTaskId: void
  addCurTaskId: number
  setCompilePid: number
  updateCurrentTaskId: string
}

interface Actions {
  compileModel: (modelId: number) => void
  stopCompile: () => void
  stopTask: (taskId: number) => void
  runProjection: (projection: SimplifiedProjection) => void
  insertTaskMonits: (taskMonit: any) => { taskIds: number[][], processId: string }
  recoverTaskMonitsFromDB: () => void
  deleteTaskMonitsToDB: (IdArr: number[]) => void
}

export type TasksModule = ModuleOption<State, Getters, Mutations, Actions>

const registerTaskEvents = once((commit: RootCommit) => {
  useIpcRenderer().on('task:newPrintLines', (_: IpcRendererEvent, lines: string, taskId: number) => {
    const lineArr = lines.split('\n').map(item => {
      return {
        line: item,
        taskId
      }
    })
    commit('addNewPrintLines', lineArr)
  })
  useIpcRenderer().on('task:error', (_: IpcRendererEvent, lines: string, taskId: number) => {
    const lineArr = lines.split('\n').map(item => {
      return {
        line: item,
        taskId
      }
    })
    commit('addNewPrintLines', lineArr)
  })
  useIpcRenderer().on('task:exit', (_: IpcRendererEvent, code: string | number) => {
    console.log('task exit code:', code)
  })
  useIpcRenderer().on('task:updateStatus', (_: IpcRendererEvent, taskID: number, processType: ProcessType, taskStatus: number) => {
    if (processType === ProcessType.modelRun) {
      useTasksAPIs().db.updateTaskMoniteToDB(taskID, taskStatus)
      console.log('task', taskID, 'status update', taskStatus, 'time:', new Date())
      commit('changeTaskMonitsStatus', {
        id: taskID,
        status: taskStatus,
        pid: -1,
        submitTime: undefined
      })
      let processingStatus = [0, 5, 6, 7, 8, 9]
      if (!processingStatus.includes(taskStatus)) commit('endRunning')
      // if (taskStatus !== 5 && taskStatus !== 0 && taskStatus !== 7 && taskStatus !== 8 && taskStatus !== 6) commit('endRunning')
    } else {
      commit('setCompilePid', -1)
      if (taskStatus === 1) {
        commit('addNewPrintLines', [
          {
            line: 'Model Compilation Successed.',
            taskId: taskID
          }
        ])
      } else {
        commit('addNewPrintLines', [
          {
            line: 'Model Compilation Failed.',
            taskId: taskID
          }
        ])
      }
      commit('endCompiling')
      if (taskStatus !== 5) commit('endRunning')
    }
  })
  useIpcRenderer().on('task:close', (_: IpcRendererEvent, code: string | number) => {
    console.log('task close code:', code)
    commit('setCompilePid', -1)
  })
  useIpcRenderer().on('task:pid', (_: IpcRendererEvent, taskId: number, processType: ProcessType, code: number) => {
    console.log('task pid:', code)
    if (processType === ProcessType.compile) {
      commit('startCompiling')
      commit('setCompilePid', code)
      // if (taskId !== undefined) {
      commit('startRunning')
      // }
    } else {
      useTasksAPIs().db.updateTaskMoniteSubmitTimeToDB(taskId)
      commit('startRunning')
      commit('changeTaskMonitsStatus', {
        id: taskId,
        status: undefined,
        pid: code, // todo should update pid into db
        submitTime: undefined
      })
    }
  })
  useIpcRenderer().on('task:startCompiling', (_: IpcRendererEvent) => {
    commit('startCompiling')
  })
})

const mod: TasksModule = {
  namespaced: true,
  state: {
    isCompiling: false,
    isRunning: 0,
    hideConsole: true,
    printLines: {},
    taskMonits: [],
    tasks: [],
    curTaskIdCount: 0,
    curTaskId: [],
    taskConsoleFolderPath: {},
    curCompilingPid: -1,
    currentTaskId: ''
  },
  getters: {
    compileDisabled(state): boolean {
      return state.isRunning < 0
    },
    runDisabled(state): boolean {
      return state.isCompiling
    },
    getTaskList(state): taskMonit[] {
      return state.taskMonits
    }

  },
  mutations: {
    updateCurrentTaskId(state, taskId) {
      state.currentTaskId = taskId
    },
    addNewPrintLines(state, lines) {
      for (let i = 0; i < lines.length; i++) {
        const taskId = lines[i].taskId?.toString() || '-1'
        const taskLine = state.printLines[taskId]
        if (taskLine) {
          taskLine.push(lines[i].line)
          if (taskLine.length > 1024) {
            taskLine.shift()
          }
        } else {
          state.printLines[taskId] = [lines[i].line]
          state.tasks.push({
            taskId,
            label: taskId === '-1' ? '编译' : `task_${taskId}`
          })
          state.currentTaskId = taskId
        }
      }
    },
    startCompiling(state) {
      state.isCompiling = true
    },
    endCompiling(state) {
      state.isCompiling = false
    },
    stopCurrentTask(state) {
      state.isCompiling = false
      state.isRunning = state.isRunning - 1
    },
    startRunning(state) {
      state.isRunning = state.isRunning + 1
      console.log('start', state.isRunning)
    },
    endRunning(state) {
      state.isRunning = state.isRunning - 1
      console.log('stop', state.isRunning)
    },
    setConsoleHide(state, hide) {
      state.hideConsole = hide
    },
    clearPrintLines(state, taskId) {
      const findIndex = state.tasks.findIndex(task => task.taskId === taskId)
      state.tasks.splice(findIndex, 1)
      delete state.printLines[taskId]
      const currentIndex = state.tasks.findIndex(task => task.taskId === state.currentTaskId)
      if (state.tasks.length && currentIndex === -1) {
        state.currentTaskId = state.tasks[state.tasks.length - 1].taskId.toString()
      }
    },
    recoverTaskMonits(state, TaskMonits) {
      state.taskMonits.push(...TaskMonits)
    },
    deleteTaskMonits(state, id) {
      state.taskMonits.map((item, index) => {
        if (item.id === id) {
          state.taskMonits.splice(index, 1)
        }
      })
      const findIndex = state.tasks.findIndex(task => task.taskId === id.toString())
      state.tasks.splice(findIndex, 1)
      delete state.printLines[id.toString()]
    },
    changeTaskMonitsStatus(state, params) {
      setTimeout(() => {
        state.taskMonits.map(item => {
          if (item.id === params.id) {
            if (params.status !== undefined) item.status = params.status
            if (params.pid !== undefined) item.pid = params.pid
            if (params.status !== undefined && params.status !== 0 && params.status !== 7 && params.status !== 6) item.completedTime = new Date().getTime() // 更新到终止状态时作为完成时间
            if (params.status === 0) item.submitTime = new Date().getTime() // 任务状态0表示开始运行，设置为开始时间
            // if (params.pid !== undefined) item.submitTime = new Date().getTime()
            // item.projectionId = 9999
          }
        })
      }, 500)
    },
    changeTaskConsoleFolderPath(state, TaskMonit) {
      state.taskConsoleFolderPath = TaskMonit
    },
    resetTasks(state) {
      state.printLines = {}
      state.taskMonits = []
      state.tasks = []
      state.taskConsoleFolderPath = {}
      state.isCompiling = false
      state.isRunning = 0
      state.curTaskIdCount = 0
      state.curTaskId = []
      state.taskConsoleFolderPath = {}
      state.curCompilingPid = -1
      state.currentTaskId = ''
    },
    resetTaskId(state) {
      state.curTaskId = []
    },

    addCurTaskId(state, taskId) {
      state.curTaskId.push(taskId)
    },

    setCompilePid(state, pid) {
      state.curCompilingPid = pid
    }
  },
  actions: {
    async compileModel({ commit, state, rootState }, modelId: number) {
      registerTaskEvents(commit)
      if (!state.isCompiling) {
        commit('startCompiling')
        const model = modelsDataSource.getModel(modelId)
        // @ts-ignore
        commit('models/showConsole', null, { root: true })
        const success = await useTasksAPIs().run.compileModel({ name: model.name, id: model.id as number }, { ...rootState.workspace })
      }
    },
    async stopCompile({ commit, state, rootState }) {
      registerTaskEvents(commit)
      if (state.isCompiling && state.isRunning > 0) {
        console.log('compiling in process, cancel')
        const success = await useTasksAPIs().run.stopProcess(state.curCompilingPid)
        if (success) {
          commit('addNewPrintLines', [{
            line: 'Model Compilation Stoped.',
            taskId: undefined
          }])
        } else {
          commit('addNewPrintLines', [{
            line: 'Model Compilation Stop failed.',
            taskId: undefined
          }])
        }
      }
    },
    async stopTask({ commit, state, rootState }, taskId) {
      // if (state.isCompiling && state.curCompilingPid !== -1) {
      //   console.log('compiling in process, cancel')
      //   const success = await useTasksAPIs().run.stopProcess(state.curCompilingPid)
      //   if (success) {
      //     commit('addNewPrintLines', ['Model Compilation Stoped.'])
      //   } else {
      //     commit('addNewPrintLines', ['Model Compilation Stop failed.'])
      //   }
      // }
      // if (state.isRunning) {
      const targetTask = state.taskMonits.find(item => item.id === taskId)

      // if (targetTask?.pid !== -1) {
      // if (targetTask?.pid && targetTask?.pid !== -1) {
      let closePid = targetTask?.pid === -1 ? undefined : targetTask?.pid // to close un started cluster task;
      const success = await useTasksAPIs().run.stopProcess(closePid, targetTask?.processId)
      if (success) {
        commit('addNewPrintLines', [{
          line: 'Task Stoped.',
          taskId: Number(taskId)
        }])
      } else {
        commit('addNewPrintLines', [{
          line: 'Task Stop failed.',
          taskId: Number(taskId)
        }])
      }
      // }
      // } else {
      //   registerTaskEvents(commit)
      //   console.log('compiling in process, cancel1')
      //   if (state.isCompiling) {
      //     console.log('compiling in process, cancel')
      //     const success = await useTasksAPIs().run.stopProcess(state.curCompilingPid)
      //     if (success) {
      //       commit('addNewPrintLines', [{
      //         line: 'Model Compilation Stoped.',
      //         taskId: Number(taskId)
      //       }])
      //     } else {
      //       commit('addNewPrintLines', [{
      //         line: 'Model Compilation Stop failed.',
      //         taskId: Number(taskId)
      //       }])
      //     }
      //   }
      // }
      // }
    },
    async runProjection({ commit, state, rootState }, projection: SimplifiedProjection) {
      const flag = checkCurrentProjection(projection.projectionId)
      console.log('projection', flag)
      if (flag !== 'success') {
        ElMessage({
          message: flag,
          type: 'warning'
        })
        for (let l of projection.taskIds) {
          for (let tid of l) {
            useTasksAPIs().db.updateTaskMoniteToDB(tid, 9) // 创建失败
            commit('changeTaskMonitsStatus', {
              id: tid,
              status: 9,
              pid: -1,
              submitTime: undefined
            })
          }
        }
        return
      }
      commit('setConsoleHide', false)
      registerTaskEvents(commit)
      // commit('startRunning')
      // @ts-ignore
      commit('models/showConsole', null, { root: true })
      console.log('simple projection')
      useTasksAPIs().run.runProjection(projection, { ...rootState.workspace }).then(success => {
        if (!success) {
          console.log('run start failed')
          // commit('addNewPrintLines', [{
          //   line: 'Projection Running Failed.',
          //   taskId: Number(state.currentTaskId)
          // }])
          // commit('changeTaskMonitsStatus', {
          //   projectionId: projection.projectionId,
          //   status: 2
          // })
          // setTimeout(() => {
          //   for (let i = 0; i < state.curTaskIdCount; i++) {
          //     useTasksAPIs().db.updateTaskMoniteToDB(projection.projectionId, 2)
          //   }
          // }, 1000)
        } else {
          console.log('run start succeed')
          // commit('changeTaskMonitsStatus', {
          //   projectionId: projection.projectionId,
          //   status: 1
          // })
          // setTimeout(() => {
          //   for (let i = 0; i < state.curTaskIdCount; i++) {
          //     useTasksAPIs().db.updateTaskMoniteToDB(projection.projectionId, 1)
          //   }
          // }, 1000)
        }
      })
    },

    async insertTaskMonits({ commit, state, rootState }, taskMonit): Promise<{ taskIds: number[][], processId: string }> {
      const creator = await useModelsAPIs().getModelCreator()
      const taskIds: number[][] = []
      const processId = uuid()
      await asyncForEach(taskMonit.runnerSelections, async (runnerIds: Number[]) => {
        const taskId: number[] = []
        taskIds.push(taskId)
        await asyncForEach(runnerIds, async runnerId => {
          const runs = rootState.runs.runners.filter((runner: Runner) => runner.id === runnerId)
          const run: Runner | undefined = runs.length > 0 ? runs[0] : undefined
          if (run) {
            const taskMintL = {
              id: 0,
              taskName: taskMonit.taskName,
              outputChildAddress: taskMonit.outputChildAddress,
              outputAddress: taskMonit.outputAddress,
              status: taskMonit.status,
              submitTime: taskMonit.submitTime,
              completedTime: taskMonit.completedTime,
              submitter: creator,
              modelName: '',
              projectionId: taskMonit.projectionId,
              modelId: -1,
              pid: undefined,
              processId: processId
            }
            taskMintL.modelName = modelsDataSource.getModel(run.modelId as number).name
            taskMintL.modelId = run.modelId as number
            await useTasksAPIs().db.insertTaskMonitsToDB(rootState.workspace.id, taskMintL).then(async (result: number) => {
              taskMintL.id = result
              state.curTaskIdCount++
              commit('recoverTaskMonits', [taskMintL])
              commit('changeTaskConsoleFolderPath', taskMintL)
            })
            taskId.push(taskMintL.id)
          }
        })
      })
      return { taskIds: taskIds, processId: processId }
    },
    async recoverTaskMonitsFromDB({ commit, state, rootState }): Promise<void> {
      commit('resetTasks')
      const taskMonits = await useTasksAPIs().db.queryTaskMonitsFromDB(rootState.workspace.id)
      commit('recoverTaskMonits', taskMonits)
    },
    async deleteTaskMonitsToDB({ commit, rootState }, IdArr: number[]): Promise<void> {
      return await useTasksAPIs().db.deleteTaskMoniteToDB(JSON.parse(JSON.stringify(IdArr))).then(result => {
        IdArr.map(item => {
          commit('deleteTaskMonits', item)
        })
      })
    }

  }
}

export default mod
