
import { Project, ProjectDataSource, ProjectNav } from '@shared/dataModelTypes/project/index'
import { DataCleanProject } from '@shared/dataModelTypes/dataClean'
import { ModuleOption } from '../definition'
import { clone } from '@shared/functional'
import { useDataCleanAPIs, useDataInputsAPIs } from '../../hooks/apis'
import { asyncForEach } from '@shared/commonUtils'
interface DataSurceVariables {
  name: string,
  source: string
}
interface CurrentDataSurceVariable {
  currentPath: string,
  outputsPathArr: string[],
  id: string | number
}
interface State {
  projects: Project[]
  temProject: Project | null
  currProject: Project | null
  showOutPutView: boolean
  formulaItemShow: boolean
  dataSurceVariables: DataSurceVariables[]
  dataSurceOutputVariables: DataSurceVariables[],
  currentDataSurceVariable: CurrentDataSurceVariable | null,
  // projectsNav: ProjectNav[]
}
interface Getters {
  projects: Project[]
  projectsNav: ProjectNav[]
}
interface Mutations {
  updateCurrentProject: Project
  addTemProjectNaviTree: Project
  legalizeTemporaryProject: Project
  initCleanProjects: DataCleanProject[]
  addDataSource: any
  updateCoding: any
  updataOutput: any
  deleteOutput: any
  deleteDataSource: any
  deleteProjectNaviTree: number
  showOutPutView: Project
  hideOutPutView: Project
  addCurrentDataSurceVariable: any
  showFormulaItem: boolean,
  hideFormulaItem: boolean,
  addDataSurceVariables: DataSurceVariables[] | []
  addDataSurceOutputVariables: any[] | []
}
interface Actions {
  addProjectDataSourceDialog: (projectDataSource: ProjectDataSource) => void
  addProjectCodingDialog: (projectDataSource: ProjectDataSource) => void
  addNewProject: (project: Project) => void
  deleteProject: (id: number) => void
  formatDataSource:(linksArr:any[])=>void
  createNewCleanProject: (project: Project) => void
  updateCleanProjectName: (project: Project) => void
  createNewEmptyCleanProject: (project: Project) => void
  createNewCleanProjectOutput: (projectOutput: any) => void
  updateCleanProjectOutputName: (projectOutput: any) => void
  updateCleanProjectOutput: (projectOutput: any) => void
  updateProjectToDB: (id: number) => void
  queryAllCleanProjectFromDB: () => void
  deleteProjectOutput: (deleteOutput: any) => void
  deleteProjectDataSource: (deleteOutput: any) => void
  formatDataSurceVariables: (filePth:any) => void
  formatDataSurceOutputVariables: (dataSourceArr: any[]) => void
  updateCurrentProjectActions: (project: Project) => void
  // updateProjectVarPageWithDBSync : () => void
}

export type ProjectModule = ModuleOption<State, Getters, Mutations, Actions>;
const mod: ProjectModule = {
  namespaced: true,
  state: {
    projects: [] as Project[],
    temProject: null,
    currProject: null,
    showOutPutView: false,
    formulaItemShow: false,
    dataSurceVariables: [] as DataSurceVariables[],
    dataSurceOutputVariables: [] as any[],
    currentDataSurceVariable: null
    // projectsNav: [] as ProjectNav[]
  },
  getters: {
    projects: state => state.projects,
    projectsNav(state): ProjectNav[] {
      return state.projects.map(project => {
        return {
          id: project.id,
          name: project.name,
          type: project.type,
          status: project.status,
          parentId: project.parentId ? project.parentId : '0',
          children: project.children?.map(child => {
            return {
              id: child.id,
              name: child.name,
              type: child.type,
              parentId: child.parentId ? child.parentId : '0',
              children: child.children?.map((childchild: any) => {
                return {
                  id: childchild.id,
                  name: childchild.name,
                  type: child.type,
                  parentId: child.parentId ? child.parentId : '0',
                  children: []
                }
                // })
              })
            }
            // })
          })
        }
      })
      // return state.projectsNav
    }

  },
  // children: project.children?.map(child => {
  //   return {
  //     id: child.id,
  //     name: child.name,
  //     type: child.type,
  //     parentId: child.parentId ? child.parentId : '0',
  //     children: child.children
  //   }
  // })
  mutations: {
    showFormulaItem(state) {
      state.formulaItemShow = true
    },
    hideFormulaItem(state) {
      state.formulaItemShow = false
    },
    showOutPutView(state) {
      state.showOutPutView = true
    },
    hideOutPutView(state) {
      state.showOutPutView = false
    },
    addCurrentDataSurceVariable(state, dataSource) {
      const currentDataSurceVariable = {
        currentPath: dataSource.children[0]?.absolutePath,
        outputsPathArr: dataSource.children.map((item: any) => {
          return item.absolutePath
        })
      }
      // state.currentDataSurceVariable = currentDataSurceVariable
    },
    updateCurrentProject(state, currentProject) {
      state.currProject = currentProject
      // if (!currentProject.parentId || currentProject.parentId.toString() === '0') {
      //   const project = state.projects.find(project => {
      //     return project.id === currentProject.id
      //   })
      //   const curDataSource = project?.children.find((find) => {
      //     return find.type === 'dataSource'
      //   })

      //   if (curDataSource?.children.length) {
      //     state.currentDataSurceVariable = {
      //       id: curDataSource.parentId,
      //       currentPath: curDataSource.children[0]?.absolutePath,
      //       outputsPathArr: curDataSource.children.map((item: any) => {
      //         return item.absolutePath
      //       })
      //     }
      //   } else {
      //     state.currentDataSurceVariable = {
      //       id: curDataSource.parentId,
      //       currentPath: '',
      //       outputsPathArr: []
      //     }
      //   }
      //   state.currProject = project as Project
      //   return
      // }

      // if (state.currentDataSurceVariable && state.currentDataSurceVariable.id !== currentProject.parentId) {
      //   const newSurce = state.projects.find(project => {
      //     return project.id === currentProject.parentId
      //   })?.children.find(project => {
      //     return project.type === 'dataSource'
      //   })
      //   if (newSurce.children.length) {
      //     state.currentDataSurceVariable = {
      //       id: newSurce.parentId,
      //       currentPath: newSurce.children[0].absolutePath,
      //       outputsPathArr: newSurce.children.map((item: any) => {
      //         return item.absolutePath
      //       })
      //     }
      //   } else {
      //     state.currentDataSurceVariable = {
      //       id: newSurce.parentId,
      //       currentPath: '',
      //       outputsPathArr: []
      //     }
      //   }
      // }

      // const newFilter = state.projects.find(project => {
      //   return project.id === currentProject.parentId
      // })?.children.find(project => {
      //   return project.type === currentProject.type
      // })
      // if (newFilter?.type === 'coding') {
      //   state.currProject = newFilter as Project
      // } else if (!newFilter?.children.length) {
      //   state.currProject = newFilter as Project
      // } else {
      //   if (currentProject.children.length) {
      //     state.currProject = newFilter as Project
      //   } else {
      //     newFilter.children.forEach((filter: any) => {
      //       if (filter.id === currentProject.id) {
      //         state.currProject = filter

      //         if (newFilter.type === 'dataSource') {
      //           state.currentDataSurceVariable = {
      //             id: filter.parentId,
      //             currentPath: filter.absolutePath,
      //             outputsPathArr: newFilter.children.map((item: any) => {
      //               return item.absolutePath
      //             })
      //           }
      //         }
      //       }
      //     })
      //   }
      // }
    },
    addTemProjectNaviTree(state, tempProject: Project) {
      state.projects.push(tempProject)
      state.temProject = tempProject
      state.currProject = tempProject
    },
    deleteProjectNaviTree(state, projectId) {
      const index = state.projects.findIndex(node => node.id === projectId)
      index > -1 && state.projects.splice(index, 1)
      state.currProject = state.projects[0]
    },
    legalizeTemporaryProject(state, legalProject: Project) {
      state.projects[state.projects.length - 1] = legalProject
      state.currProject = legalProject
    },
    initCleanProjects(state, cleanProjects: DataCleanProject[]) {
      state.projects.length = 0
      if (cleanProjects.length) {
        for (let i = 0; i < cleanProjects.length; i++) {
          const cleanProject = cleanProjects[i]
          const newPreject: any = {
            id: cleanProject.id,
            name: cleanProject.name,
            parentId: 0,
            child: true,
            children: [
              { name: 'DataSource', type: 'dataSource', children: [], parentId: cleanProject.id },
              { name: 'Coding', type: 'coding', value: cleanProject.coding, parentId: cleanProject.id },
              { name: 'Output', type: 'output', children: [], parentId: cleanProject.id }
            ]
          }
          if (cleanProject.dataSources.length) {
            newPreject.children[0].children?.push(...cleanProject.dataSources)
          }
          if (cleanProject.outputs.length) {
            newPreject.children[2].children?.push(...cleanProject.outputs)
          }
          state.projects.push(newPreject)
          if (i === 0) {
            if (!state.currProject) state.currProject = newPreject
          }
        }
      }
    },
    addDataSource(state, dataSource: any) {
      state.projects.map((item: any) => {
        if (item.id === dataSource.id) {
          if (item.children[0].type === dataSource.type) {
            item.children[0].children = dataSource.fileList
          }
        }
      })
    },
    updateCoding(state, dataSource: any) {
      state.projects.map((item: any) => {
        if (item.id === dataSource.parentId) {
          if (item.children[1].type === dataSource.type) {
            item.children[1].value = dataSource.value
          }
        }
      })
    },
    updataOutput(state, projectOutput: any) {
      state.projects.map((item: any) => {
        if (item.id === projectOutput.parentId) {
          if (item.children[2].type === projectOutput.type) {
            item.children[2].children?.map((child: any) => {
              if (child.id === projectOutput.id) {
                child.value = projectOutput.value
              }
            })
          }
        }
      })
    },
    deleteOutput(state, deleteOutput: any) {
      state.projects.map((item: any) => {
        if (item.id === deleteOutput.parentId) {
          if (item.children[2].type === deleteOutput.type) {
            item.children[2].children.map((child: any, index: number) => {
              if (child.id === deleteOutput.id) {
                item.children[2].children.splice(index, 1)
                state.currProject = item.children[2]
              }
            })
          }
        }
      })
    },
    deleteDataSource(state, deleteOutput: any) {
      state.projects.map((item: any) => {
        if (item.id === deleteOutput.parentId) {
          if (item.children[0].type === deleteOutput.type) {
            item.children[0].children.map((child: any, index: number) => {
              if (child.id === deleteOutput.id) {
                item.children[0].children.splice(index, 1)
                state.currProject = item.children[0]
              }
            })
          }
        }
      })
    },
    addDataSurceVariables(state, dataSurceVariables) {
      state.dataSurceVariables.length = 0
      dataSurceVariables.map((item: any) => {
        state.dataSurceVariables.push(item)
      })
    },
    addDataSurceOutputVariables(state, dataSurceVariables) {
      state.dataSurceOutputVariables.length = 0
      dataSurceVariables.map((item: any) => {
        state.dataSurceOutputVariables.push(item)
      })
    }
  },
  actions: {
    async addNewProject({ commit, dispatch }, project: Project): Promise<void> {
      const tempProject: Project = {
        id: project.id,
        name: project.name,
        status: project.status,
        child: project.child,
        type: project.type,
        children: project.children
      }
      commit('addTemProjectNaviTree', tempProject)
    },
    async formatDataSurceVariables({ commit, dispatch }, datapath: any) {
      if (!datapath) {
        // this.addDataSurceVariables([])
        commit('addDataSurceVariables', [])
        return
      }
      const dataSource = [] as any[]
      const resultData = await useDataInputsAPIs().readCsvFile(datapath?.absolutePath.toString(), 10)
      await resultData.columns.map(item => {
        dataSource.push({ name: item, source: resultData.name + '(' + datapath.navName + ')', type: 'string' })
      })
      // this.addDataSurceVariables(this.dataSource)
      commit('addDataSurceVariables', dataSource)
    },
    async formatDataSurceOutputVariables({ commit, dispatch }, dataSourceArr: any[]) {
      // this.dataSource.length = 0
      if (!dataSourceArr.length) {
        commit('addDataSurceOutputVariables', [])
        return
      }
      const dataSourceAll = []
      for (let i = 0; i < dataSourceArr.length; i++) {
        const resultData = await useDataInputsAPIs().readCsvFile(dataSourceArr[i].absolutePath.toString(), 3)
        dataSourceAll.push(...resultData.columns)
      }
      const result = Array.from(new Set(dataSourceAll))
      // this.addDataSurceOutputVariables(result)
      commit('addDataSurceOutputVariables', result)
    },
    async updateCurrentProjectActions({ commit, dispatch, state }, currentProject: any): Promise<void> {
      if (!currentProject.parentId || currentProject.parentId.toString() === '0') {
        const project = state.projects.find(project => {
          return project.id === currentProject.id
        })
        const curDataSource = project?.children.find((find) => {
          return find.type === 'dataSource'
        })

        if (curDataSource?.children.length) {
          dispatch('formatDataSurceVariables', curDataSource.children[0])
          dispatch('formatDataSurceOutputVariables', curDataSource.children)
        } else {
          dispatch('formatDataSurceVariables', '')
          dispatch('formatDataSurceOutputVariables', [])
        }
        commit('updateCurrentProject', project)
        // state.currProject = project as Project
        return
      }

      if (state.currentDataSurceVariable && state.currentDataSurceVariable.id !== currentProject.parentId) {
        const newSurce = state.projects.find(project => {
          return project.id === currentProject.parentId
        })?.children.find(project => {
          return project.type === 'dataSource'
        })
        if (newSurce.children.length) {
          dispatch('formatDataSurceVariables', newSurce.children[0])
          dispatch('formatDataSurceOutputVariables', newSurce.children)
        } else {
          dispatch('formatDataSurceVariables', '')
          dispatch('formatDataSurceOutputVariables', [])
        }
      }

      const newFilter = state.projects.find(project => {
        return project.id === currentProject.parentId
      })?.children.find(project => {
        return project.type === currentProject.type
      })
      if (newFilter?.type === 'coding') {
        commit('updateCurrentProject', newFilter)
      } else if (!newFilter?.children.length) {
        commit('updateCurrentProject', newFilter)
        dispatch('formatDataSurceVariables', '')
        dispatch('formatDataSurceOutputVariables', [])
      } else {
        if (currentProject?.children?.length) {
          commit('updateCurrentProject', newFilter)
          const newFilter1 = state.projects.find(project => {
            return project.id === currentProject.parentId
          })?.children.find(project => {
            return project.type === 'dataSource'
          })
          if (newFilter1.children.length) {
            dispatch('formatDataSurceVariables', newFilter1.children[0])
            dispatch('formatDataSurceOutputVariables', newFilter1.children)
          } else {
            dispatch('formatDataSurceVariables', '')
            dispatch('formatDataSurceOutputVariables', [])
          }
        } else {
          if (newFilter?.type === 'dataSource') {
            newFilter.children.forEach((filter: any) => {
              if (filter.id === currentProject.id) {
                commit('updateCurrentProject', filter)
                //  if (newFilter.type === 'dataSource') {
                dispatch('formatDataSurceVariables', filter)
                dispatch('formatDataSurceOutputVariables', newFilter.children)
                //   }
              }
            })
          } else {
            const newFilter1 = state.projects.find(project => {
              return project.id === currentProject.parentId
            })?.children.find(project => {
              return project.type === 'dataSource'
            })
            newFilter.children.forEach((filter: any) => {
              if (filter.id === currentProject.id) {
                commit('updateCurrentProject', filter)
                dispatch('formatDataSurceOutputVariables', newFilter1.children)
              }
            })
          }
        }
      }
    },
    // async createNewEmptyCleanProject
    async createNewCleanProject({ commit, dispatch, rootState }, project: Project): Promise<void> {
      const dataCleanProject: DataCleanProject = {
        id: 0,
        name: project.name,
        workspaceId: rootState.workspace.id,
        createTime: new Date().getTime(),
        dataSources: [],
        outputs: [],
        coding: '',
        modelId: 0
      }
      const id = await useDataCleanAPIs().db.insertDataCleanProjects(dataCleanProject)
      dispatch('queryAllCleanProjectFromDB')
    },
    async updateCleanProjectName({ commit, dispatch, rootState }, project: Project): Promise<void> {
      const newProject = clone(project)
      await useDataCleanAPIs().db.updateDataCleanProjectname(newProject)
      dispatch('queryAllCleanProjectFromDB')
    },
    async createNewEmptyCleanProject({ commit, dispatch, rootState }, project: Project): Promise<void> {
      const tempProject: Project = {
        id: project.id,
        name: project.name,
        status: 1,
        child: project.child,
        type: project.type,
        children: project.children
      }
      commit('addTemProjectNaviTree', tempProject)
    },
    async createNewCleanProjectOutput({ state, commit, dispatch, rootState }, projectOutput: any): Promise<void> {
      //  commit('addNewOutput', projectOutput)
      const projects = clone(state.projects)
      state.projects.map(item => {
        if (item.id === projectOutput.parentId) {
          item.children[2].children.push(projectOutput)
        }
      })

      await dispatch('updateProjectToDB', projectOutput.parentId)
    },
    async updateCleanProjectOutputName({ state, commit, dispatch, rootState }, projectOutput: any): Promise<void> {
      //  commit('addNewOutput', projectOutput)
      const projects = clone(state.projects)
      state.projects.map(item => {
        if (item.id === projectOutput.parentId) {
          item.children[2].children.map((itemChild:any) => {
            if (itemChild.id === projectOutput.id) {
              itemChild.name = projectOutput.name
            }
          })
        }
      })

      await dispatch('updateProjectToDB', projectOutput.parentId)
    },
    async deleteProject({ commit, dispatch }, id: number): Promise<void> {
      await useDataCleanAPIs().db.deleteDataCleanProjects(id)
      commit('deleteProjectNaviTree', id)
    },
    async formatDataSource({ state, commit, dispatch }, linksArr: any[]): Promise<void> {
      const projects = clone(state.projects)
      await asyncForEach(projects, async (project:any) => {
        await asyncForEach(project.children[0].children, async (projectChild:any, ind:any) => {
          const link = linksArr.filter(fil => { return fil.id === projectChild.id })
          if (link.length) {
            const name = link[0].name + '_' + link[0].navName + '_' + project.name
            project.children[0].children[ind] = clone(link[0])
            project.children[0].children[ind].name = name
            project.children[0].children[ind].projectName = project.name
          } else {
            const deleteChild = {
              id: projectChild.id,
              type: 'dataSource',
              parentId: project.id
            }
            project.children[0].children.splice(ind, 1)
            await commit('deleteDataSource', deleteChild)
          }
        })
        await useDataCleanAPIs().db.updateDataCleanProjects(clone(project))
      })
      await dispatch('queryAllCleanProjectFromDB')
    },
    async addProjectDataSourceDialog({ commit, dispatch, state }, projectDataSource: any): Promise<void> {
      commit('addDataSource', projectDataSource)
      await dispatch('updateProjectToDB', projectDataSource.id)
    },
    async addProjectCodingDialog({ commit, dispatch, state }, projectDataSource: any): Promise<void> {
      commit('updateCoding', projectDataSource)
      await dispatch('updateProjectToDB', projectDataSource.parentId)
    },
    async queryAllCleanProjectFromDB({ commit, dispatch, rootState }): Promise<void> {
      const resultsFromDB = await useDataCleanAPIs().db.queryDataCleanProjects(rootState.workspace.id)
      resultsFromDB.forEach((result: DataCleanProject) => {
        result.dataSources.forEach((dataSource: any) => {
          if (dataSource.isRelative) dataSource.absolutePath = useDataInputsAPIs().pathJoin(rootState.workspace.dirPath, dataSource.relativePath)
        })
      })
      commit('initCleanProjects', resultsFromDB)
    },
    async updateCleanProjectOutput({ commit, dispatch, rootState }, projectOutput: any): Promise<void> {
      commit('updataOutput', projectOutput)
      await dispatch('updateProjectToDB', projectOutput.parentId)
    },
    async deleteProjectOutput({ commit, dispatch }, deleteOutput): Promise<void> {
      commit('deleteOutput', deleteOutput)
      await dispatch('updateProjectToDB', deleteOutput.parentId)
    },
    async deleteProjectDataSource({ commit, dispatch }, deleteDataSource): Promise<void> {
      commit('deleteDataSource', deleteDataSource)
      await dispatch('updateProjectToDB', deleteDataSource.parentId)
    },
    async updateProjectToDB({ state }, id: number): Promise<void> {
      const projects = clone(state.projects)

      const updateData = projects.filter((filter: any) => {
        return filter.id === id
      })
      const dd = await useDataCleanAPIs().db.updateDataCleanProjects(updateData[0])
    }
  }
}
export default mod
