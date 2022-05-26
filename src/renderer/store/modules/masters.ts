
import { ModuleOption } from '../definition'
import { useProductsAPIs, useModelsAPIs } from '@/hooks/apis'
import { AnchorProductJson, MasterNavigationTree, SimplifiedProduct, CodeIndex, AnchorProduct } from '@shared/dataModelTypes/product/products'
import { getMasterNavigationNodeIdAndType, MasterNodeType, getModelNodeType, ModelNodeType } from '@/utils'
import masterDataSource from './masterDataSource'
import modelsDataSource from './modelsDataSource'
import { omit, clone } from '@shared/functional'
import { VariableSource } from '@shared/dataModelTypes/models/helpers'
import { constructStructureTreeDataForProduct, filterProductMaskAndBlock } from './utils'
import type { ModelNavigationTree, Property, Link, Variable, Series, Method } from '@shared/dataModelTypes'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
interface State {
  masterNavigationTree: MasterNavigationTree,
  modelNavigationTree: ModelNavigationTree
  currentMasterNode: SimplifiedProduct | undefined
  codeIndexes: CodeIndex[]
  currentProperty: Property | undefined
  hideMasterNaviView: boolean
  hidePropertyView: boolean
  showVaraibles: boolean
  showSeries: boolean
  showLinks: boolean
  showMethods: boolean
}

interface Getters {
  getterModelNavigationTree: ModelNavigationTree
  indicatorNavigations: Property[] | CodeIndex[]
}

interface Mutations {
  updateMasterNavigationTree: MasterNavigationTree
  updateModleNavigationTree: MasterNavigationTree
  updateMasterNavigationTreeByMasterId:SimplifiedProduct
  addMasterNavigationTree:SimplifiedProduct
  updateCurrentMasterNode: SimplifiedProduct | undefined
  updateCodeIndexes: CodeIndex[],
  toggleMasterNaviViewDisplay: void,
  togglePropertyViewDisplay: void,
  updatePropertyFilters:'showVaraibles' | 'showSeries' | 'showLinks' | 'showMethods'
}

interface Actions {
  recoverMasterFromDB: () => void
  insertMasterFromDB: (master:AnchorProductJson) => void
  deleteMasterFromDB: (masterId:number) => void
  updateMasterFromDB: (master:Partial<AnchorProductJson>) => void
  queryCodeIndexesByModelIdFromDB: (modelId:number) => void
}

export type MastersModule = ModuleOption<State, Getters, Mutations, Actions>

const master: MastersModule = {
  namespaced: true,
  state: {
    codeIndexes: [],
    masterNavigationTree: [],
    modelNavigationTree: [],
    currentMasterNode: undefined,
    currentProperty: undefined,
    hideMasterNaviView: false,
    hidePropertyView: false,
    showVaraibles: true,
    showSeries: true,
    showLinks: true,
    showMethods: true
  },
  getters: {
    getterModelNavigationTree: (state) => {
      if (!state.currentMasterNode?.id || state.currentMasterNode.id === '0') return []
      const { type, id } = getMasterNavigationNodeIdAndType(state.currentMasterNode.id)
      if ((type !== MasterNodeType.models && type !== MasterNodeType.product) || !state.currentMasterNode.masterId) return []
      let modelId = id
      if (type === MasterNodeType.product) {
        const { id } = getMasterNavigationNodeIdAndType(state.currentMasterNode.modelId!)
        modelId = id
      }
      const maskAndBlock = clone(modelsDataSource.getAllModelBlocksForAModel(modelId))
      const masterId:number = state.currentMasterNode.masterId
      const modelBlock = filterProductMaskAndBlock(maskAndBlock, masterId)
      return constructStructureTreeDataForProduct(modelBlock)
    },
    indicatorNavigations: (state, getters, rootState) => {
      const currentModelNode = rootState.models.currentModelNode
      if (!currentModelNode || !currentModelNode.id) return []
      const isModels = getModelNodeType(currentModelNode) === ModelNodeType.models
      if (isModels) return state.codeIndexes
      const completeModelBlocks = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
      if (!completeModelBlocks.modelId) return state.codeIndexes
      const variables = state.showVaraibles ? Array.from(Object.values(completeModelBlocks.variables)) : []
      const series = state.showSeries ? Array.from(Object.values(completeModelBlocks.series)) : []
      const links = state.showLinks ? Array.from(Object.values(completeModelBlocks.links)) : []
      const methods = state.showMethods ? Array.from(Object.values(completeModelBlocks.methods)) : []
      return [...variables, ...series, ...links, ...methods].filter((item:Link | Variable |Series | Method | any) => item.source === VariableSource.codeIndex || item.source === VariableSource.codeIndexFormula || item.source === '索引')
    }
  },
  mutations: {
    updateMasterNavigationTree(state, masters) {
      state.masterNavigationTree = masters
      if (!state.currentMasterNode && state.masterNavigationTree.length > 0) {
        const openTimes = state.masterNavigationTree.filter(item => item.openTime).map(item => item.openTime) as number[]
        if (openTimes && openTimes.length > 0) {
          const maxOpenTime:any = Math.max.apply(Math, openTimes)
          state.currentMasterNode = state.masterNavigationTree.find(item => item.openTime === maxOpenTime)
        } else {
          state.currentMasterNode = state.masterNavigationTree[0]
        }
      }
    },
    updateModleNavigationTree(state, model) {
      state.masterNavigationTree = model
    },
    updateMasterNavigationTreeByMasterId(state, master) {
      if (!state.currentMasterNode) return
      const openTime = new Date().getTime()
      // update currentMasterNode
      const currentMasterNodeId = state.currentMasterNode.id
      const { type, id } = getMasterNavigationNodeIdAndType(currentMasterNodeId)
      const updatedMaster = state.masterNavigationTree.find(masterNode => masterNode.id === master.id)!
      // state.masterNavigationTree.fill({ ...master, openTime }, index, index + 1)
      if (type === MasterNodeType.master) {
        updatedMaster.name = master.name
        if (currentMasterNodeId === master.id) {
          state.currentMasterNode = { ...master, openTime }
          masterDataSource.updatedMasterOpenTimeByMasterId(id, openTime)
        }
      } else {
        const isNewProduct = state.currentMasterNode.id === '0'
        const oldMasterProducts = updatedMaster.children?.find(child => child.id === MasterNodeType.product + NaviNodeIdDelimiter + 0)
        const updatedMasterProducts = master.children?.find(child => child.id === MasterNodeType.product + NaviNodeIdDelimiter + 0)
        const products = updatedMaster.children?.find(child => child.id === MasterNodeType.product + NaviNodeIdDelimiter + 0)
        if (isNewProduct) {
          const ids = oldMasterProducts?.children?.map(child => child.id)
          const product = updatedMasterProducts?.children?.find(child => !ids?.includes(child.id))
          state.currentMasterNode = product ? { ...product, openTime } : undefined
          product && products?.children?.push(product)
        } else {
          const ids = updatedMasterProducts?.children?.map(child => child.id)
          const findIndex = oldMasterProducts?.children?.findIndex(child => !ids?.includes(child.id))!
          const isDeleteProduct = findIndex !== -1
          if (isDeleteProduct) {
            products?.children?.splice(findIndex, 1)
            state.currentMasterNode = undefined
          } else {
            const updatedProduct = masterDataSource.getSimplifiedProductForView(currentMasterNodeId)!
            const product = products?.children?.find(child => updatedProduct?.id === child.id)!
            product.name = updatedProduct.name
          }
        }
      }
    },
    addMasterNavigationTree(state, master) {
      state.masterNavigationTree.push(master)
    },
    updateCurrentMasterNode(state, masterNode) {
      const openTime = new Date().getTime()
      state.currentMasterNode = masterNode ? { ...masterNode, openTime } : masterNode
    },
    updateCodeIndexes(state, codeIndexes) {
      state.codeIndexes = codeIndexes
    },
    toggleMasterNaviViewDisplay(state) {
      state.hideMasterNaviView = !state.hideMasterNaviView
    },
    togglePropertyViewDisplay(state) {
      state.hidePropertyView = !state.hidePropertyView
    },
    updatePropertyFilters(state, name) {
      state[name] = !state[name]
    }
  },
  actions: {
    async recoverMasterFromDB({ commit, rootState }): Promise<void> {
      const masters = await useProductsAPIs().products.db.queryAllMasterOfWorkspace(rootState.workspace.id)
      const masterExample = masters.map(master => new AnchorProduct(master))
      masterDataSource.addNewEntriesToMasterMap(masterExample)
      const simplifiedMasters = masterDataSource.getSimplifiedMasterForView()
      // update navigationTree
      commit('updateMasterNavigationTree', simplifiedMasters)
    },
    async insertMasterFromDB({ commit, rootState }, master:AnchorProductJson): Promise<void> {
      const params = clone(omit(['openTime'], master))
      const creator = await useModelsAPIs().getModelCreator()
      const updatedAt = new Date().getTime()
      const workspaceId = rootState.workspace.id
      const id = await useProductsAPIs().products.db.insertMastert({
        ...params,
        creator,
        updatedAt,
        workspaceId
      })
      // update cache data
      masterDataSource.clearTemporaryMaster()
      masterDataSource.addNewSingularToMasterMap(new AnchorProduct({
        ...params,
        workspaceId,
        id
      }))
      // update navigationTree
      const simplifiedMaster = masterDataSource.getSimplifiedMasterForViewByMasterId(id)
      setTimeout(() => {
        commit('addMasterNavigationTree', simplifiedMaster)
        commit('updateCurrentMasterNode', simplifiedMaster)
      }, 500)
      return id
    },
    async deleteMasterFromDB({ commit, state }, masterId:number): Promise<void> {
      const result = await useProductsAPIs().products.db.deleteMasterById(masterId)
      // update cache data deleteMaster
      result.deleteMaster && masterDataSource.deleteMasterById(masterId)
      return result
    },
    async updateMasterFromDB({ commit, state }, master: Partial<AnchorProductJson>): Promise<void> {
      const params = clone(omit(['openTime'], master))
      const result = await useProductsAPIs().products.db.updateMasterById(params)
      if (!result) return result
      // update cache data
      masterDataSource.updatedCompleteMaster(master)
      // update views
      const simplifiedMaster = masterDataSource.getSimplifiedMasterForViewByMasterId(params.id!)
      commit('updateMasterNavigationTreeByMasterId', simplifiedMaster)
      return result
    },
    async queryCodeIndexesByModelIdFromDB({ commit }, modelId:number): Promise<void> {
      const result = await useProductsAPIs()
        .indicators
        .db
        .queryCodeIndexesByModelId(modelId)
      commit('updateCodeIndexes', result)
    }
  }
}

export default master
