import { ModuleOption } from '../definition'
import { getModelNavigationNodeIdAndType, getOutputNavigationNodeIdAndType } from '../../utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { createAOutput, Output, OutputNavigationNode, OutputNavigationNodeType } from '@shared/dataModelTypes/runs/outputs'
import { UnsavedOutputExistsError } from '../../errors'
import { clone, omit } from '@shared/functional'
import { useOutputsAPIs } from '../../hooks/apis'
import { generateADuplicatedItemName } from './utils'
import type { ModelFileNavigationNode } from '@shared/dataModelTypes/models/models'
import { calcWarningForOutput } from './tasksSource'

interface State {
  hideOutputNavi: boolean
  outputs: Output[]
  currentOutput: Output | null
  // tempOutput is the Output created but not saved since its fields aren't set up correctly
  tempOutput: Output | null
  currentFileName: string | null
}
interface Getters {
  outputNaviTree: OutputNavigationNode[]
  // number is the modelId
  outputModelIdMap: Map<number, Output[]>
  outputIdMap: Map<number, Output>
  tempOutputNaviNode: OutputNavigationNode
  resultFileNaviTree: ModelFileNavigationNode[]
}
interface Mutations {
  toggleOutputNaviDisplay: void
  resetOutputs: void
  updateCurrentOutput: Output
  updateCurrentOutputWithOutputNaviNode: OutputNavigationNode
  addOutputs: Output[]
  setTempOutput: Output
  legalizeTemporaryOutput: Output
  changeFileName: string | null
  setOutputOptions: string | null
}

interface Actions {
  recoverOutputsFromDB: () => void
  selectUnsavedNewOutputIfExists: () => void
  createNewOutput: (modelId: number) => void
  saveUpdatedCurrentOutputToDB: () => void
  getOutputForId: (id: number) => Output | null
  deleteOutput: (id: number) => void
  duplicateOutput: (id: number) => void
  setOutputOptionsAsync: (id: number) => void
}

export type OutputsModule = ModuleOption<State, Getters, Mutations, Actions>
const mod: OutputsModule = {
  namespaced: true,
  state: {
    hideOutputNavi: false,
    outputs: [],
    currentOutput: null,
    tempOutput: null,
    currentFileName: null
  },
  getters: {
    outputModelIdMap(state): Map<number, Output[]> {
      return state.outputs.reduce((acc, cur) => {
        if (acc.get(cur.modelId)) {
          acc.get(cur.modelId)!.push(cur)
        } else {
          acc.set(cur.modelId, [cur])
        }
        return acc
      }, new Map<number, Output[]>())
    },
    outputIdMap(state): Map<number, Output> {
      return state.outputs.reduce((acc, cur) => {
        acc.set(cur.id, cur)
        return acc
      }, new Map<number, Output>())
    },
    outputNaviTree(_, getters, rootState): OutputNavigationNode[] {
      const modelNavigationTree = rootState.models.modelNavigationTree

      const OutputNaviTree = modelNavigationTree.map(node => {
        const { id: modelId } = getModelNavigationNodeIdAndType(node.id as string)
        const outputsOfThisModel = getters.outputModelIdMap.get(modelId) ?? []
        return {
          ...node,
          warning: 'success',
          children: outputsOfThisModel.map(output => {
            return {
              id: OutputNavigationNodeType.outputs + NaviNodeIdDelimiter + output.id,
              name: output.name,
              children: [],
              warning: calcWarningForOutput(output)
            }
          })
        }
      })
      return OutputNaviTree
    },
    tempOutputNaviNode(state): OutputNavigationNode {
      if (!state.tempOutput) {
        return {
          id: OutputNavigationNodeType.outputs + NaviNodeIdDelimiter + 0,
          name: '',
          children: []
        }
      }
      return {
        id: OutputNavigationNodeType.outputs + NaviNodeIdDelimiter + state.tempOutput.id,
        name: state.tempOutput.name,
        children: []
      }
    },
    resultFileNaviTree(_, getters, rootState): ModelFileNavigationNode[] {
      const modelNavigationTree = rootState.models.modelNavigationTree

      const OutputNaviTree = modelNavigationTree.map(node => {
        const { id: modelId } = getModelNavigationNodeIdAndType(node.id as string)
        const outputsOfThisModel = rootState.runs.projections ?? []
        return {
          id: modelId,
          name: node.name,
          folders: outputsOfThisModel.map(output => {
            return output.outputFolder
          })
        }
      })
      return OutputNaviTree
    }
  },
  mutations: {
    toggleOutputNaviDisplay(state) {
      state.hideOutputNavi = !state.hideOutputNavi
    },
    resetOutputs(state) {
      state.outputs = []
      state.currentOutput = null
      state.currentFileName = null
      state.tempOutput = null
    },
    updateCurrentOutput(state, Output: Output) {
      state.currentOutput = Output
    },
    updateCurrentOutputWithOutputNaviNode(state, naviNode: OutputNavigationNode) {
      const { id, type } = getOutputNavigationNodeIdAndType(naviNode.id)
      if (type === OutputNavigationNodeType.models) {
        state.currentOutput = null
      } else {
        state.currentOutput = state.outputs.find(Output => Output.id === id) ?? null
      }
    },
    addOutputs(state, Outputs: Output[]) {
      state.outputs.push(...Outputs)
    },
    setTempOutput(state, tempOutput: Output) {
      state.tempOutput = tempOutput
      state.outputs.push(tempOutput)
      state.currentOutput = tempOutput
    },
    legalizeTemporaryOutput(state, legalOutput: Output) {
      state.outputs[state.outputs.length - 1] = legalOutput
      state.currentOutput = legalOutput
      state.tempOutput = null
    },
    changeFileName(state, newFile) {
      state.currentFileName = newFile
    },
    setOutputOptions(state, options: any) {
      if (state.currentOutput) state.currentOutput.series = options
    }
  },
  actions: {
    async recoverOutputsFromDB({ commit, rootState }): Promise<void> {
      commit('resetOutputs')
      const Outputs = await useOutputsAPIs().db.queryAllOutputsOfWorkspace(rootState.workspace.id)
      commit('addOutputs', Outputs)
    },
    async selectUnsavedNewOutputIfExists({ commit, state }): Promise<void> {
      return new Promise((resolve, reject) => {
        if (state.tempOutput) {
          commit('updateCurrentOutput', state.tempOutput)
          reject(new UnsavedOutputExistsError(state.tempOutput.name))
        } else {
          resolve()
        }
      })
    },
    async createNewOutput({ commit, dispatch, rootState }, modelId: number): Promise<void> {
      return dispatch('selectUnsavedNewOutputIfExists').then(() => {
        const tempOutput: Output = createAOutput()
        tempOutput.modelId = modelId
        tempOutput.workspaceId = rootState.workspace.id
        commit('setTempOutput', tempOutput)
      }).catch(err => { throw err })
    },
    async saveUpdatedCurrentOutputToDB({ commit, state }): Promise<void> {
      try {
        const OutputToUpdate = clone(state.currentOutput!)
        if (OutputToUpdate.id === 0) {
          const newOutputId = await useOutputsAPIs().db.insertOutput(OutputToUpdate)
          commit('legalizeTemporaryOutput', {
            ...OutputToUpdate,
            id: newOutputId
          })
        } else {
          await useOutputsAPIs().db.updateOutput(OutputToUpdate.id, OutputToUpdate)
        }
      } catch (error) {
        // TODO: deal with error
        console.log('saveUpdatedCurrentOutputToDB error:', error)
      }
    },
    async getOutputForId({ state }, id: number): Promise<Output | null> {
      return new Promise(resolve => {
        resolve(state.outputs.find(item => item.id === id) ?? null)
      })
    },
    async deleteOutput({ state, rootState }, id: number): Promise<void> {
      // console.log(rootState)
      rootState.runs.runners.map(item => {
        item.outputs = item.outputs.filter(output => { return output !== id })
      })
      if (id === 0) {
        state.tempOutput = null
        state.outputs.pop()
        if (state.currentOutput?.id === 0) {
          state.currentOutput = null
        }
      } else {
        await useOutputsAPIs().db.deleteOutput(id)
        if (state.currentOutput?.id === id) {
          state.currentOutput = null
        }
        state.outputs = state.outputs.filter(item => item.id !== id)
      }
    },
    async duplicateOutput({ state, commit }, id: number): Promise<void> {
      const OutputToDuplicate = clone(state.outputs.find(item => item.id === id)!)
      OutputToDuplicate.name = generateADuplicatedItemName(OutputToDuplicate, state.outputs)
      const newId = await useOutputsAPIs().db.insertOutput(omit(['id'], OutputToDuplicate))
      OutputToDuplicate.id = newId
      commit('addOutputs', [OutputToDuplicate])
      commit('updateCurrentOutput', OutputToDuplicate)
    },
    setOutputOptionsAsync({ state, commit }, options): Promise<void> {
      return new Promise((resolve) => {
        commit('setOutputOptions', options as any)
        resolve()
      })
    }
  }
}

export default mod
