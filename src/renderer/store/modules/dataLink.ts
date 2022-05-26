import { clone } from '@shared/functional'
import { ModuleOption } from '../definition'
import { DataLink, DataLinkFile, DataLinkNavigationNode } from '@shared/dataModelTypes/dataLink'
import { UnsavedDataLinkExistsError } from '../../errors'
import { useDataCleanAPIs, useDataInputsAPIs } from '../../hooks/apis'
import { fill } from 'lodash'
import { ToDateStringFormats } from 'xe-utils'

interface State {
  currDataLink: DataLink | null
  dataLinks: DataLink[]
  file: DataLinkFile[] | null
  temDataLink: DataLink | null
  // file:DataLinkFile |undefined

}

interface Getters {
  dataNaviTree: DataLinkNavigationNode[]
}
interface Mutations {
  resetDataLink: void
  queryDataFromDb: DataLink[]
  queryDataFromDbAdd: DataLink[]

  addDataLinkNaviTree: DataLink
  deleteDataLinkNaviTree: string
  updateCurrentDataLink: DataLink
  legalizeTemporaryDataLink: DataLink
  deleteDataSourceForNavTree: number[]
  insertDataImportAdd: any[]
  updateDataImportAdd: any[],
  updateDatalinkName: Partial<DataLink>
  updateNavName: Partial<any>
}

interface Actions {
  addLinkDialog: (dataLink: DataLink) => boolean
  saveUpdatedCurrentDataLinkToDB: () => void
  queryCurrentDataLists: (isAdd: boolean) => any
  deleteDataLink: (name: string) => void
  selectUnsavedNewDataLinkExists: () => void
  addDataLinkFile: (payload: DataLinkFile) => void
  deleteDataCleanSource: (ids: number[]) => boolean
  insertDataCleanSourceImpotToDB: (dataLinkFile: DataLinkFile[]) => boolean
  updateDataCleanFilesBatchWithDBSync: (dataLinkFile: DataLinkFile[]) => boolean
  rollBackDataInputName: (payload: any) => void
  navNameChange: (payload:any) => void
}

export type DataLinkModule = ModuleOption<State, Getters, Mutations, Actions>;
const mod: DataLinkModule = {
  namespaced: true,
  state: {
    currDataLink: null,
    dataLinks: [],
    file: [],
    temDataLink: null
  },
  mutations: {
    resetDataLink(state) {
      state.currDataLink = null
      state.dataLinks = []
      state.file = []
    },
    updateDatalinkName(state, datalink:any) {
      state.file?.forEach((item:any) => {
        if (item.id === datalink.id) {
          item.name = datalink.name
        }
      })
    },
    updateNavName(state, nameObj: any) {
      state.dataLinks.forEach(item => {
        if (item.name === nameObj.curName) {
          if (item.fileList.length) {
            item.fileList.forEach((forItem:any) => {
              forItem.navName = nameObj.newName
            })
          }
          item.name = nameObj.newName
        }
      })
    },
    queryDataFromDb(state, dataLinks: DataLink[]) {
      if (!dataLinks.length) return
      state.dataLinks.length = 0
      state.dataLinks.push(...dataLinks)
      if (!state.currDataLink) {
        state.currDataLink = dataLinks[0]
        state.file = dataLinks[0].fileList
      }
    },
    queryDataFromDbAdd(state, dataLinks: DataLink[]) {
      state.dataLinks.length = 0
      state.dataLinks.push(...dataLinks)

      state.currDataLink = dataLinks[dataLinks.length - 1]
      state.file = dataLinks[dataLinks.length - 1].fileList
    },
    addDataLinkNaviTree(state, temDataLink: DataLink) {
      state.temDataLink = temDataLink
      state.dataLinks.push(temDataLink)
      state.currDataLink = temDataLink
      state.file = temDataLink.fileList
    },
    deleteDataLinkNaviTree(state, name) {
      const index = state.dataLinks.findIndex(node => node.name === name)
      index > -1 && state.dataLinks.splice(index, 1)

      if (!state.dataLinks.length) {
        state.file = null
      } else {
        state.file = state.dataLinks[state.dataLinks.length - 1].fileList
      }
      // state.file = null
    },
    updateCurrentDataLink(state, currDataLink: DataLink) {
      const curDataLink = state.dataLinks.filter(fil => { return fil.name === currDataLink.name })[0]
      state.file = curDataLink.fileList
      state.currDataLink = curDataLink
    },
    legalizeTemporaryDataLink(state, legalDataLink: DataLink) {
      state.dataLinks[state.dataLinks.length - 1] = legalDataLink
      state.currDataLink = legalDataLink
      state.temDataLink = null
    },
    deleteDataSourceForNavTree(state, ids) {
      ids.map(id => {
        state.currDataLink?.fileList.map((file, index) => {
          if (file.id === id) {
            state.currDataLink?.fileList.splice(index, 1)
          }
        })
        state.dataLinks.map((data, dataIndex) => {
          data?.fileList.map((file, index) => {
            if (file.id === id) {
              state.dataLinks[dataIndex]?.fileList.splice(index, 1)
            }
          })
        })
      })
    },
    insertDataImportAdd(state, addArr) {
      //  state.currDataLink?.fileList.push(...addArr)
      state.dataLinks.map((item, index) => {
        if (item.name === state.currDataLink?.name) {
          state.dataLinks[index].fileList.push(...addArr)
        }
      })
    },
    updateDataImportAdd(state, addArr) {
      //  state.currDataLink?.fileList.push(...addArr)
      state.dataLinks.map((item, index) => {
        if (item.name === state.currDataLink?.name) {
          //  state.dataLinks[index].fileList.push(...addArr)
          state.dataLinks[index].fileList.map((files, fIndex) => {
            addArr.map((addFile, aIndex) => {
              if (files.id === addFile.id) {
                state.dataLinks[index].fileList[fIndex] = addFile
              }
            })
          })
        }
      })
    }
  },
  getters: {
    dataNaviTree(state, getters, rootState): DataLinkNavigationNode[] {
      return state.dataLinks.map((node, index) => {
        return {
          id: index,
          name: node.name,
          type: node.type,
          isRename: false
        }
      })
    }
  },
  actions: {
    async addDataLinkFile({ commit, rootState }, dataLinkFile) {
    },
    async rollBackDataInputName({ commit }, payload): Promise<void> {
      await useDataCleanAPIs().db.queryDataCleanSource(payload.id).then((result) => {
        commit('updateDatalinkName', result[0])
      })
    },
    async navNameChange({ commit, rootState }, payload): Promise<void> {
      // curName:sting, newName:sting
      await useDataCleanAPIs().db.renameDataLinkNavName(payload.curName, payload.newName)
      commit('updateNavName', payload)
    },
    async selectUnsavedNewDataLinkExists({ commit, state }): Promise<void> {
      return new Promise((resolve, reject) => {
        if (state.temDataLink) {
          commit('updateCurrentDataLink', state.temDataLink)
          reject(new UnsavedDataLinkExistsError(state.temDataLink.name))
        } else {
          resolve()
        }
      })
    },
    async addLinkDialog({ commit, dispatch, rootState }, newDataLink: DataLink): Promise<boolean> {
      const isExists = await useDataCleanAPIs().db.checkDataNavigationNameExists(newDataLink.name)
      if (isExists) {
        return isExists
      } else {
        const temDataLink: DataLink = {
          //  id: 0,
          name: newDataLink.name,
          type: newDataLink.type,
          file: newDataLink.file,
          fileList: newDataLink.fileList
        }
        commit('addDataLinkNaviTree', temDataLink)
        commit('updateCurrentDataLink', temDataLink)
        return isExists
      }
    },
    async deleteDataLink({ state, commit }, name: string): Promise<void> {
      if (state.currDataLink?.name === name) {
        const index = state.dataLinks.findIndex(p => p.name === name)
        if (index === 0 && state.dataLinks.length === 1) {
          state.currDataLink = null
        } else if (index === 0 && state.dataLinks.length > 1) {
          state.currDataLink = state.dataLinks[1]
        } else {
          state.currDataLink = state.dataLinks[index - 1]
        }
      }
      // state.file = null
      state.dataLinks = state.dataLinks.filter(item => item.name !== name)
      commit('deleteDataLinkNaviTree', name)
      await useDataCleanAPIs().db.deleteDataCleanSource(name)
    },
    async saveUpdatedCurrentDataLinkToDB({ commit, state, rootState }): Promise<void> {
      try {
        const dataLinkToUpdate = clone(state.currDataLink)
        const ids = await useDataCleanAPIs().db.insertDataCleanSource(dataLinkToUpdate, rootState.workspace.id)
      } catch (error) {
        console.log('saveUpdatedCurrentDataLinkToDB error:', error)
      }
    },
    async queryCurrentDataLists({ commit, state, rootState }, isAdd: boolean): Promise<any> {
      const results = await useDataCleanAPIs().db.queryAllDataCleanSources(rootState.workspace.id)
      // state.dataLinks.push(...result)
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        for (let j = 0; j < result.fileList.length; j++) {
          const fileList = result.fileList[j]
          if (fileList.isRelative) {
            fileList.absolutePath = useDataInputsAPIs().pathJoin(rootState.workspace.dirPath, fileList.relativePath)
          }
        }
      }
      if (isAdd) {
        commit('queryDataFromDbAdd', results)
      } else {
        commit('queryDataFromDb', results)
      }

      return results
    },
    async deleteDataCleanSource({ commit, dispatch, state, rootState }, ids: number[]): Promise<boolean> {
      const result = await useDataCleanAPIs().db.deleteDataCleanSourceByIds(ids)
      commit('deleteDataSourceForNavTree', ids)

      return true
    },
    async insertDataCleanSourceImpotToDB({ commit, dispatch, state, rootState }, dataLinkFile: DataLinkFile[]): Promise<boolean> {
      const newAddArr = [] as any[]
      await dataLinkFile.map(item => {
        newAddArr.push(
          {
            ImportTime: item.updatedAt,
            absolutePath: item.absolutePath,
            dataType: 'csv',
            fields: item.size,
            headerExists: true,
            isRelative: item.isRelative,
            modelId: 0,
            name: item.name,
            navName: state.currDataLink?.name,
            path: item.isRelative ? item.relativePath : item.absolutePath,
            relativePath: item.relativePath,
            size: item.size,
            updatedAt: item.updatedAt,
            workspaceId: rootState.workspace.id
          }
        )
      })
      const ids = await useDataCleanAPIs().db.insertDataCleanSourceImpot(newAddArr, rootState.workspace.id)
      newAddArr.map((item: any, index) => {
        item.id = ids[index]
      })
      commit('insertDataImportAdd', newAddArr)
      return true
    },
    async updateDataCleanFilesBatchWithDBSync({ commit, dispatch, state, rootState }, dataLinkFile: DataLinkFile[]): Promise<boolean> {
      const newDataLinkFile = clone(dataLinkFile)
      const ids = await useDataCleanAPIs().db.updateDataCleanSourceImpot(newDataLinkFile, rootState.workspace.id)

      commit('updateDataImportAdd', newDataLinkFile)
      return true
    }
  }
}
export default mod
