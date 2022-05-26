import { ModuleOption } from './../definition'
import { getModelNavigationNodeIdAndType } from '../../utils'
import { FileList } from '@shared/dataModelTypes/runs/assumption'
import { useAssumptionVarPagesAPIs } from '@/hooks/apis'
import type { FileTable, TabsStatus } from '@shared/dataModelTypes/assumptions/index'
import { clone } from '@shared/functional'

interface State {
  hideAssumptionTableNaviView: string
  tagsView: FileTable[]
  isExist: boolean,
  copyPath: {},
  fileList: FileList[]
}
interface foldersType {
  name: string,
  path: string,
  relative: boolean
  modelId: number
}
interface fileNavigationNode {
  id: number
  name: string
  folders: foldersType[]
  paths?: string[]
}

interface Getters {
  assumptionFileTableNaviTree: fileNavigationNode[]
  FileListModelIdMap: Map<number, FileList[]>
}
interface Mutations {
  ADD_TAGS_VIEW: FileTable
  DEL_TAGS_VIEW: FileTable
  CURRENT_TAGS_VIEW: FileTable
  // eslint-disable-next-line camelcase
  ChANGE_TAGS_SAVE_STATUS: TabsStatus
  resetFiles: void
  toggleAssumptionTableNaviViewDisplay: void
  copyPathSave: {}
  addFileList: FileList[]
  updateFileList: FileList[]
  deleteRefFileList: FileList
}

interface Actions {
  createNewFileList: (fileList: FileList) => void
  deleteReferenceFileList: (fileList: FileList) => void
  changeNewFileList: (fileList: FileList[]) => void
  delNoFileFilelist: (fileList: FileList[]) => void
  recoverFileListFromDB: () => void
}

export type assumptionFileTableModule = ModuleOption<State, Getters, Mutations, Actions>
const mod: assumptionFileTableModule = {
  namespaced: true,
  state: {
    hideAssumptionTableNaviView: '',
    tagsView: [
      // {
      //   label: '二级文件夹',
      //   isSave: true,
      //   curSelect: true,
      //   value: '1232edde'
      // }
    ],
    fileList: [],
    isExist: false,
    copyPath: {
      name: '',
      value: '',
      type: '',
      diDir: false
    }
  },
  getters: {
    FileListModelIdMap(state): Map<number, FileList[]> {
      return state.fileList.reduce((acc, cur) => {
        if (acc.get(cur.modelId)) {
          acc.get(cur.modelId)!.push(cur)
        } else {
          acc.set(cur.modelId, [cur])
        }
        return acc
      }, new Map<number, FileList[]>())
    },
    assumptionFileTableNaviTree(_, getters, rootState): fileNavigationNode[] {
      const modelNavigationTree = rootState.models.modelNavigationTree
      const assumptionFileTableNaviTree = modelNavigationTree.map(node => {
        const { id: modelId } = getModelNavigationNodeIdAndType(node.id as string)
        const fileOfThisModel = getters.FileListModelIdMap.get(modelId) ?? []
        return {
          id: modelId,
          name: node.name,
          folders: fileOfThisModel.map(file => {
            return file
          })
        }
      })

      return assumptionFileTableNaviTree
    }
  },
  mutations: {
    resetFiles(state) {
      state.tagsView = []
      state.isExist = false
      state.copyPath = {}
      state.fileList = []
    },
    toggleAssumptionTableNaviViewDisplay(state) {
      state.hideAssumptionTableNaviView = 'fileTable'
    },
    addFileList(state, FileList: FileList[]) {
      state.fileList.splice(state.fileList.length, 0, ...FileList)
    },
    updateFileList(state, FileList: FileList[]) {
      state.fileList.map((item, index) => {
        if (item.modelId === FileList[0].modelId) {
          for (let i = 0; i < FileList.length; i++) {
            if (item.name !== FileList[i].name) {
              item.name = FileList[i].name
              item.path = FileList[i].path
              item.relative = FileList[i].relative
              break
            }
          }
        }
      })
    },
    deleteRefFileList(state, FileList: FileList) {
      state.fileList.map((item, index) => {
        if (item.modelId === FileList.modelId && item.path === FileList.path) {
          state.fileList.splice(index, 1)
        }
      })
    },
    ADD_TAGS_VIEW(state, view) {
      console.log(state.tagsView, 'state.tagsViewstate.tagsView')
      state.tagsView.map((item, index) => {
        item.curSelect = false
        if (item.id === view.id) {
          state.isExist = true
          item.curSelect = true
        }
      })
      if (!state.isExist) {
        console.log(11)
        state.tagsView.push({
          id: view.id,
          name: view.name,
          label: view.label,
          isSave: view.isSave,
          curSelect: view.curSelect,
          value: view.value
        })
      } else {
        state.isExist = false
      }
      console.log(JSON.parse(JSON.stringify(state.tagsView)), 12212)
    },
    DEL_TAGS_VIEW: (state, view) => {
      for (const [i, v] of state.tagsView.entries()) {
        // eslint-disable-next-line eqeqeq
        if (v.id == view.id) {
          if (view.curSelect === true && i >= 1) {
            state.tagsView[(i - 1)].curSelect = true
          } else {

          }
          state.tagsView.splice(i, 1)
          break
        }
      }
    },
    CURRENT_TAGS_VIEW: (state, view) => {
      state.tagsView.map((item, index) => {
        item.curSelect = false
        if (item.id === view.id) {
          item.curSelect = true
        }
      })
    },
    ChANGE_TAGS_SAVE_STATUS: (state, view) => {
      if (view.type) {
        state.tagsView.map((item, index) => {
          if (item.id === view.id) {
            item.isSave = false
          }
        })
      } else {
        state.tagsView.map((item, index) => {
          if (item.id === view.id) {
            item.isSave = true
          }
        })
      }
    },
    copyPathSave: (state, view) => {
      state.copyPath = view
    }

  },
  actions: {
    async recoverFileListFromDB({ commit, state, rootState }): Promise<void> {
      commit('resetFiles')
      const FileList = await useAssumptionVarPagesAPIs().db.queryAllFileListFromDB(rootState.workspace.id)
      commit('addFileList', FileList)
    },
    async createNewFileList({ commit, state, getters, rootState }, FileList: FileList): Promise<void> {
      const newArr = clone(state.fileList)
      const resultArr: FileList[] = []
      newArr.map((item: FileList) => {
        if (item.modelId === FileList.modelId && item.path !== FileList.path) {
          resultArr.push(item)
        }
      })
      resultArr.push(FileList)
      return useAssumptionVarPagesAPIs().db.insertAssumptionFileListToDB(FileList.modelId, resultArr).then(result => {
        commit('addFileList', [FileList])
      })
    },
    async deleteReferenceFileList({ commit, state, rootState }, FileList: FileList): Promise<void> {
      const newArr = clone(state.fileList)
      const resultArr: FileList[] = []
      newArr.map((item: FileList) => {
        if (item.modelId === FileList.modelId && item.path !== FileList.path) {
          resultArr.push(item)
        }
      })
      return useAssumptionVarPagesAPIs().db.insertAssumptionFileListToDB(FileList.modelId, resultArr).then(result => {
        commit('deleteRefFileList', FileList)
      })
    },
    async changeNewFileList({ commit, state, rootState }, FileList: FileList[]): Promise<void> {
      const newArr = clone(state.fileList)
      const resultArr: FileList[] = []
      newArr.map((item: FileList) => {
        if (item.modelId === FileList[0].modelId) {
          if (item.path === FileList[0].path) {
            // item = FileList[1]
            resultArr.push(FileList[1])
          } else {
            resultArr.push(item)
          }
        }
      })
      return useAssumptionVarPagesAPIs().db.insertAssumptionFileListToDB(FileList[0].modelId, resultArr).then(result => {
        commit('updateFileList', resultArr)
      })
    },
    async delNoFileFilelist({ commit, state, rootState }, FileList: FileList[]): Promise<void> {
      const newArr = clone(state.fileList)
      const resultArr: FileList[] = []
      newArr.map((item: FileList) => {
        if (item.modelId !== FileList[0].modelId) {
          resultArr.push(item)
        }
      })
      resultArr.concat(FileList)// = [...FileList]
      return useAssumptionVarPagesAPIs().db.insertAssumptionFileListToDB(FileList[0].modelId, resultArr).then(result => {
        //  commit('updateFileList', resultArr)
        try { } catch {
          console.log('delNoFileFilelist')
        }
      })
    }
    // addVisitedViews: ({ commit }, view: FileTable) => {
    //   commit('ADD_TAGS_VIEW', view)
    // },
    // addVisitedViews: ({ commit }, payload: FileTable): Promise<any> => {
    //   return new Promise((resolve, reject) => {
    //     resolve(commit('ADD_TAGS_VIEW', payload))
    //   }).then(() => {
    //     return payload
    //   })
    // },

    // delVisitedViews({ commit }, view: {}) {
    //   commit('DEL_TAGS_VIEW', view)
    // },
    // copyPathSaveAction({ commit }, view: {}) {
    //   commit('copyPathSave', view)
    // },
    // changeTagsSaveStatus({ commit }, view: {}) {
    //   commit('ChANGE_TAGS_SAVE_STATUS', view)
    // }

  }
}

export default mod
