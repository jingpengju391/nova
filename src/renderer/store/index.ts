/* eslint-disable no-unused-vars */
import { StoreOptions, createStore } from 'vuex'
import { BaseGetters, BaseMutations, BaseState, BaseActions, RootCommit, RootDispatch, RootState } from './definition'
import dataInputs, { DataInputsModule } from './modules/dataInputs'
import models, { ModelsModule } from './modules/models'
import masters, { MastersModule } from './modules/masters'
import codeIndex, { CodeIndexModule } from './modules/codeIndex'
import tasks, { TasksModule } from './modules/tasks'
import runs, { RunsModule } from './modules/runs'
import outputs, { OutputsModule } from './modules/outputs'
import assumptionTable, { assumptionFileTableModule } from './modules/assumptionTable'
import assumptionVar, { AssumptionVarsModule } from './modules/assumptionVar'
import navigation, { NavigationModule } from './modules/navigation'
import helps, { HelpModule } from './modules/helps'
import dataLink, { DataLinkModule } from './modules/dataLink'
import project, { ProjectModule } from './modules/project'
import { Workspace, Model } from '@shared/dataModelTypes'
import globalSearchReplace, { GlobalSearchReplace } from './modules/globalSearchReplace'
import { useWorkspacesAPIs } from '../hooks'
import privateDeployment, { DeploymentGITModule } from './privateDeployment'
import settings, { SettingsModule } from './modules/settings'
import relation, { RelationLink } from './modules/relation'
declare module './definition' {

  interface ModuleMap {
    dataInputs: DataInputsModule
    models: ModelsModule
    relation: RelationLink
    tasks: TasksModule
    runs: RunsModule
    outputs: OutputsModule
    assumptionTable: assumptionFileTableModule
    assumptionVar: AssumptionVarsModule
    navigation: NavigationModule
    helps: HelpModule
    globalSearchReplace: GlobalSearchReplace
    privateDeployment: DeploymentGITModule
    masters: MastersModule
    codeIndex: CodeIndexModule
    dataLink: DataLinkModule
    project: ProjectModule
  }

  interface UserInfo {
    username: string,
    userSpace: string
  }
  interface BaseState {
    workspace: Workspace
    models?: ModelsModule['state']
    relation?: RelationLink['state']
    runs?: RunsModule['state']
    outputs?: OutputsModule['state'],
    loginMask: boolean,
    isAuthor: boolean,
    isAppStarted: boolean,
    isLicenseChecked: boolean,
    isDataCleanShow: boolean,
    userInfo: UserInfo
  }
  interface BaseGetters {
    getCurrentWorkspaceDirPath: (state: BaseState) => string
  }
  interface BaseGetters {
    getCurrentWorkspaceDirPath: (state: BaseState) => string
  }
  interface BaseMutations {
    setWorkspace: (state: BaseState, workspace: Workspace) => void,
    setLoginMask: (state: BaseState, loginMask: boolean) => void,
    setIsAuthor: (state: BaseState, isAuthor: boolean) => void,
    setIsAppStarted: (state: BaseState, isAppStarted: boolean) => void,
    setIsLicenseChecked: (state: BaseState, isLicenseChecked: boolean) => void,
    setUserInfo: (state: BaseState, userInfo: UserInfo) => void
    setDataCleanShow: (state: BaseState, flag: boolean) => void
  }
  interface BaseActions {
    resetWorkspace: (context: { state: BaseState, getters: BaseGetters, commit: RootCommit, dispatch: RootDispatch }, newWorkspace: Workspace) => Promise<void>
    removeTempFolderForModel: (context: { state: BaseState, getters: BaseGetters, commit: RootCommit, dispatch: RootDispatch }, model: Model) => Promise<boolean>
    removeTempFolder: (context: { state: BaseState, getters: BaseGetters, commit: RootCommit, dispatch: RootDispatch }) => Promise<boolean>
  }
}

let _workspace!: Workspace
const state: BaseState = {
  workspace: _workspace,
  loginMask: true,
  isAuthor: false,
  isAppStarted: false,
  isLicenseChecked: false,
  isDataCleanShow: false,
  userInfo: {
    username: '',
    userSpace: ''
  }
}

const getters: BaseGetters = {
  getCurrentWorkspaceDirPath(state: BaseState): string {
    return state.workspace.dirPath
  }
}

const mutations: BaseMutations = {
  setWorkspace(state, workspace) {
    state.workspace = workspace
  },
  setLoginMask(state, loginMask) {
    state.loginMask = loginMask
  },
  setDataCleanShow(state, flag: boolean) {
    state.isDataCleanShow = flag
  },
  setIsAuthor(state, isAuthor) {
    state.isAuthor = isAuthor
  },
  setIsAppStarted(state, isAppStarted) {
    state.isAppStarted = isAppStarted
  },
  setIsLicenseChecked(state, isLicenseChecked) {
    state.isLicenseChecked = isLicenseChecked
  },
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
  }
}

const actions: BaseActions = {
  async resetWorkspace({ commit, dispatch }, newWorkspace): Promise<void> {
    // TODO: add new commit type
    // @ts-ignore commit type is wrong defined
    commit('setWorkspace', newWorkspace)
    await Promise.all([
      // TODO: add new dispatch type
      // @ts-ignore dispatch type cannot use namespaced type
      dispatch('dataInputs/recoverDataInputsFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('models/recoverDefaultWorkspaceFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('runs/recoverTargetsFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('runs/recoverProjectionsFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('outputs/recoverOutputsFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('assumptionTable/recoverFileListFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('tasks/recoverTaskMonitsFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('models/recoverClassifyListFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('privateDeployment/recoverCurrentWorkspaceFromDB', null, { root: true }),
      // @ts-ignore
      dispatch('settings/getSoftwareSettingsData', null, { root: true }),
      // @ts-ignore
      dispatch('settings/getTaskSettingsData', null, { root: true }),
      // @ts-ignore
      dispatch('settings/getRunnerSettingsData', null, { root: true }),
      // @ts-ignore
      dispatch('runs/queryProjectionQueuesFromDB', null, { root: true })
    ])
    // @ts-ignore
    dispatch('runs/recoverRunnersFromDB', null, { root: true })
    // @ts-ignore
    dispatch('masters/recoverMasterFromDB', null, { root: true })
    // @ts-ignore
    dispatch('codeIndex/recoverCodeIndexesWorkspaceFromDB', null, { root: true })
  },
  removeTempFolderForModel({ state }, model: Model): Promise<boolean> {
    return useWorkspacesAPIs().removeTempFolderForModel(state.workspace.name, model.name)
  },
  removeTempFolder({ state }): Promise<boolean> {
    return useWorkspacesAPIs().removeTempFolder()
  }
}

const storeOptions = {
  state,
  getters,
  mutations,
  actions,
  modules: {
    models,
    relation,
    dataInputs,
    tasks,
    runs,
    outputs,
    assumptionTable,
    assumptionVar,
    navigation,
    helps,
    globalSearchReplace,
    privateDeployment,
    masters,
    codeIndex,
    settings,
    dataLink,
    project
  }
} as any as StoreOptions<RootState>

export default createStore(storeOptions)
