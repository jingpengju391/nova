import { ModuleOption } from '../definition'
import { VariableFile, ReplaceData, SearchModeType } from '@shared/dataModelTypes/globalSearchReplaces'
import { getReplaceData } from './globalSearchReplaceSource'
import modelsDataSource from './modelsDataSource'
import { useModelsAPIs } from '../../hooks/apis'
import { clone, omit } from '@shared/functional'
import type { ModelBlock, SimplifiedModelBlock } from '@shared/dataModelTypes'
import Mask from '@shared/dataModelTypes/models/masks'
import Block, { generateProductBlock } from '@shared/dataModelTypes/models/blocks'
import { ModelNavigationNodeType, NaviNodeIdDelimiter, Model } from '@shared/dataModelTypes/models/models'
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
import { onCodeIndexSelected } from '@/views/CoderView/config'
import eventBus, { setCodeIndexEditorValue } from '@/views/CoderView/eventBus'
import { getCodeIndexNavigationNodeIdAndType } from '@/utils'
interface State {
  searchValue:string
  currentVariables:VariableFile[]
  caseSensitive:boolean
  matchWhole:boolean
  regularExpress:boolean
  preserveCase:boolean
  replaceValue:string
  monacoModels: any
  matchModels:string[]
  currMonacoModels:any
  hideReplace:boolean
  matchPath: boolean
  searchRange: boolean
  totalSourceData:Array<Array<string>>
}

interface Getters {
  gettersSearchValue:string
  gettersCurrentVariables:VariableFile[]
  gettersCaseSensitive:boolean
  gettersMatchWhole:boolean
  gettersMatchPath:boolean
  gettersRegularExpress:boolean
  gettersPreserveCase:boolean
  gettersReplaceValue:string
  gettersMonacoModels:any
  gettersCurrMonacoModels:any
  gettersHideReplace: boolean
  gettersSearchRange: boolean
}

interface Mutations {
  updateSearchValue:string
  updateCurrentVariables:VariableFile[]
  updateCaseSensitive:boolean
  updateMatchWhole: boolean
  updateSearchRange:boolean
  updateMatchPath:void
  updateRegularExpress:boolean
  updatePreserveCase:boolean
  updateReplaceValue:string
  updateMonacoModels:any
  updateCurrMonacoModels:any
  updateHideReplace:boolean
  updateMatchModels:string[]
  clearMonacoModels:void
  updateTotalSourceData:Array<Array<string>>
}

interface Actions {
  updatePublicitysWithDBSync: (variableId: number) => void
}

export type GlobalSearchReplace = ModuleOption<State, Getters, Mutations, Actions>;

const mod: GlobalSearchReplace = {
  namespaced: true,
  state: {
    searchValue: '',
    currentVariables: [],
    caseSensitive: false,
    matchWhole: false,
    regularExpress: false,
    preserveCase: false,
    replaceValue: '',
    monacoModels: [],
    matchModels: [],
    currMonacoModels: null,
    hideReplace: true,
    matchPath: true,
    searchRange: false,
    totalSourceData: []
  },
  getters: {
    gettersSearchValue: state => state.searchValue,
    gettersCurrentVariables: state => state.currentVariables,
    gettersCaseSensitive: state => state.caseSensitive,
    gettersMatchWhole: state => state.matchWhole,
    gettersRegularExpress: state => state.regularExpress,
    gettersPreserveCase: state => state.preserveCase,
    gettersReplaceValue: state => state.replaceValue,
    gettersMonacoModels: state => state.monacoModels,
    gettersCurrMonacoModels: state => state.currMonacoModels,
    gettersHideReplace: state => state.hideReplace,
    gettersMatchPath: state => state.matchPath,
    gettersSearchRange: state => state.searchRange
  },
  mutations: {
    updateSearchValue: (state, searchValue) => {
      state.searchValue = searchValue
    },
    updateCurrentVariables: (state, variables) => {
      state.currentVariables.length = variables.length
      state.currentVariables = variables
    },
    updateCaseSensitive: (state) => {
      state.caseSensitive = !state.caseSensitive
    },
    updateMatchWhole: (state) => {
      state.matchWhole = !state.matchWhole
    },
    updateRegularExpress: (state) => {
      state.regularExpress = !state.regularExpress
    },
    updatePreserveCase: (state) => {
      state.preserveCase = !state.preserveCase
    },
    updateReplaceValue: (state, replaceValue) => {
      state.replaceValue = replaceValue
    },
    updateMonacoModels: (state, monacoModels) => {
      state.monacoModels.push(...monacoModels)
    },
    clearMonacoModels: (state) => {
      state.monacoModels.length = 0
    },
    updateCurrMonacoModels: (state, currMonacoModels) => {
      state.currMonacoModels = currMonacoModels
    },
    updateHideReplace: (state) => {
      state.hideReplace = !state.hideReplace
    },
    updateMatchPath: (state) => {
      state.matchPath = !state.matchPath
    },
    updateMatchModels: (state, params) => {
      state.matchModels = params
    },
    updateTotalSourceData: (state, params) => {
      state.totalSourceData = params
    },
    updateSearchRange: (state) => {
      state.searchRange = !state.searchRange
    }
  },
  actions: {
    async updatePublicitysWithDBSync({ commit, state, rootState, dispatch }): Promise<void> {
      const data: any = await getReplaceData()
      const newObject:any = {}
      for (let i = 0; i < data.length; i++) {
        const item = data[i]

        if (item.isCodeIndex) {
          newObject[SearchModeType.codeIndex] = newObject[SearchModeType.codeIndex] || {}
          newObject[SearchModeType.codeIndex][item.id] = item
        } else {
          if (item.modelId) {
            const updatedModelBlock = item.parentId ? new Block(item) : new Mask(item)
            // const simplifiedModelBlock = modelsDataSource.getSimplifiedModelBlockForView(updatedModelBlock.id)
            newObject[SearchModeType.modeBlock] = newObject[SearchModeType.modeBlock] || {}
            newObject[SearchModeType.modeBlock][item.id] = updatedModelBlock
          } else {
            newObject[SearchModeType.model] = newObject[SearchModeType.model] || {}
            newObject[SearchModeType.model][item.id] = item
          }
        }
      }

      if (newObject[SearchModeType.modeBlock]) {
        const updateds = Object.values(newObject[SearchModeType.modeBlock]) as ModelBlock[]
        const updateIds = updateds.map((item: any) => item.id)
        await useModelsAPIs().db.updateModelBlocks(updateIds, updateds, true, true)

        for (let i = 0; i < updateds.length; i++) {
          // @ts-ignore
          commit('models/updateModelBlockInDataSourceAndNaviTree', updateds[i], { root: true })
          const temporaryModelBlock: ModelBlock = modelsDataSource.getCompleteModelBlock(updateds[i].id)
          Object.assign(temporaryModelBlock, updateds[i])
        }
        // @ts-ignore
        rootState.models.currentModelNode && commit('models/updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + rootState.models.currentModelNode.id,
          name: rootState.models.currentModelNode.name,
          children: []
        }, { root: true })
      }

      if (newObject[SearchModeType.codeIndex]) {
        const updateds = Object.values(newObject[SearchModeType.codeIndex]) as CodeIndex[]
        for (let i = 0; i < updateds.length; i++) {
          // @ts-ignore
          delete updateds[i].isCodeIndex
          // @ts-ignore
          await dispatch('codeIndex/updateCodeIndexFromDB', updateds[i], { root: true })
        }
        const currentFormulaItem = rootState.models.currentFormulaItem
        if (currentFormulaItem?.isCodeIndex) {
          const { id } = getCodeIndexNavigationNodeIdAndType(currentFormulaItem.id)
          const codeIndex = modelsDataSource.getCodeIndexesByModeIdAndCodeIndexId(currentFormulaItem.modelId, id)
          codeIndex && onCodeIndexSelected(codeIndex)
          eventBus.emit(setCodeIndexEditorValue, codeIndex)
        }

        const openedFormulaItems = rootState.models.openedFormulaItems
        openedFormulaItems.forEach(formula => {
          if (formula.isCodeIndex) {
            const { id } = getCodeIndexNavigationNodeIdAndType(formula.id)
            const codeIndex = modelsDataSource.getCodeIndexesByModeIdAndCodeIndexId(formula.modelId, id)
            codeIndex && Object.assign(formula, {
              chooseIf: codeIndex.chooseIf,
              abandonIf: codeIndex.abandonIf
            })
          }
        })
      }

      if (newObject[SearchModeType.model]) {
        const updateds = Object.values(newObject[SearchModeType.model]) as Model[]
        for (let i = 0; i < updateds.length; i++) {
          // @ts-ignore
          delete updateds[i].isCodeIndex
          // @ts-ignore
          delete updateds[i].codeIndexes
          await useModelsAPIs().db.updateModel(updateds[i].id, updateds[i])
          // @ts-ignore
          commit('models/updateModelInDataSourceNaviTree', updateds[i], { root: true })
          // @ts-ignore
          commit('relation/updatedRelationModelNavigationTreeByProperty', true, { root: true })
        }
      }
    }
  }
}
export default mod
