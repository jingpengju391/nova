import { ModuleOption } from '../definition'
import { Target, createATarget, TargetNavigationNode, TargetNavigationNodeType } from '@shared/dataModelTypes/runs/targets'
import { Projection, ProjectionNavigationNode, ProjectionNavigationNodeType, Queue, QueueListNodeNav, createBaseRunConfigurationItem } from '@shared/dataModelTypes/runs/projections'
import { Runner, createARunner } from '@shared/dataModelTypes/runs/runners'
import { getModelNavigationNodeIdAndType, getTargetNavigationNodeIdAndType, getProjectionNavigationNodeIdAndType, formatQueueInheritRunner } from '../../utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { UnsavedTargetExistsError, UnsavedProjectionExistsError } from '../../errors'
import { clone, omit } from '@shared/functional'
import { useRunsAPIs } from '../../hooks/apis'
import { generateADuplicatedItemName, getQueueDefaultSettings, checkedQueueAndQueueRunnerIsNew, generateCopyQueueName, generateRandomNumber } from './utils'
import { calcWarningForTarget, calcWarningForProjection } from './tasksSource'
import { filter } from 'lodash'
interface State {
  targets: Target[]
  currentTarget: Target | null
  // tempTarget is the target created but not saved since its fields aren't set up correctly
  tempTarget: Target | null
  runners: Runner[]
  currentRunner: Runner | null
  tempRunner: Runner | null
  hideTargetNaviView: boolean
  projections: Projection[]
  currentProjection: Projection | null
  tempProjection: Projection | null
  queueList: Queue[]
  currentQueue: Queue | null
  isProjectionSave: boolean
  deleteCurQueueRunnerItems: number[],
  runSetingSelectTargets: number[],
  runSetingSelectOutputs: number[]
}

interface Getters {
  targetNaviTree: TargetNavigationNode[]
  // number is the modelId
  targetModelIdMap: Map<number, Target[]>
  projectionNaviTree: ProjectionNavigationNode[]
  // number is the modelId
  projectionModelIdMap: Map<number, Projection[]>
  targetIdMap: Map<number, Target>
  tempTargetNaviNode: TargetNavigationNode
  runnerIdMap: Map<number, Runner>
  currentRunner: Runner | null
}

interface Mutations {
  resetTargets: void
  updateCurrentTarget: Target
  updateCurrentTargetWithTargetNaviNode: TargetNavigationNode
  addTargets: Target[]
  setTempTarget: Target
  legalizeTemporaryTarget: Target
  resetRunners: void
  setTempRunner: Runner
  addRunners: Runner[]
  legalizeTemporaryRunner: Runner
  setCurrentRunner: Runner | null
  toggleTargetNaviViewDisplay: void
  resetProjections: void
  updateCurrentProjectionWithProjectionNaviNode: Projection
  updateCurrentProjection: Projection
  updateCurrentProjectionAndProjections: Projection
  addProjections: Projection[]
  setTempProjection: Projection
  legalizeTemporaryProjection: Projection
  setRunOptions: Projection[]
  addNewQueue: QueueListNodeNav | Queue
  AddQueueList: Queue
  addNewQueueRunnerItem: Queue
  updateCurrentQueue: number
  updateQueue: Queue
  removeQueueInheritRunnerItem: { parentId: number, removeId: number }
  formatQueueInheritRunnerItem: number
  deleteQueue: number
  deleteQueueRunner: number
  recoveryQueueRunner: { parentId: number, recoveryId: number }
  renameQueue: { id: number, name: string }
  recoveryQueueList: Queue[]
  changeIsProjectionSaveStatus: boolean
  setRunSetingSelectTargets: number[] | []
  setRunSetingSelectOutputs: number[] | []

}

interface Actions {
  recoverTargetsFromDB: () => void
  selectUnsavedNewTargetIfExists: () => void
  createNewTarget: (modelId: number) => void
  saveUpdatedCurrentTargetToDB: () => void
  getTargetForId: (id: number) => Target | null
  deleteTarget: (id: number) => void
  duplicateTarget: (id: number) => void
  recoverRunnersFromDB: () => void
  createNewRunner: () => void
  saveCurrentRunner: () => void
  selectCurrentRunner: (id: number) => void
  deleteRunner: (id: number) => void
  duplicateRunner: (id: number) => void
  recoverProjectionsFromDB: () => void
  selectUnsavedNewProjectionIfExists: () => void
  createNewProjection: () => void
  saveUpdatedCurrentProjectionToDB: () => void
  deleteProjection: (id: number) => void
  duplicateProjection: (projection: Projection) => void
  setRunOptionsAsync: (options: any) => void
  saveUpdatedCurrentQueueToDB: (projectionId: number) => void
  queryProjectionQueuesFromDB: () => void
  queryCurrentProjection: (id: number) => void
  CopyQueue: (queueId: number) => void
}

export type RunsModule = ModuleOption<State, Getters, Mutations, Actions>

const mod: RunsModule = {
  namespaced: true,
  state: {
    targets: [],
    currentTarget: null,
    tempTarget: null,
    runners: [],
    currentRunner: null,
    tempRunner: null,
    hideTargetNaviView: false,
    projections: [],
    currentProjection: null,
    tempProjection: null,
    queueList: [],
    currentQueue: null,
    isProjectionSave: true,
    deleteCurQueueRunnerItems: [],
    runSetingSelectTargets: [],
    runSetingSelectOutputs: []
  },
  getters: {
    currentRunner: state => state.currentRunner,
    targetModelIdMap(state): Map<number, Target[]> {
      return state.targets.reduce((acc, cur) => {
        if (acc.get(cur.modelId)) {
          acc.get(cur.modelId)!.push(cur)
        } else {
          acc.set(cur.modelId, [cur])
        }
        return acc
      }, new Map<number, Target[]>())
    },
    targetIdMap(state): Map<number, Target> {
      return state.targets.reduce((acc, cur) => {
        acc.set(cur.id, cur)
        return acc
      }, new Map<number, Target>())
    },
    targetNaviTree(_, getters, rootState): TargetNavigationNode[] {
      const modelNavigationTree = rootState.models.modelNavigationTree

      const targetNaviTree = modelNavigationTree.map(node => {
        const { id: modelId } = getModelNavigationNodeIdAndType(node.id as string)
        const targetsOfThisModel = getters.targetModelIdMap.get(modelId) ?? []
        return {
          ...node,
          warning: 'success',
          children: targetsOfThisModel.map(target => {
            return {
              id: TargetNavigationNodeType.targets + NaviNodeIdDelimiter + target.id,
              name: target.name,
              children: [],
              warning: calcWarningForTarget(target)
            }
          })
        }
      })
      return targetNaviTree
    },
    projectionModelIdMap(state): Map<number, Projection[]> {
      return state.projections.reduce((acc, cur) => {
        if (acc.get(cur.modelId)) {
          acc.get(cur.modelId)!.push(cur)
        } else {
          acc.set(cur.modelId, [cur])
        }
        return acc
      }, new Map<number, Projection[]>())
    },
    projectionNaviTree(_, getters, rootState): ProjectionNavigationNode[] {
      const modelNavigationTree = rootState.models.modelNavigationTree

      const projectionNaviTree = modelNavigationTree.map(node => {
        const { id: modelId } = getModelNavigationNodeIdAndType(node.id as string)
        const projectionsOfThisModel = getters.projectionModelIdMap.get(modelId) ?? []
        return {
          ...node,
          warning: 'success',
          children: projectionsOfThisModel.map(projection => {
            return {
              id: ProjectionNavigationNodeType.projections + NaviNodeIdDelimiter + projection.id,
              name: projection.name,
              children: [],
              warning: calcWarningForProjection(projection.id)
            }
          })
        }
      })
      return projectionNaviTree
    },
    tempTargetNaviNode(state): TargetNavigationNode {
      if (!state.tempTarget) {
        return {
          id: TargetNavigationNodeType.targets + NaviNodeIdDelimiter + 0,
          name: '',
          children: []
        }
      }
      return {
        id: TargetNavigationNodeType.targets + NaviNodeIdDelimiter + state.tempTarget.id,
        name: state.tempTarget.name,
        children: []
      }
    },
    runnerIdMap(state): Map<number, Runner> {
      return state.runners.reduce((acc, cur) => {
        acc.set(cur.id, cur)
        return acc
      }, new Map<number, Runner>())
    }
  },
  mutations: {
    updateCurrentTarget(state, target: Target) {
      state.currentTarget = target
    },
    toggleTargetNaviViewDisplay(state) {
      state.hideTargetNaviView = !state.hideTargetNaviView
    },
    updateCurrentTargetWithTargetNaviNode(state, naviNode: TargetNavigationNode) {
      const { id, type } = getTargetNavigationNodeIdAndType(naviNode.id)
      if (type === TargetNavigationNodeType.models) {
        state.currentTarget = null
      } else {
        state.currentTarget = state.targets.find(target => target.id === id) ?? null
      }
    },
    resetTargets(state) {
      state.targets = []
      state.currentTarget = null
      state.tempProjection = null
    },
    addTargets(state, targets: Target[]) {
      state.targets.push(...targets)
    },
    setTempTarget(state, tempTarget: Target) {
      state.tempTarget = tempTarget
      state.targets.push(tempTarget)
      state.currentTarget = tempTarget
    },
    legalizeTemporaryTarget(state, legalTarget: Target) {
      state.targets[state.targets.length - 1] = legalTarget
      state.currentTarget = legalTarget
      state.tempTarget = null
    },
    resetRunners(state) {
      state.runners = []
      state.currentRunner = null
      state.tempRunner = null
    },
    setTempRunner(state, tempRunner: Runner) {
      state.tempRunner = tempRunner
      state.currentRunner = tempRunner
    },
    addRunners(state, runners: Runner[]) {
      state.runners.push(...runners)
    },
    legalizeTemporaryRunner(state, legalRunner: Runner) {
      state.runners.push(legalRunner)
      state.currentRunner = legalRunner
      state.tempRunner = null
    },
    setCurrentRunner(state, runner: Runner | null) {
      state.currentRunner = runner
    },
    resetProjections(state) {
      state.projections = []
      state.currentProjection = null
      state.tempProjection = null
    },
    updateCurrentProjectionWithProjectionNaviNode(state, projection: Projection) {
      state.currentProjection = state.projections.find(p => p.id === projection.id) ?? null
      //  state.currentProjection = projection
    },
    updateCurrentProjection(state, projection: Projection) {
      state.currentProjection = projection
    },
    updateCurrentProjectionAndProjections(state, projection: Projection) {
      state.projections.map((p, index) => {
        if (p.id === projection.id) {
          state.projections[index] = projection
        }
      })
      state.currentProjection = projection
    },
    addProjections(state, projections: Projection[]) {
      state.projections.push(...projections)
    },
    setTempProjection(state, tempProjection: Projection) {
      state.tempProjection = tempProjection
      state.projections.push(tempProjection)
      state.currentProjection = tempProjection
    },
    legalizeTemporaryProjection(state, legalProjection: Projection) {
      state.projections[state.projections.length - 1] = legalProjection
      state.currentProjection = legalProjection
      state.tempProjection = null
    },
    setRunOptions(state, options: any) {
      if (state.currentTarget) state.currentTarget.variablesAndSeries = options
    },
    addNewQueue(state, queueNav: any) {
      let tempQueue: Queue = createBaseRunConfigurationItem()
      getQueueDefaultSettings(tempQueue)
      tempQueue.id = queueNav.id
      tempQueue.name = queueNav.name
      tempQueue.children = []
      tempQueue.projectionId = state.currentProjection?.id
      tempQueue.runnerId = 0
      state.queueList.push(tempQueue)
    },
    AddQueueList(state, newQueue: Queue) {
      state.queueList.push(newQueue)
    },
    addNewQueueRunnerItem(state, runnerItem) {
      const newQueueList: Queue[] = clone(state.queueList)
      newQueueList.map(queue => {
        if (queue.id === runnerItem.parentId) {
          const newRunnerItem = omit(['children'], queue)
          newRunnerItem.parentId = runnerItem.parentId
          newRunnerItem.id = runnerItem.id
          newRunnerItem.runnerId = runnerItem.runnerId
          newRunnerItem.name = runnerItem.name
          delete newRunnerItem.children
          queue.children?.push(newRunnerItem)
        }
      })
      state.queueList = newQueueList
    },
    updateCurrentQueue(state, id: number) {
      const queueList: any = clone(state.queueList)
      state.queueList.map((queue: any) => {
        if (queue.id === id) {
          state.currentQueue = queue
        } else {
          queue.children?.map((child: any) => {
            if (child.id === id) {
              state.currentQueue = child
            }
          })
        }
      })
    },
    updateQueue(state, payload) {
      const queueList: any = clone(state.queueList)
      state.queueList.map((queue: any, index: number) => {
        if (queue.id === payload.id) {
          state.queueList[index] = payload
          state.currentQueue = payload
        } else {
          queue.children?.map((child: any, iChid: number) => {
            if (child.id === payload.id) {
              child = payload
              state.currentQueue = child
            }
          })
        }
      })
    },
    removeQueueInheritRunnerItem(state, payload) {
      const queue1: any = clone(state.queueList)
      state.queueList.map((item: any) => {
        if (item.id === payload.parentId) {
          if (!item.children) return
          item.children.map((child: any) => {
            if (child.id === payload.removeId) {
              child.isInherit = false
            }
          })
        }
      })
      //  state.queueList = queue1
    },
    formatQueueInheritRunnerItem(state, id) {
      const queueList = clone(state.queueList)
      const filterQueue = queueList.filter((filter: any) => { return filter.id === id })[0]
      const formatData = omit(['id', 'name', 'runnerId', 'children', 'isInherit', 'parentId'], filterQueue)

      state.queueList.map((filter: any) => {
        if (filter.id === id) {
          filter.children?.map((child: any, index: any) => {
            if (child.isInherit) {
              if (!filter.children) return
              filter.children[index] = formatQueueInheritRunner(child, formatData)
            }
          })
        }
      })
      //  state.queueList = queueList
    },
    deleteQueue(state, queueId) {
      const isNew = checkedQueueAndQueueRunnerIsNew(queueId.toString())
      if (!isNew) state.deleteCurQueueRunnerItems.push(queueId)
      let index = state.queueList.findIndex(item => item.id === queueId)
      if (index >= 0) {
        state.queueList.splice(index, 1)
      }
    },

    deleteQueueRunner(state, runnerId) {
      const isNew = checkedQueueAndQueueRunnerIsNew(runnerId.toString())
      if (!isNew) state.deleteCurQueueRunnerItems.push(runnerId)
      const queueList = clone(state.queueList)
      state.queueList.map((queue: any) => {
        if (!queue.children) return
        for (let i = 0; i < queue.children?.length; i++) {
          if (queue.children[i].id === runnerId) {
            queue.children.splice(i, 1)
          }
        }
      })
      //  state.queueList = queueList
    },
    recoveryQueueRunner(state, payload) {
      const queue1: any = clone(state.queueList)
      state.queueList.map((item: any) => {
        if (item.id === payload.parentId) {
          if (!item.children) return
          item.children.map((child: any) => {
            if (child.id === payload.recoveryId) {
              child.isInherit = true
            }
          })
          state.currentQueue = item
        }
      })
    },
    renameQueue(state, payload) {
      const queueList = clone(state.queueList)
      state.queueList.map((item: any) => {
        if (item.id === payload.id) {
          item.name = payload.name
        }
      })
      //  state.queueList = queueList
    },
    recoveryQueueList(state, queueList) {
      state.queueList.length = 0
      state.queueList.push(...queueList)
      if (state.currentQueue === null || state.currentQueue === undefined) state.currentQueue = state.queueList[0]
    },
    changeIsProjectionSaveStatus(state, flag: boolean) {
      state.isProjectionSave = flag
    },
    setRunSetingSelectTargets(state, targets: number[]) {
      state.runSetingSelectTargets = targets
    },
    setRunSetingSelectOutputs(state, outputs: number[]) {
      state.runSetingSelectOutputs = outputs
    }

  },
  actions: {
    async recoverTargetsFromDB({ commit, rootState }): Promise<void> {
      commit('resetTargets')
      const targets = await useRunsAPIs().db.queryAllTargetsOfWorkspace(rootState.workspace.id)
      commit('addTargets', targets)
    },
    async recoverRunnersFromDB({ commit, rootState }): Promise<void> {
      commit('resetRunners')
      const runners = await useRunsAPIs().db.queryAllRunnersOfWorkspace(rootState.workspace.id)
      commit('addRunners', runners)
    },
    async selectUnsavedNewTargetIfExists({ commit, state }): Promise<void> {
      return new Promise((resolve, reject) => {
        if (state.tempTarget) {
          commit('updateCurrentTarget', state.tempTarget)
          reject(new UnsavedTargetExistsError(state.tempTarget.name))
        } else {
          resolve()
        }
      })
    },
    async createNewTarget({ commit, dispatch, rootState }, modelId: number): Promise<void> {
      return dispatch('selectUnsavedNewTargetIfExists').then(() => {
        const tempTarget = createATarget()
        tempTarget.modelId = modelId
        tempTarget.workspaceId = rootState.workspace.id
        commit('setTempTarget', tempTarget)
      }).catch(err => { throw err })
    },
    async saveUpdatedCurrentTargetToDB({ commit, state }): Promise<void> {
      try {
        const targetToUpdate = clone(state.currentTarget!)

        if (targetToUpdate.id === 0) {
          const newTargetId = await useRunsAPIs().db.insertTarget(targetToUpdate)
          commit('legalizeTemporaryTarget', {
            ...targetToUpdate,
            id: newTargetId
          })
        } else {
          await useRunsAPIs().db.updateTarget(targetToUpdate.id, targetToUpdate)
        }
      } catch (error) {
        // TODO: deal with error
        console.log('saveUpdatedCurrentTargetToDB error:', error)
      }
    },
    async getTargetForId({ state }, id: number): Promise<Target | null> {
      return new Promise(resolve => {
        resolve(state.targets.find(item => item.id === id) ?? null)
      })
    },
    async deleteTarget({ state }, id: number): Promise<void> {
      state.runners.map(item => {
        item.targets = item.targets.filter(target => { return target !== id })
      })
      if (id === 0) {
        state.tempTarget = null
        state.targets.pop()
        if (state.currentTarget?.id === 0) {
          state.currentTarget = null
        }
      } else {
        await useRunsAPIs().db.deleteTarget(id)
        if (state.currentTarget?.id === id) {
          state.currentTarget = null
        }
        state.targets = state.targets.filter(item => item.id !== id)
      }
    },
    async duplicateTarget({ state, commit }, id: number): Promise<void> {
      const targetToDuplicate = clone(state.targets.find(item => item.id === id)!)
      targetToDuplicate.name = generateADuplicatedItemName(targetToDuplicate, state.targets)
      const newId = await useRunsAPIs().db.insertTarget(omit(['id'], targetToDuplicate))
      targetToDuplicate.id = newId
      commit('addTargets', [targetToDuplicate])
      commit('updateCurrentTarget', targetToDuplicate)
    },
    async createNewRunner({ commit, rootState }): Promise<void> {
      const tempRunner = createARunner()
      tempRunner.workspaceId = rootState.workspace.id
      const newModelID = rootState.models.currentModelNode?.modelId
        ? rootState.models.currentModelNode.modelId : rootState.models.currentModelNode?.id
      tempRunner.modelId = newModelID
      commit('setTempRunner', tempRunner)
    },
    async saveCurrentRunner({ state, commit }): Promise<void> {
      if (state.currentRunner!.id === 0) {
        const newId = await useRunsAPIs().db.insertRunner(clone(state.currentRunner!))
        commit('legalizeTemporaryRunner', {
          ...state.currentRunner!,
          id: newId
        })
      } else {
        await useRunsAPIs().db.updateRunner(state.currentRunner!.id, clone(state.currentRunner!))
      }
    },
    selectCurrentRunner({ getters, commit }, id: number): Promise<void> {
      return new Promise(resolve => {
        const newCurrentRunner = getters.runnerIdMap.get(id) ?? null
        commit('setCurrentRunner', newCurrentRunner)
        resolve()
      })
    },
    async deleteRunner({ state }, id: number): Promise<void> {
      await useRunsAPIs().db.deleteRunner(id)
      if (state.currentRunner?.id === id) {
        state.currentRunner = null
      }
      state.runners = state.runners.filter(item => item.id !== id)
    },
    async duplicateRunner({ state, commit }, id: number): Promise<void> {
      const runnerToDuplicate = clone(state.runners.find(item => item.id === id)!)
      runnerToDuplicate.name = generateADuplicatedItemName(runnerToDuplicate, state.runners)
      const newId = await useRunsAPIs().db.insertRunner(omit(['id'], runnerToDuplicate))
      runnerToDuplicate.id = newId
      commit('addRunners', [runnerToDuplicate])
      commit('setCurrentRunner', runnerToDuplicate)
    },
    async recoverProjectionsFromDB({ commit, rootState }): Promise<void> {
      commit('resetProjections')
      const projections = await useRunsAPIs().db.queryAllProjectionsOfWorkspace(rootState.workspace.id)
      commit('addProjections', projections)
    },
    async selectUnsavedNewProjectionIfExists({ commit, state }): Promise<void> {
      return new Promise((resolve, reject) => {
        if (state.tempProjection) {
          commit('updateCurrentProjection', state.tempProjection)
          reject(new UnsavedProjectionExistsError(state.tempProjection.name))
        } else {
          resolve()
        }
      })
    },
    async createNewProjection({ commit, dispatch, rootState }): Promise<void> {
      return dispatch('selectUnsavedNewProjectionIfExists').then(async () => {
        let tempProjection = new Projection()
        tempProjection.workspaceId = rootState.workspace.id
        //  await getDefaultSettings(tempProjection)
        commit('setTempProjection', tempProjection)
      }).catch(err => { throw err })
    },
    async saveUpdatedCurrentProjectionToDB({ commit, dispatch, state, rootState }): Promise<void> {
      try {
        const startTime = new Date().getTime()
        const projectionToUpdate = clone(state.currentProjection!)
        // await updateAllSettings({ ...projectionToUpdate })
        if (projectionToUpdate.id === 0) {
          const newProjectionId = await useRunsAPIs().db.insertProjection(projectionToUpdate)
          commit('legalizeTemporaryProjection', {
            ...projectionToUpdate,
            id: newProjectionId
          })
          await dispatch('saveUpdatedCurrentQueueToDB', newProjectionId)
        } else {
          await useRunsAPIs().db.updateProjection(projectionToUpdate.id, projectionToUpdate)
          await dispatch('saveUpdatedCurrentQueueToDB', projectionToUpdate.id)
        }
      } catch (error) {
        // TODO: deal with error
        console.log('saveUpdatedCurrentProjectionToDB error:', error)
      }
    },
    async deleteProjection({ state, dispatch }, id: number): Promise<void> {
      if (id === 0) {
        state.tempProjection = null
        state.projections.pop()
        if (state.currentProjection?.id === 0) {
          if (state.projections.length) {
            state.currentProjection = state.projections[state.projections.length - 1]
            dispatch('queryProjectionQueuesFromDB')
          } else {
            state.currentProjection = null
            state.queueList.length = 0
          }
        }
      } else {
        await useRunsAPIs().db.deleteProjection(id)
        if (state.currentProjection?.id === id) {
          const index = state.projections.findIndex(p => p.id === id)
          if (index === 0 && state.projections.length === 1) {
            state.currentProjection = null
          } else if (index === 0 && state.projections.length > 1) {
            state.currentProjection = state.projections[1]
          } else {
            state.currentProjection = state.projections[index - 1]
          }
        }
        state.projections = state.projections.filter(item => item.id !== id)
      }
    },
    async duplicateProjection({ state, commit, rootState }, projection: Projection): Promise<void> {
      const projectionToDuplicate = clone(projection)
      projectionToDuplicate.name = generateADuplicatedItemName(projectionToDuplicate, state.projections)
      const newId = await useRunsAPIs().db.insertProjection(omit(['id'], projectionToDuplicate))
      projectionToDuplicate.id = newId
      let newQueueList = []
      const parentQueue = await useRunsAPIs().db.queryProjectionQueues(rootState.workspace.id, projection.id, projection.mode, 0)
      newQueueList.push(...parentQueue)
      for (let i = 0; i < newQueueList.length; i++) {
        const childQueue = await useRunsAPIs().db.queryProjectionQueues(rootState.workspace.id, projection.id, projection.mode, newQueueList[i].id)
        if (newQueueList[i].children) {
          newQueueList[i].children?.push(...childQueue)
        } else {
          newQueueList[i].children = []
          newQueueList[i].children?.push(...childQueue)
        }
      }

      for (let i = 0; i < newQueueList.length; i++) {
        const queue = newQueueList[i]
        queue.projectionId = projectionToDuplicate.id
        const newParentId = await useRunsAPIs().db.insertQueueRunner(omit(['id', 'children'], queue))
        queue.id = newParentId

        if (queue.children && queue.children.length) {
          for (let j = 0; j < queue.children.length; j++) {
            const child = queue.children[j]
            child.parentId = queue.id
            child.projectionId = projectionToDuplicate.id
            const newChildId = await useRunsAPIs().db.insertQueueRunner(omit(['id', 'children'], child))
            child.id = newChildId
          }
        }
      }

      commit('addProjections', [projectionToDuplicate])
      commit('updateCurrentProjection', projectionToDuplicate)
    },
    setRunOptionsAsync({ state, commit }, options): Promise<void> {
      return new Promise((resolve) => {
        commit('setRunOptions', options)
        resolve()
      })
    },
    async saveUpdatedCurrentQueueToDB({ commit, dispatch, state, rootState }, projectionId: number): Promise<void> {
      const newQueueList = clone(state.queueList)
      let queueList = []
      if (newQueueList.length === 1) {
        queueList = newQueueList
      } else {
        queueList = newQueueList.filter((filter: any) => { return filter.children.length > 0 })
      }
      let isnewCu = false
      let newCurrentQeue = 0
      if (state.currentQueue) {
        isnewCu = await checkedQueueAndQueueRunnerIsNew(state.currentQueue?.id.toString())
      }
      if (!state.currentProjection) return
      if (state.currentProjection.runQueueSelections != null) {
        state.currentProjection.runQueueSelections.length = 0
      }
      if (state.currentProjection.runnerSelections != null) {
        state.currentProjection.runnerSelections.length = 0
      }
      for (let i = 0; i < queueList.length; i++) {
        const queue = queueList[i]
        // if (!queueList[i].children.length) {

        // }
        const isNew = await checkedQueueAndQueueRunnerIsNew(queueList[i].id.toString())
        if (state.currentProjection?.runQueueSelections !== null) {
          // if (queueList[i].children.length) {
          state.currentProjection?.runQueueSelections.push([])
          state.currentProjection?.runnerSelections.push([])
          //  }
        } else {
          state.currentProjection.runQueueSelections = []
          state.currentProjection.runnerSelections = []
        }

        if (isNew) {
          queueList[i].workspaceId = rootState.workspace.id
          queueList[i].mode = state.currentProjection?.mode
          queueList[i].projectionId = projectionId

          const newParentId = await useRunsAPIs().db.insertQueueRunner(omit(['id', 'children'], queueList[i]))
          if (state.currentQueue && state.currentQueue.id === queueList[i].id) {
            newCurrentQeue = newParentId
          }
          queueList[i].id = newParentId
          queueList[i].projectionId = queueList[i].projectionId ? queueList[i].projectionId : state.currentProjection?.id
          if (queueList[i].children.length) {
            for (let j = 0; j < queueList[i].children.length; j++) {
              const child = queueList[i].children[j]
              const isNewChild = await checkedQueueAndQueueRunnerIsNew(queueList[i].children[j].id.toString())
              queueList[i].children[j].parentId = queueList[i].id
              queueList[i].children[j].mode = state.currentProjection?.mode
              queueList[i].children[j].projectionId = projectionId
              queueList[i].children[j].workspaceId = rootState.workspace.id
              state.currentProjection?.runnerSelections[i].push(queueList[i].children[j].runnerId)
              if (isNewChild) {
                const newChildId = await useRunsAPIs().db.insertQueueRunner(omit(['id', 'children'], queueList[i].children[j]))

                if (state.currentQueue && state.currentQueue.id === queueList[i].children[j].id) {
                  newCurrentQeue = newChildId
                }
                queueList[i].children[j].id = newChildId
                state.currentProjection?.runQueueSelections[i].push(newChildId)
                queueList[i].children[j].projectionId = queueList[i].children[j].projectionId ? queueList[i].children[j].projectionId : state.currentProjection?.id
              } else {
                queueList[i].children[j].parentId = queueList[i].id
                queueList[i].children[j].mode = state.currentProjection?.mode
                queueList[i].children[j].projectionId = projectionId
                await useRunsAPIs().db.updateQueueRunner(queueList[i].children[j].id, omit(['id', 'children'], queueList[i].children[j]))
                state.currentProjection?.runQueueSelections[i].push(queueList[i].children[j].id)
              }
            }
          }
        } else {
          queueList[i].projectionId = projectionId
          await useRunsAPIs().db.updateQueueRunner(queueList[i].id, omit(['id', 'children'], queueList[i]))
          if (queueList[i].children.length) {
            for (let j = 0; j < queueList[i].children.length; j++) {
              const child = queueList[i].children[j]
              const isNewChild = await checkedQueueAndQueueRunnerIsNew(queueList[i].children[j].id.toString())
              queueList[i].children[j].parentId = queueList[i].id
              queueList[i].children[j].mode = state.currentProjection?.mode
              queueList[i].children[j].projectionId = projectionId
              queueList[i].children[j].workspaceId = rootState.workspace.id
              state.currentProjection?.runnerSelections[i].push(queueList[i].children[j].runnerId)
              if (isNewChild) {
                const newChildId = await useRunsAPIs().db.insertQueueRunner(omit(['id', 'children'], queueList[i].children[j]))

                if (state.currentQueue && state.currentQueue.id === queueList[i].children[j].id) {
                  newCurrentQeue = newChildId
                }
                queueList[i].children[j].id = newChildId
                state.currentProjection?.runQueueSelections[i].push(newChildId)
                queueList[i].children[j].projectionId = queueList[i].children[j].projectionId ? queueList[i].children[j].projectionId : state.currentProjection?.id
              } else {
                queueList[i].children[j].parentId = queueList[i].id
                queueList[i].children[j].mode = state.currentProjection?.mode
                queueList[i].children[j].projectionId = projectionId
                await useRunsAPIs().db.updateQueueRunner(queueList[i].children[j].id, omit(['id', 'children'], queueList[i].children[j]))
                state.currentProjection?.runQueueSelections[i].push(queueList[i].children[j].id)
              }
            }
          }
        }
      }

      await useRunsAPIs().db.deleteQueueRunnerItem(clone(state.deleteCurQueueRunnerItems))
      const projectionToUpdate = clone(state.currentProjection!)
      await useRunsAPIs().db.updateProjection(projectionToUpdate.id, projectionToUpdate)

      // dispatch('queryProjectionQueuesFromDB')
      // setTimeout(() => {
      //   dispatch('queryProjectionQueuesFromDB')
      // }, 2000)
      await dispatch('queryProjectionQueuesFromDB')
      if (isnewCu) {
        commit('updateCurrentQueue', newCurrentQeue)
      }
      commit('changeIsProjectionSaveStatus', true)
    },
    async queryProjectionQueuesFromDB({ commit, state, rootState }): Promise<void> {
      if (!state.currentProjection) return
      let newQueueList = [] as any
      const parentQueue = await useRunsAPIs().db.queryProjectionQueues(rootState.workspace.id, state.currentProjection?.id, state.currentProjection?.mode, 0)
      newQueueList = parentQueue
      for (let i = 0; i < newQueueList.length; i++) {
        newQueueList[i].children = []
        const childQueue = await useRunsAPIs().db.queryProjectionQueues(rootState.workspace.id, state.currentProjection?.id, state.currentProjection?.mode, newQueueList[i].id)

        if (newQueueList[i].children?.length >= 0) {
          newQueueList[i].children?.push(...childQueue)
        } else {
          // newQueueList[i].children = []
          newQueueList[i].children?.push(...childQueue)
        }
      }

      await commit('recoveryQueueList', newQueueList)
      // console.log(newQueueList)
    },
    async queryCurrentProjection({ commit, state, rootState }, id: number): Promise<void> {
      const oldProjections = await useRunsAPIs().db.queryProjections([id])
      commit('updateCurrentProjectionAndProjections', oldProjections[0])
      setTimeout(() => {
        commit('changeIsProjectionSaveStatus', true)
      }, 1000)
    },
    async CopyQueue({ commit, state, rootState }, queueId: number) {
      let copyQueue = clone(state.queueList.filter((item: any) => item.id === queueId)[0])
      const newName = generateCopyQueueName(state.queueList, copyQueue.name)

      copyQueue.name = newName
      copyQueue.id = 'new-' + generateRandomNumber()
      for (let i = 0; i < copyQueue.children.length; i++) {
        copyQueue.children[i].id = 'new-' + generateRandomNumber()
        copyQueue.children[i].parentId = copyQueue.id
      }
      commit('AddQueueList', copyQueue)
    }
  }
}

export default mod
