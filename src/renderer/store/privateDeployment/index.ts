import { ModuleOption } from '../definition'
import { useModelsAPIs } from '@/hooks/apis'
import { Model } from '@shared/dataModelTypes/models/models'
interface State {
  original: any
  originalModels: Model[]
  currentModels: Model[]
}
interface Getters {}

interface Mutations {
  updateOriginal:any
  updateOriginalModels:Model[]
  updateCurrentModels:Model[]
}

interface Actions {
  recoverOriginalWorkspaceFromDB: () => void
  recoverCurrentWorkspaceFromDB: () => void
}

export type DeploymentGITModule = ModuleOption<State, Getters, Mutations, Actions>;

const mod:DeploymentGITModule = {
  namespaced: true,
  state: {
    original: [],
    originalModels: [],
    currentModels: []
  },
  getters: {},
  mutations: {
    updateOriginal: (state, data) => {
      state.original = data
    },
    updateOriginalModels: (state, data) => {
      state.originalModels = data
    },
    updateCurrentModels: (state, data) => {
      state.currentModels = data
    }
  },
  actions: {
    async recoverOriginalWorkspaceFromDB({ commit, rootState }): Promise<void> {
      const models = await useModelsAPIs().db.queryAllModelsOfWorkspace(rootState.workspace.id)
      commit('updateOriginalModels', models)
    },
    async recoverCurrentWorkspaceFromDB({ commit, state, rootState }): Promise<void> {
      const models = await useModelsAPIs().db.queryAllModelsOfWorkspace(rootState.workspace.id)
      commit('updateCurrentModels', models)
      !state.originalModels.length && commit('updateOriginalModels', models)
    }
  }
}

export default mod
