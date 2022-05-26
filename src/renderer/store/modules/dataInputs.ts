import { ModuleOption } from '../definition'
import { useDataInputsAPIs } from '../../hooks/apis'
import type { DataInputFile, SimplifiedModel, DataMappingItem } from '@shared/dataModelTypes'
import dataInputDataSource from './dataInputsDataSource'
import type { SimpleModelNavigationNode, ModelNavigationNode, Model } from '@shared/dataModelTypes/models/models'
import { ModelNavigationNodeType } from '@shared/dataModelTypes/models/models'
import modelsDataSource from './modelsDataSource'
import { omit, clone, once } from '@shared/functional'
import { getModelNavigationNodeIdAndType } from '../../utils'
interface State {
  files: DataInputFile[]
  currentDataModelNode: SimplifiedModel | undefined
  hideDataNaviView: boolean
}

interface Getters {
  dataNaviTree: SimpleModelNavigationNode[]
  dataInputIdMap: Map<number, DataInputFile>
  dataMappingItems: DataMappingItem[]
  getFiles: DataInputFile[]
  getDataModel: Model | undefined
}

interface Mutations {
  resetDataInputs: void
  addDataInputs: DataInputFile[],
  deleteDataInputs: number[]
  updateDataInputName: Partial<DataInputFile>
  switchModel: SimplifiedModel
  deleteModel: number
  toggleDataNaviViewDisplay: void
  updateDataInputsFiles: DataInputFile
}

interface Actions {
  addDataInputWithDBSync: (payload: DataInputFile) => void
  deleteDataInputsWithDBSync: (dataInputIDs: number[]) => void
  recoverDataInputsFromDB: () => void
  updateDataInputWithDBSync: (payload: DataInputFile) => void
  rollBackDataInputName: (payload: DataInputFile) => void
  deleteDataInputsInModelWithDBSync: (payload: number) => void
  updateDataInputsFilesWithDBSync: (payload: DataInputFile) => void
  updateDataInputsFilesBatchWithDBSync: (payload: DataInputFile[]) => void
  importDataInputsFilesWithDBSync: (payload: DataInputFile[]) => { code: number }
}

export type DataInputsModule = ModuleOption<State, Getters, Mutations, Actions>;

const mod: DataInputsModule = {
  namespaced: true,
  state: {
    files: [] as DataInputFile[],
    currentDataModelNode: undefined,
    hideDataNaviView: false
  },
  getters: {
    getFiles(state, getters, rootState): DataInputFile[] {
      if (!state.currentDataModelNode) return []
      return state.files.map((f) => {
        return {
          ...f,
          absolutePath: f.isRelative ? useDataInputsAPIs().pathJoin(rootState.workspace.dirPath, state.currentDataModelNode?.name as string, f.relativePath) : (f.absolutePath ? f.absolutePath : useDataInputsAPIs().pathJoin(rootState.workspace.dirPath, state.currentDataModelNode?.name as string, f.relativePath))
        }
      })
    },
    getDataModel(state, getters, rootState): Model | undefined {
      if (state.currentDataModelNode === undefined) return undefined
      const { id, type } = getModelNavigationNodeIdAndType(<string>state.currentDataModelNode.id)
      return omit(['detailedChildren'], modelsDataSource.getModel(id))
    },
    dataNaviTree(_, getters, rootState): SimpleModelNavigationNode[] {
      const modelNavigationTree: ModelNavigationNode[] = rootState.models.modelNavigationTree
      return dataInputDataSource.buildDataNavtionTree(modelNavigationTree)
    },
    dataInputIdMap(state): Map<number, DataInputFile> {
      return state.files.reduce((acc, cur) => {
        acc.set(cur.id, cur)
        return acc
      }, new Map<number, DataInputFile>())
    },
    dataMappingItems(state): DataMappingItem[] {
      if (state.currentDataModelNode === undefined) return []
      const { id, type } = getModelNavigationNodeIdAndType(<string>state.currentDataModelNode.id)
      const getDataMappingItemsStr = type === ModelNavigationNodeType.models
        ? 'getDataMappingItemsForAModel' : 'getDataMappingItemsForABlock'
      return state.currentDataModelNode
        ? modelsDataSource[getDataMappingItemsStr](id)
        : []
    }
  },
  mutations: {
    resetDataInputs(state) {
      state.files.length = 0
      state.currentDataModelNode = undefined
      dataInputDataSource.clear()
    },
    addDataInputs: (state, dataInputs) => {
      const newEntriesModel = dataInputs.filter((item: DataInputFile) => item.modelId)
      const newEntriesBlock = dataInputs.filter((item: DataInputFile) => item.blockId)
      dataInputDataSource.addNewEntriesToDataMap(newEntriesModel)
      dataInputDataSource.addNewEntriesToDataBlockMap(newEntriesBlock)
      if (state.currentDataModelNode === undefined) return
      const { id, type } = getModelNavigationNodeIdAndType(<string>state.currentDataModelNode.id)
      const getDataMappingItemsStr = type === ModelNavigationNodeType.models
        ? 'getCurrentFile' : 'getCurrentBlockFile'
      if (state.files === undefined) {
        state.files = [...(dataInputDataSource[getDataMappingItemsStr](id))]
      } else {
        dataInputs.forEach(item => {
          if (item.modelId === id || item.blockId === id) state.files.push(item)
        })
      }
    },
    deleteDataInputs: (state, dataInputIDs) => {
      if (state.currentDataModelNode === undefined) return
      const { id, type } = getModelNavigationNodeIdAndType(<string>state.currentDataModelNode.id)
      const getDataMappingItemsStr = type === ModelNavigationNodeType.models
        ? 'deleteFile' : 'deleteBlock'
      state.files = state.files.filter(f => !dataInputIDs.includes(f.id))
      dataInputDataSource[getDataMappingItemsStr](id, dataInputIDs)
    },
    updateDataInputName: (state, update) => {
      if (state.currentDataModelNode === undefined) return
      const { id, type } = getModelNavigationNodeIdAndType(<string>state.currentDataModelNode.id)
      const getDataMappingItemsStr = type === ModelNavigationNodeType.models
        ? 'updateFileName' : 'updateFileBlockName'
      const index = state.files.findIndex(f => f.id === update.id!)
      if (index > -1) {
        state.files[index].name = update.name!
        dataInputDataSource[getDataMappingItemsStr](id, update, index)
      }
    },
    switchModel: (state, currentNode) => {
      if (currentNode) {
        // if (state.currentDataModelNode) {
        //   if (currentNode.name === state.currentDataModelNode?.name && state.files.length > 0) return
        // }
        const { id, type } = getModelNavigationNodeIdAndType(currentNode.id as string)
        const getDataMappingItemsStr = type === ModelNavigationNodeType.models
          ? 'getCurrentFile' : 'getCurrentBlockFile'
        // console.log(type, 'type')
        const currentFiles = dataInputDataSource[getDataMappingItemsStr](id)
        // console.log(currentFiles, 'currentFiles')

        state.currentDataModelNode = currentNode
        state.files.length = 0
        if (currentFiles) {
          currentFiles.forEach(item => {
            state.files.push(item)
          })
        }
      } else {
        state.currentDataModelNode = undefined
        state.files.length = 0
      }
    },
    toggleDataNaviViewDisplay(state) {
      state.hideDataNaviView = !state.hideDataNaviView
    },
    deleteModel: (state, deletedModel) => {
      if (state.currentDataModelNode === undefined) return
      const { id, type } = getModelNavigationNodeIdAndType(<string>state.currentDataModelNode.id)
      const getDataMappingItemsStr = type === ModelNavigationNodeType.models
        ? 'deleteModel' : 'deleteBlock'
      if (id === deletedModel) {
        state.currentDataModelNode = undefined
        state.files.length = 0
      }
      dataInputDataSource[getDataMappingItemsStr](deletedModel)
    },
    updateDataInputsFiles: (state, dataInputs) => {
      // const newEntriesModel = dataInputs.modelId
      dataInputDataSource.updateFiles(dataInputs)
      const subscript = state.files.findIndex(item => item.id === dataInputs.id)
      if (subscript > -1) state.files[subscript] = dataInputs
    }
  },
  actions: {
    async addDataInputWithDBSync({ commit, rootState }, dataInput: DataInputFile): Promise<void> {
      await useDataInputsAPIs().db.insertDataInput(dataInput, rootState.workspace.id).then((id: number) => {
        console.log(dataInput, 'dataInput')

        commit('addDataInputs', [{ ...dataInput, id }])
      })
    },
    async deleteDataInputsWithDBSync({ commit }, dataInputIds: number[]): Promise<void> {
      await useDataInputsAPIs().db.deleteDataInputs(dataInputIds).then(() => {
        commit('deleteDataInputs', dataInputIds)
      })
    },
    async deleteDataInputsInModelWithDBSync({ commit }, modelId: number): Promise<void> {
      await useDataInputsAPIs().db.deleteDataInputsInModel([modelId]).then(() => {
        commit('deleteModel', modelId)
      })
    },
    async recoverDataInputsFromDB({ commit, rootState }): Promise<void> {
      commit('resetDataInputs')
      const dataInputs = await useDataInputsAPIs().db.queryAllDataInputsOfWorkspace(rootState.workspace.id)
      dataInputs.length && commit('addDataInputs', dataInputs)
    },
    async updateDataInputWithDBSync({ commit }, payload: DataInputFile): Promise<void> {
      await useDataInputsAPIs().db.updateDataInputName(payload.id, payload.name)
    },
    async rollBackDataInputName({ commit }, payload: DataInputFile): Promise<void> {
      await useDataInputsAPIs().db.queryDataInput(payload.id).then((result: DataInputFile) => {
        commit('updateDataInputName', result)
      })
    },
    async updateDataInputsFilesWithDBSync({ commit }, dataInput: DataInputFile): Promise<void> {
      const params = JSON.parse(JSON.stringify(dataInput))
      return useDataInputsAPIs().db.updateDataInput(params).then(res => {
        res && commit('updateDataInputsFiles', params)
      })
    },
    async updateDataInputsFilesBatchWithDBSync({ commit }, dataInput: DataInputFile[]): Promise<void> {
      const params = JSON.parse(JSON.stringify(dataInput))
      const result = await useDataInputsAPIs().db.updateDataInputBatch(params)
      const findResult = result.includes(0)
      !findResult && dataInput.forEach(item => commit('updateDataInputsFiles', item))
    },
    async importDataInputsFilesWithDBSync({ commit, rootState }, dataInput: DataInputFile[]): Promise<{ code: number }> {
      try {
        useDataInputsAPIs().db.insertDataInputBatch(dataInput, rootState.workspace.id).then((ids: number[]) => {
          const date = new Date()
          const params = dataInput.map((item: DataInputFile, index: number) => {
            return { ...item, id: ids[index], createdAt: date.toLocaleString() }
          })
          commit('addDataInputs', params)
        })
        return Promise.resolve({ code: 0 })
      } catch {
        return Promise.resolve({ code: 1 })
      }
    }
  }
}

export default mod
