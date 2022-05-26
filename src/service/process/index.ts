import { ipcMain, BrowserWindow, app, powerSaveBlocker } from 'electron'
import { join } from 'path'
import { fork, exec } from 'child_process'
import { promisify } from 'util'
import {
  ClusterProcessItem,
  CompileProcessItem,
  ModelProcessItem,
  ProcessItem,
  ProcessQueue,
  ProcessType
} from '../../shared/dataModelTypes/tasks'
// import os from 'os'
import command from '../../main/cluster'
import { taskConfig } from '../../main/cluster/type'
import config from '../../server/config'
import webContents from '../../service/webContents'
import processUtil from './utils'
import taskApi from '../../preload/tasksAPIs'
let ajaxRequest: any

// let mySocket: any
const processQueueCluster: ProcessQueue[] = []
let runPath: any
let compilePath: any
let taskPath: any
let runningProcess = 0
let checkingProcess = 0
if (process.env.ARCHITECTURE === 'bs') {
  runPath = 'tasks/run.js'
  compilePath = 'tasks/compile.js'
  taskPath = 'tasks'
  // mySocket = require('../../server/socket')
  const AjaxRequest = require('../../lib/ajaxRequest')
  ajaxRequest = new AjaxRequest(config.compileBaseUrl)
} else {
  runPath = app.isPackaged ? join(__dirname, './tasks/run.js') : join(__dirname, '../tasks/run.js')
  compilePath = app.isPackaged ? join(__dirname, './tasks/compile.js') : join(__dirname, '../tasks/compile.js')
  taskPath = app.isPackaged ? join(__dirname, '../tasks') : join(__dirname, '../tasks')
}

const logicalProcessorsList = processUtil.getProcessorsList()
const maxCpuPerUser = logicalProcessorsList.length >= 1 ? logicalProcessorsList[0] : 1
let cpuAvailable = maxCpuPerUser
export function queryCpus() {
  return cpuAvailable
}

var systemstatusid = powerSaveBlocker.start('prevent-display-sleep')
var susSid = powerSaveBlocker.start('prevent-app-suspension')
console.log('Prevent display sleep:', powerSaveBlocker.isStarted(systemstatusid))
console.log('Prevent app suspension:', powerSaveBlocker.isStarted(susSid))
// @ts-ignore
ipcMain.on('change-system-satus', (event, arg) => {
  if (arg.status === 1) {
    console.log('ENABLE prevent sleep mode.')
    systemstatusid = powerSaveBlocker.start('prevent-display-sleep')
  } else {
    console.log('DISABLE prevent sleep mode.')
    powerSaveBlocker.stop(systemstatusid)
    setTimeout(() => {
      console.log('sleep id exists:', systemstatusid)
    }, 3000)
  }
})

function stopProcess(userSpace:string, pid: number | undefined, resolve: (value: unknown) => void, processId?: string) {
  try {
    let currentWindow
    let useCluster
    let closeTasks: Set<number> = new Set()
    let closePids: Set<number> = new Set()
    if (pid) { // stop compile only have pid from frontend, match task;
      closePids.add(pid)
      for (let p of processQueueCluster) {
        for (let l of p.compileProcess) {
          for (let i of l) {
            i.pid === pid && (processId = p.processId)
          }
        }
      }
    }
    if (processId) {
      for (let index = 0; index < processQueueCluster.length; index++) {
        const taskQueue: ProcessQueue = processQueueCluster[index]
        if (taskQueue.processId === processId) {
          currentWindow = taskQueue.currentWindow
          useCluster = taskQueue.useCluster
          for (let linearIndex = 0; linearIndex < taskQueue.compileProcess.length; linearIndex++) {
            const taskItems: CompileProcessItem[] = taskQueue.compileProcess[linearIndex]
            for (let parallelIndex = 0; parallelIndex < taskItems.length; parallelIndex++) {
              const taskItem: CompileProcessItem = taskItems[parallelIndex]
              if (!taskItem.killed && !taskItem.finished) { // stop all taskItem insides taskQueue
                taskItem.killed = true
                taskItem.finished = true
                if (taskItem.pid) closePids.add(taskItem.pid)
                else if (taskItem.taskId) closeTasks.add(taskItem.taskId)
              }
            }
          }
          for (let linearIndex = 0; linearIndex < taskQueue.modelProcess.length; linearIndex++) {
            const taskItems: ModelProcessItem[] = taskQueue.modelProcess[linearIndex]
            for (let parallelIndex = 0; parallelIndex < taskItems.length; parallelIndex++) {
              const taskItem: ModelProcessItem = taskItems[parallelIndex]
              if (!taskItem.killed && !taskItem.finished) {
                !taskQueue.useCluster && (taskItem.killed = true)
                !taskQueue.useCluster && (taskItem.finished = true)
                if (taskItem.pid) closePids.add(taskItem.pid)
                else if (taskItem.taskId) closeTasks.add(taskItem.taskId)
              }
            }
          }
          break
        }
      }
    }
    if (useCluster) {
      if (!processId) return console.log('Stop processId required::', processId)
      for (let taskId of closeTasks.keys()) {
        webContents.send(userSpace, currentWindow, 'task:updateStatus', taskId, ProcessType.modelRun, 6) // 停止中
      }
      return command.task.stopTask(processQueueCluster, processId).then((ret) => {
        resolve(ret.success)
      })
    }
    if (closePids.size > 0) {
      for (let p of closePids.keys()) {
        try {
          console.log('kill', p)
          process.kill(p, 'SIGINT')
        } catch (e) {
          console.error(e)
        }
      }
    }
    if (closeTasks.size > 0) {
      const processType = ProcessType.modelRun
      for (let taskId of closeTasks.keys()) {
        webContents.send(userSpace, currentWindow, 'task:updateStatus', taskId, processType, 5)
      }
    }
    resolve(true)
  } catch (e) {
    resolve(false)
  }
}

function removeProcessQueue(taskQueue: ProcessQueue) {
  const index = processQueueCluster.findIndex(item => item.processId === taskQueue.processId)
  processQueueCluster.splice(index, 1)
}

function checkProcessClustor() {
  ++checkingProcess
  if (runningProcess > 2) {
    --checkingProcess
    return
  }
  const processToRemove: ProcessQueue[] = []
  processQueueCluster.forEach((taskQueue: ProcessQueue) => {
    let finished = true
    taskQueue.compileProcess.forEach((taskItems: ProcessItem[]) => {
      taskItems.forEach((taskItem: ProcessItem) => {
        finished = (taskItem.killed || taskItem.finished) ? finished : false
      })
    })
    taskQueue.modelProcess.forEach((taskItems: ProcessItem[]) => {
      taskItems.forEach((taskItem: ProcessItem) => {
        finished = (taskItem.killed || taskItem.finished) ? finished : false
      })
    })
    if (finished) processToRemove.push(taskQueue)
  })
  processToRemove.forEach(element => removeProcessQueue(element))
  --checkingProcess
}

async function generateClusterScheme(taskItem: ModelProcessItem, linearIndex: number, parallelIndex: number, args: Array<string>, normalizedPath: string): Promise<ClusterProcessItem> {
  return {
    novaTaskId: taskItem.taskId,
    processType: taskItem.processType,
    modelName: taskItem.modelName, // -m
    projectionDirPath: normalizedPath, // -p
    outputFolder: taskItem.outputFolder,
    compileTempOutputPath: taskItem.compileTempOutputPath,
    index: [linearIndex, parallelIndex],
    csvPath: taskItem.csvPath,
    command: JSON.stringify(args),
    runnerName: taskItem.runnerName,
    scope: taskItem.scope,
    jsonPath: join(taskItem.projectionDirPath, `${taskItem.runnerName}.json`)
  }
}

async function clearProcessQueue(taskId?: number, processId?: string) {
  if (taskId !== undefined && processId !== undefined) {
    for (let index = 0; index < processQueueCluster.length; index++) {
      const taskQueue = processQueueCluster[index]
      if (taskQueue.processId === processId) {
        const currentWindow = taskQueue.currentWindow
        for (let linearIndex = 0; linearIndex < taskQueue.compileProcess.length; linearIndex++) {
          const taskItems: CompileProcessItem[] = taskQueue.compileProcess[linearIndex]
          for (let parallelIndex = 0; parallelIndex < taskItems.length; parallelIndex++) {
            const taskItem: CompileProcessItem = taskItems[parallelIndex]
            if (!taskItem.killed && !taskItem.finished) {
              taskItem.killed = true
              taskItem.finished = true
            }
          }
        }
        for (let linearIndex = 0; linearIndex < taskQueue.modelProcess.length; linearIndex++) {
          const taskItems: ModelProcessItem[] = taskQueue.modelProcess[linearIndex]
          for (let parallelIndex = 0; parallelIndex < taskItems.length; parallelIndex++) {
            const taskItem: ModelProcessItem = taskItems[parallelIndex]
            if (!taskItem.killed && !taskItem.finished) {
            // if (!taskItem.killed) {
              taskItem.killed = true
              taskItem.finished = true
              const processType = ProcessType.modelRun
              webContents.send(taskQueue.userSpace, currentWindow, 'task:updateStatus', taskItem.taskId, processType, 8)
            }
          }
        }
        break
      }
    }
  }
}

async function runProcessQueue() {
  ++runningProcess
  checkProcessClustor()
  if (checkingProcess > 0) return
  for (let index = 0; index < processQueueCluster.length; index++) {
    const taskQueue: ProcessQueue = processQueueCluster[index]
    const currentWindow = taskQueue.currentWindow
    for (let linearIndex = 0; linearIndex < taskQueue.compileProcess.length; linearIndex++) {
      const taskItems: CompileProcessItem[] = taskQueue.compileProcess[linearIndex]
      for (let parallelIndex = 0; parallelIndex < taskItems.length; parallelIndex++) {
        const taskItem: CompileProcessItem = taskItems[parallelIndex]
        if (!taskItem.runned) {
          if (taskItem.killed) {
          } else if (cpuAvailable > 1) {
            taskItem.runned = true
            const { compileTempOutputPath, projectionDirPath, modelName } = taskItem
            // TODO check where to get useCompileServer
            taskItem.finished = await compileProcess(compileTempOutputPath, projectionDirPath, modelName, taskItem.taskId, taskQueue.processId, false, currentWindow, taskQueue.userSpace)
            --runningProcess
            return
          }
        }
      }
    }
    let lastLinearRunned = true
    let lineScheme = []
    for (let linearIndex = 0; linearIndex < taskQueue.modelProcess.length; linearIndex++) {
      const taskItems: ModelProcessItem[] = taskQueue.modelProcess[linearIndex]
      const compileItems: CompileProcessItem[] = taskQueue.compileProcess[linearIndex]
      let parallelScheme: ClusterProcessItem[] = []
      if (lastLinearRunned) {
        for (let parallelIndex = 0; parallelIndex < taskItems.length; parallelIndex++) {
          const taskItem: ModelProcessItem = taskItems[parallelIndex]
          const compileItem: CompileProcessItem = compileItems[parallelIndex]
          if (!taskItem.runned && compileItem.finished) {
            if (taskItem.killed) {
              taskItem.runned = true
              taskItem.finished = true
            } else {
              const { projectionDirPath, runnerName, modelName, taskId } = taskItem
              let normalizedPath = projectionDirPath
              const args = [normalizedPath, '-r', runnerName, '-m', modelName]
              if (taskQueue.useCluster) {
                let clustScheme = await generateClusterScheme(taskItem, linearIndex, parallelIndex, args, normalizedPath)
                parallelScheme.push(clustScheme)
              } else {
                const cpuOccupy = taskItem.threadNumber === -1 ? maxCpuPerUser : (taskItem.threadNumber > maxCpuPerUser ? maxCpuPerUser : taskItem.threadNumber)
                lastLinearRunned = false
                if (cpuAvailable >= cpuOccupy) {
                  console.log('runned', runnerName, cpuAvailable)
                  cpuAvailable = cpuAvailable - cpuOccupy
                  taskItem.runned = true
                  const newrun = new Promise(resolve => {
                    return runScript(runPath, args, currentWindow, taskId, taskQueue.processId, ProcessType.modelRun, cpuOccupy, taskQueue.userSpace, resolve)
                  }).then(() => {
                    taskItem.finished = true
                  })
                }
              }
            }
          } else if (!taskItem.finished) {
            lastLinearRunned = false
          }
        }
        lineScheme.push(parallelScheme)
      } else {
        break
      }
    }
    if (taskQueue.useCluster && taskQueue.namespace && !taskQueue.isClusterTaskSent) {
      taskQueue.isClusterTaskSent = true
      await handleEachTask(lineScheme, taskQueue.processId, taskQueue.namespace, currentWindow, taskQueue.userSpace)
    }
  }
  --runningProcess
}

async function handleEachTask(taskScheme: Array<Array<ClusterProcessItem>>, processId: string, namespace: string, currentWindow: BrowserWindow, userSpace: string): Promise<void> {
  let taskConfig: taskConfig = {
    processId,
    namespace,
    userSpace,
    apiVersion: '1' // TODO check
  }
  let isActive = await command.tools.isActive(namespace, processId)
  if (!isActive.success) {
    webContents.send(userSpace, currentWindow, 'task:close', -3) // error when starting cluster
    let msg = (isActive.workerLen === 0) ? 'No worker under tag.' : 'Cluster Server connection lost.'
    for (let i = 0; i < processQueueCluster.length; i++) {
      if (processQueueCluster[i].processId === processId) {
        let parallelItemList = processQueueCluster[i].modelProcess
        for (let j = 0; j < parallelItemList.length; j++) {
          for (let k = 0; k < parallelItemList[j].length; k++) {
            let modelItem = processQueueCluster[i].modelProcess[j][k]
            webContents.send(userSpace, currentWindow, 'task:updateStatus', modelItem.taskId, ProcessType.modelRun, 5)
            webContents.send(userSpace, currentWindow, 'task:error', msg, modelItem.taskId)
          }
        }
      }
    }
  } else {
    let ret = await command.task.createTask(taskConfig, taskScheme, processQueueCluster)
    if (ret.taskId) {
      let startRet = await command.task.startTask(ret.taskId, processQueueCluster, processId)
      console.log('start on cluster:', startRet.success)
      if (!startRet.success && startRet.isStopped) {
        // 准备任务文件时间较长，可能在此过程中终止任务
        // let retCode = startRet.isStopped ? 5 : 9
        for (let line of taskScheme) {
          for (let item of line) {
            webContents.send(userSpace, currentWindow, 'task:updateStatus', item.novaTaskId, ProcessType.modelRun, 5)
          }
        }
      }
    } else {
      console.log('Create task error:', ret)
      if (taskScheme.length > 0) {
        let aimProcess = processQueueCluster.find(ele => ele.processId === processId)
        if (aimProcess) {
          for (let line of aimProcess.modelProcess) {
            for (let item of line) {
              item.killed = true
              webContents.send(userSpace, currentWindow, 'task:updateStatus', item.taskId, ProcessType.modelRun, 9)
            }
          }
        }
      }
    }
  }
}

function updatePidAfterChildStarted(pid: number, processId: string, processType: ProcessType, taskId: number) {
  for (let i = 0; i < processQueueCluster.length; i++) {
    if (processQueueCluster[i].processId === processId) {
      let itemSequence
      if (processType === 'compile') itemSequence = processQueueCluster[i].compileProcess
      else itemSequence = processQueueCluster[i].modelProcess
      for (let j = 0; j < itemSequence.length; j++) {
        for (let k = 0; k < itemSequence[j].length; k++) {
          if (itemSequence[j][k].taskId === taskId) {
            itemSequence[j][k].pid = pid
          }
        }
      }
    }
  }
}

function runScript(path: string, args: string[], window: BrowserWindow, taskId: number | undefined, processId: string | undefined, processType: ProcessType, cpuOccupy: number, userSpace:string, resolve: any) {
  let pid = -1
  try {
    // @ts-ignore
    const child = fork(path, args, { stdio: 'pipe' })
    pid = child.pid
    if (processType === ProcessType.modelRun) webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, 0)
    if (!!processId && !!taskId) {
      // only compile before run
      updatePidAfterChildStarted(pid, processId, processType, taskId)
    }
    webContents.send(userSpace, window, 'task:pid', taskId, processType, child.pid)

    child.stdout?.on('data', async data => {
      webContents.send(userSpace, window, 'task:newPrintLines', data.toString(), taskId)
    })
    child.stderr?.on('data', async data => {
      webContents.send(userSpace, window, 'task:error', data.toString(), taskId)
    })
    child.on('close', (code) => {
      console.log('child close code:', code)
      webContents.send(userSpace, window, 'task:close', code)

      if (code === 0) {
        console.log('taskid', taskId)
        cpuAvailable = cpuAvailable + cpuOccupy

        webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, 1)

        setTimeout(() => runProcessQueue(), 50)
        resolve(true)
      } else if (code === 1) { // model stop
        console.log('taskid', taskId)
        cpuAvailable = cpuAvailable + cpuOccupy

        webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, 4)

        setTimeout(() => runProcessQueue(), 50)
        resolve(true)
      } else if (code === -2 || code === 254) { // model point skip
        console.log('taskid', taskId)
        cpuAvailable = cpuAvailable + cpuOccupy

        webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, 3)

        setTimeout(() => runProcessQueue(), 50)
        resolve(true)
      } else {
        cpuAvailable = cpuAvailable + cpuOccupy
        let statusCode = 2
        if (code === null) statusCode = 4 // 主动终止
        webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, statusCode)

        if (processType !== ProcessType.compile) {
          setTimeout(() => runProcessQueue(), 50)
        } else {
          clearProcessQueue(taskId, processId)
        }
        resolve(false)
      }
    })
    child.on('error', (code) => {
      webContents.send(userSpace, window, 'task:error', code, taskId)
      webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, 2)
      cpuAvailable = cpuAvailable + cpuOccupy
      if (processType !== ProcessType.compile) {
        setTimeout(() => runProcessQueue(), 50)
      } else {
        clearProcessQueue(taskId, processId)
      }
      resolve(false)
    })
  } catch (e) {
    console.log(false)
    webContents.send(userSpace, window, 'task:error', 'Child process uncaught error', taskId)
    webContents.send(userSpace, window, 'task:updateStatus', taskId, processType, 2)

    cpuAvailable = cpuAvailable + cpuOccupy
    setTimeout(() => runProcessQueue(), 50)
    resolve(false)
  }
}

async function remoteCompile(args: any[], currentWindow: any) {
  return ajaxRequest.request({ // should use call back function not await
    method: 'post',
    url: '/tasks/runScript',
    data: {
      path: compilePath,
      args,
      window: currentWindow,
      taskId: undefined,
      processType: ProcessType.compile,
      cpuOccupy: maxCpuPerUser,
      useCluster: undefined,
      namespace: undefined
    }
  })
}
async function compileProcess(compileTempOutputPath: string, projectionOutputPath: string, modelName: string, taskId: number | undefined, processId: string | undefined, useCompileServer: boolean, currentWindow: any, userSpace:string): Promise<boolean> {
  const cpuOccupy = (cpuAvailable > 1 ? cpuAvailable - 1 : 1) // todo server should has different cpuAvailable
  cpuAvailable = cpuAvailable - cpuOccupy
  let commandTaskPath = taskPath
  let normalizedProjectionOutputPath = projectionOutputPath
  // if (process.platform === 'win32') {
  //   commandTaskPath = await buildNormalizePathForWindows(commandTaskPath)
  //   // normalizedProjectionOutputPath = await buildNormalizePathForWindows(normalizedProjectionOutputPath)
  // }
  let args = [
    compileTempOutputPath,
    '-m', modelName,
    '-c', commandTaskPath,
    '-p', normalizedProjectionOutputPath,
    '-t', cpuOccupy
  ]
  if (useCompileServer) {
    let res = await remoteCompile(args, currentWindow)
    return new Promise(resolve => {
      resolve(res)
    })
  } else {
    return new Promise(resolve => {
      runScript(compilePath, args, currentWindow, taskId, processId, ProcessType.compile, cpuOccupy, userSpace, resolve)
    })
  }
}

async function taskCompileModel(event: any, compileTempOutputPath: string, projectionOutputPath: string, modelName: string, useCompileServer: boolean, userSpace:string) {
  let currentWindow: any
  if (process.env.ARCHITECTURE !== 'bs') {
    currentWindow = BrowserWindow.fromWebContents(event.sender)!
  }
  await compileProcess(compileTempOutputPath, projectionOutputPath, modelName, undefined, undefined, useCompileServer, currentWindow, userSpace)
}

const taskStopProcess = async (event:any, userSpace:string, pid: number, processId?:string) => {
  return new Promise(resolve => {
    stopProcess(userSpace, pid, resolve, processId)
  })
}

function setTaskWaitingBeforeRun(taskQueue: ProcessQueue) {
  for (let i = 0; i < taskQueue.modelProcess.length; i++) {
    for (let j = 0; j < taskQueue.modelProcess[i].length; j++) {
      webContents.send(taskQueue.userSpace, taskQueue.currentWindow, 'task:updateStatus', taskQueue.modelProcess[i][j].taskId, ProcessType.modelRun, 7)
    }
  }
}

function getTaskTmpDir(taskId: number): string {
  return join('tmp', taskId.toString())
}

module.exports.getTaskTmpDir = getTaskTmpDir
// module.exports.userSpace = ''
module.exports.taskCompileModel = taskCompileModel
module.exports.taskStopProcess = taskStopProcess

export const registerRenderProcessMessageHandlers = function () {
  // Compile and run tasks
  ipcMain.handle('task:compileModel', taskCompileModel)
  // stop Compile
  ipcMain.handle('task:stopProcess', taskStopProcess)
  // get runner settings tmp dir
  ipcMain.on('task:tmpDir', (event, taskId) => {
    event.returnValue = getTaskTmpDir(taskId)
  })
  ipcMain.handle('task:runProjection', async (event, projectionDirPath: string, runnerName: string, modelName: string, taskId: number, processId: string) => {
    const scriptPath = app.isPackaged
      ? join(__dirname, '../tasks/run.js')
      : join(__dirname, '../../tasks/run.js')
    let normalizedPath = projectionDirPath
    // if (process.platform === 'win32') {
    //   normalizedPath = await buildNormalizePathForWindows(normalizedPath)
    // }
    const currentWindow = BrowserWindow.fromWebContents(event.sender)!
    return new Promise(resolve => {
      runScript(scriptPath, [normalizedPath, '-r', runnerName, '-m', modelName], currentWindow, taskId, processId, ProcessType.modelRun, maxCpuPerUser, '', resolve)
    })
  })
  ipcMain.handle('task:addProcessQueue', taskAddProcessQueue)
}
function taskAddProcessQueue(event: any, taskQueue: ProcessQueue) {
  let currentWindow
  if (process.env.ARCHITECTURE === 'bs') {

  } else {
    currentWindow = BrowserWindow.fromWebContents(event.sender)!
  }
  taskQueue.currentWindow = currentWindow
  processQueueCluster.push(taskQueue)
  setTaskWaitingBeforeRun(taskQueue)
  setTimeout(() => runProcessQueue(), 50)
}
module.exports.taskAddProcessQueue = taskAddProcessQueue

export function unregisterRenderProcessMessageHandlers() {
  ipcMain.removeHandler('task:compileModel')
  ipcMain.removeHandler('task:stopProcess')
  ipcMain.removeHandler('task:runProjection')
  ipcMain.removeHandler('task:addProcessQueue')
}

async function buildNormalizePathForWindows(path: string): Promise<string> {
  let normalizedPath = path
  // get shortname for path
  // so when there is a space in path, the mingw will work too
  const { stdout } = await promisify(exec)(`cmd /c for %A in ("${normalizedPath}") do @echo %~sA`)
  normalizedPath = stdout.replace(/(\r\n|\n|\r)/gm, '')
  return normalizedPath
}
