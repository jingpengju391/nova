
import { ModuleOption } from '../definition'
import { useProductsAPIs, useModelsAPIs } from '@/hooks/apis'
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
import modelsDataSource from './modelsDataSource'
interface State {
  codeIndexes: CodeIndex[]
  currentCodeIndex: CodeIndex | undefined,
  currentCopy: CodeIndex | undefined
}

interface Getters { }

interface Mutations {
  addCodeIndexesToDataSource: CodeIndex[]
  updateCodeIndexes: CodeIndex[]
  updateCodeIndexesAll: CodeIndex[]
  deleteCodeIndexes: CodeIndex[]
  updateCurrentCodeIndex: CodeIndex
  updateCurrentCopy: CodeIndex
  clearCurrentCodeIndex:void
}

interface Actions {
  recoverCodeIndexesWorkspaceFromDB: () => void
  queryCodeIndexesByModelIdFromDB: (modelId: number) => void
  insertCodeIndexFromDB: (codeIndex: CodeIndex) => void
  importCodeIndexFromDB: (codeIndexes: CodeIndex[]) => void
  deleteCodeIndexksFromDB: (codeIndex: CodeIndex[]) => void
  updateCodeIndexFromDB: (codeIndex: CodeIndex) => void
  updateCodeIndexesFromDB: (codeIndexes: CodeIndex[]) => void
  queryCodeIndexesByCodeIndexIdFromDB: (codeIndexId: number) => CodeIndex
}

export type CodeIndexModule = ModuleOption<State, Getters, Mutations, Actions>

const prod: CodeIndexModule = {
  namespaced: true,
  state: {
    codeIndexes: [],
    currentCodeIndex: undefined,
    currentCopy: undefined
  },
  getters: {},
  mutations: {
    addCodeIndexesToDataSource(state, codeIndexes) {
      modelsDataSource.addNewCodeIndexesToModelMap(codeIndexes)
    },
    updateCodeIndexes(state, codeIndexes) {
      state.codeIndexes = codeIndexes
      modelsDataSource.addNewCodeIndexesToModelMap(codeIndexes)
      if (!state.currentCodeIndex) return
      const id = state.currentCodeIndex.id
      state.currentCodeIndex = codeIndexes.find((codeIndex: CodeIndex) => codeIndex.id === id)
    },
    updateCodeIndexesAll(state, codeIndexes) {
      codeIndexes.forEach((codeIndex: CodeIndex) => {
        const index = state.codeIndexes.findIndex(item => item.id === codeIndex.id)
        state.codeIndexes[index] = codeIndex
      })
      modelsDataSource.addNewCodeIndexesToModelMap(codeIndexes)
      if (!state.currentCodeIndex) return
      const id = state.currentCodeIndex.id
      state.currentCodeIndex = codeIndexes.find((codeIndex: CodeIndex) => codeIndex.id === id)
    },
    updateCurrentCodeIndex(state, codeIndex) {
      state.currentCodeIndex = codeIndex
      if (!codeIndex) return
      const index = state.codeIndexes.findIndex(item => item.id === codeIndex.id || !item.id)
      if (index === -1) {
        state.codeIndexes.push(codeIndex)
      } else {
        state.codeIndexes[index] = codeIndex
      }
      modelsDataSource.updatedCodeIndexesToModelMap(codeIndex)
    },
    deleteCodeIndexes(state, codeIndexes) {
      const ids: number[] = codeIndexes.map((codeIndex: CodeIndex) => codeIndex.id)
      const res = state.codeIndexes.filter((codeIndex: CodeIndex) => !ids.includes(codeIndex.id))
      state.codeIndexes = res
      modelsDataSource.deleteCodeIndexesToModelMap(codeIndexes)
    },
    updateCurrentCopy(state, codeIndex) {
      state.currentCopy = codeIndex
    },
    clearCurrentCodeIndex(state) {
      state.currentCodeIndex = undefined
    }
  },
  actions: {
    async queryCodeIndexesByModelIdFromDB({ commit }, modelId: number): Promise<void> {
      const result = await useProductsAPIs()
        .indicators
        .db
        .queryCodeIndexesByModelId(modelId)
      commit('updateCodeIndexes', result)
    },
    async insertCodeIndexFromDB({ commit, rootState }, codeIndex: CodeIndex): Promise<void> {
      const param = JSON.parse(JSON.stringify(codeIndex))
      const creator = await useModelsAPIs().getModelCreator()
      const result = await useProductsAPIs()
        .indicators
        .db
        .insertCodeIndexes({ ...param, creator, workspaceId: rootState.workspace.id })
      commit('updateCurrentCodeIndex', { ...param, id: result })
    },
    async importCodeIndexFromDB({ commit }, codeIndexes: CodeIndex[]): Promise<void> {
      const result = await useProductsAPIs()
        .indicators
        .db
        .importCodeIndexes(codeIndexes)
      codeIndexes.forEach((codeIndex:CodeIndex, index:number) => {
        codeIndex.id = result.ids[index]
        codeIndex.updatedAt = result.updatedAt
      })
      commit('updateCodeIndexes', codeIndexes)
    },
    async deleteCodeIndexksFromDB({ state, commit }, codeIndexes: CodeIndex[]): Promise<void> {
      const ids: number[] = codeIndexes.map((codeIndex: CodeIndex) => codeIndex.id)
      await useProductsAPIs()
        .indicators
        .db
        .deleteCodeIndexesById(ids)
      commit('deleteCodeIndexes', codeIndexes)
    },
    async updateCodeIndexFromDB({ commit }, codeIndex: CodeIndex): Promise<void> {
      await useProductsAPIs()
        .indicators
        .db
        .updateCodeIndexById({ ...codeIndex, updatedAt: new Date().getTime() })
      commit('updateCurrentCodeIndex', { ...codeIndex, updatedAt: new Date().getTime() })
    },
    async updateCodeIndexesFromDB({ commit }, codeIndexes: CodeIndex[]): Promise<void> {
      const params = codeIndexes.map((codeIndex: CodeIndex) => {
        return {
          ...codeIndex,
          updatedAt: new Date().getTime()
        }
      })
      await useProductsAPIs()
        .indicators
        .db
        .updateCodeIndexes(params)
      commit('updateCodeIndexesAll', params)
    },
    async queryCodeIndexesByCodeIndexIdFromDB({ commit }, codeIndexId: number): Promise<CodeIndex> {
      return await useProductsAPIs()
        .indicators
        .db
        .queryCodeIndexesByCodeIndexId(codeIndexId)
    },
    async recoverCodeIndexesWorkspaceFromDB({ commit, rootState }): Promise<void> {
      const codeIndexes = await useProductsAPIs()
        .indicators
        .db
        .queryAllCodeIndexesOfWorkspace(rootState.workspace.id)
      commit('addCodeIndexesToDataSource', codeIndexes)
    }
  }
}

export default prod
