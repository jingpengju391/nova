import { ModuleOption } from '../definition'
import { useAppSettingsAPIs } from '../../hooks/apis'
import { AppSettings, TaskSettings, RunnerSettings } from '@shared/dataModelTypes/appSettings'

interface State {
  softwareSettingsData: AppSettings | undefined
  taskSettingsData: TaskSettings | undefined
  runnerSettingsData: RunnerSettings | undefined
}

interface Getters {

}

interface Mutations {
  updateSoftData:AppSettings
  updateTaskData:TaskSettings
  updateRunnerData:RunnerSettings

}

interface Actions {
  getSoftwareSettingsData:()=>void
  getTaskSettingsData:()=>void
  getRunnerSettingsData:()=>void
  updateSoftwareSettingsData:(soloaddata: AppSettings)=>void
  updateTaskSettingsData:(taskloaddata: TaskSettings)=>void
  updateRunnerSettingsData:(runnerloaddata: RunnerSettings)=>void
}

export type SettingsModule = ModuleOption<State, Getters, Mutations, Actions>

const sod: SettingsModule = {
  namespaced: true,
  state: {
    softwareSettingsData: undefined,
    taskSettingsData: undefined,
    runnerSettingsData: undefined
  },
  getters: {},
  mutations: {
    updateSoftData(state, sosData) {
      state.softwareSettingsData = sosData
    },
    updateTaskData(state, taskData) {
      state.taskSettingsData = taskData
    },
    updateRunnerData(state, runnerData) {
      state.runnerSettingsData = runnerData
    }
  },
  actions: {
    async getSoftwareSettingsData({ commit, state }):Promise<void> {
      const sosData = await useAppSettingsAPIs().app.query()
      commit('updateSoftData', sosData)
    },
    async getTaskSettingsData({ commit, state }):Promise<void> {
      const taskData = await useAppSettingsAPIs().task.query()
      commit('updateTaskData', taskData)
    },
    async getRunnerSettingsData({ commit, state }):Promise<void> {
      const runnerData = await useAppSettingsAPIs().runner.query()
      commit('updateRunnerData', runnerData)
    },
    async updateSoftwareSettingsData({ commit }, soloaddata: AppSettings):Promise<void> {
      const params = JSON.parse(JSON.stringify(soloaddata))
      const result = await useAppSettingsAPIs().app.update(params)
      result && commit('updateSoftData', params)
    },
    async updateTaskSettingsData({ commit }, taskloaddata: TaskSettings):Promise<void> {
      const params = JSON.parse(JSON.stringify(taskloaddata))
      const result = await useAppSettingsAPIs().task.update(params)
      result && commit('updateTaskData', params)
    },
    async updateRunnerSettingsData({ commit }, runnerloaddata: RunnerSettings):Promise<void> {
      const params = JSON.parse(JSON.stringify(runnerloaddata))
      const result = await useAppSettingsAPIs().runner.update(params)
      result && commit('updateRunnerData', params)
    }
  }
}

export default sod
