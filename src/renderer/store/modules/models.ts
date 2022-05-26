import { ModuleOption } from '../definition'
import type {
  ModelJSON, ModelBlock, ModelNavigationNode, ModelNavigationTree,
  FormulaTabItem, SimplifiedModelBlock, SimplifiedModel,
  SimplifiedProperty, Property, LinkNode
} from '@shared/dataModelTypes'
import { useModelsAPIs, useWorkspacesAPIs } from '../../hooks/apis'
import {
  hasCalcFormula, getPropertyType, getModelNodeType, ModelNodeType,
  getModelNavigationNodeIdAndType, getMasterNavigationNodeIdAndType, getProductIdAndName, treeFind
} from '../../utils'
import { asyncForEach } from '@shared/commonUtils'
import { buildAppModelFromRawModels, buildAppModelFromRawModelBlocks, iterateModelBlockInPreOrder } from './utils'
import { omit, clone, once } from '@shared/functional'
import { ModelNavigationNodeType, NaviNodeIdDelimiter, Model, ClassifyList, ClassifyObj } from '@shared/dataModelTypes/models/models'
import modelsDataSource from './modelsDataSource'
import masterDataSource from './masterDataSource'
import dataInputsDataSource from './dataInputsDataSource'
import Mask from '@shared/dataModelTypes/models/masks'
import Block, { generateProductBlock } from '@shared/dataModelTypes/models/blocks'
import Link, { createLink, createLinkDialog } from '@shared/dataModelTypes/models/links'
import { UnsavedModelBlockExistsError, UnsavedModelExistsError, UnsavedProductExistsError, UnsavedPropertyExistsError } from '../../errors'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { createVariable, createVariableDialog } from '@shared/dataModelTypes/models/variables'
import { createSeries, createSeriesDiaLog } from '@shared/dataModelTypes/models/series'
import { createMethod, createMethodDialog } from '@shared/dataModelTypes/models/methods'
import { AnchorProduct, ProductFormula } from '@shared/dataModelTypes/product/products'
import { deleteAssumptionData, deleteAssociatedSourceData, deleteAssociatedSourceDataBatch } from './assumptionVarDataSource'
import { v4 as uuid } from 'uuid'
import { ElMessage } from 'element-plus'
import {
  assignmentForOpenedFormulaItemsByFindIndex, deleteNohasCalcFormulaLastFromOpenedFormulaItems, findIndexFormulaItemFromOpenedFormulaItems,
  getUpdatedPropertyBaseData, handleDetailedChildren, updatePropertyForKeys, updateUi, getNewProperty, getCurrentModelParentId,
  getSourceEnum, getUpdatedProperties, updatedModelBlockFormula, updatedModelBlockByBlockId, getParentProperty, getNewModelBlocksAndUpdatedModelBlocks,
  needUpdatedModelBlocks, updatedPropertyOrModelBlock
} from '../baseModules'
import { CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'

interface State {
  hideModelNaviView: boolean
  hidePropertyView: boolean
  hideConsole: boolean
  displayModelTreeNavi: boolean
  modelNavigationTree: ModelNavigationTree
  currentModelNode: SimplifiedModel | SimplifiedModelBlock | undefined
  currentRootNode: SimplifiedModel | SimplifiedModelBlock | undefined
  temporaryModelNode: SimplifiedModel | SimplifiedModelBlock | undefined
  currentMaskAndLink: { maskName: string, linkName: string }
  currentProperty: Property | undefined | any
  tempProperty: { blockId: number, property: Property } | undefined
  openedFormulaItems: FormulaTabItem[]
  currentFormulaItem: FormulaTabItem | undefined
  propertyClipboard: Property[]
  modifyToSaveFormulaItem: FormulaTabItem[]
  dependencyViewVisible: boolean
  panelComponent: boolean
  mainPaneDefaultRatio: Number
  classifyList: ClassifyList[]
  isRelationLink: boolean
}

interface Getters {
  gettersModelNavigationTree: ModelNavigationTree
}

interface Mutations {
  resetModels: void
  toggleModelNaviViewDisplay: void
  togglePropertyViewDisplay: void
  showPropertyView: void
  toggleConsoleDisplay: void
  showConsole: void
  setDisplayModelTreeNavi: boolean
  legalizeTemporaryModel: Model
  legalizeTemporaryModelBlock: Mask | Block
  addModelsToDataSourceAndNaviTree: Model[]
  addModelBlocksToDataSourceAndNaviTree: { modelBlocks: ModelBlock[], siblingId: number }
  deleteModelFromDataSourceAndNaviTree: number
  addTempModelToDataSourceAndNaviTree: Model
  addTempModelBlockToDataSourceAndNaviTree: Mask | Block
  deleteMaskFromDataSourceAndNaviTree: number
  deleteBlockFromDataSourceAndNaviTree: number
  deleteChildBlockFromDataSourceAndNaviTree: number
  deletePropertyFromDataSourceAndNaviTree: SimplifiedProperty
  updateModelInDataSourceNaviTree: SimplifiedModel
  updateModelBlockInDataSourceAndNaviTree: SimplifiedModelBlock
  updateCurrentModelNodeWithModelNaviNode: ModelNavigationNode
  updateCurrentBlockNodeWithModelNaviNode: ModelNavigationNode
  updateCurrentProperty: SimplifiedProperty
  updateCurrentPropertyFromLinkNode: LinkNode
  setPropertyClipboard: SimplifiedProperty[]
  clearPropertyClipboard: void
  updateCurrentFormulaItem: FormulaTabItem
  updateCurrentFormulaItemForAll: FormulaTabItem | undefined
  updateCurrentFormulaItemForBySource: FormulaTabItem | string
  closeFormula: FormulaTabItem
  closeAllFormula: void
  updateModifyToSaveFormulaItem: FormulaTabItem[]
  showDependencyView: void
  hideDependencyView: void
  updatePanelComponent: boolean
  updateMainPaneDefaultRatio: Number
  updateOpenedFormulaItemsAll: FormulaTabItem[]
  resetClassifyList: void
  addClassifyList: ClassifyList[]
  updateClassifyList: ClassifyObj
  clearCurrentMaskAndLink: void
  updateRelationLink: boolean
  updateFormulaItemContentByFormulaIndex: number
  clearCurrentProperty: void
  clearCurrentModelNode: void
  clearOpenedFormulaItems: void
  clearCurrentFormulaItems: void
}

interface Actions {
  recoverDefaultWorkspaceFromDB: () => void
  importModelsWithDBSync: (modelJSON: ModelJSON) => Model
  // generateModelJSON: (modelId: number) => void
  selectProperty: (property: SimplifiedProperty) => void
  saveUpdatedCurrentModelBlockToDB: (modelBlock?:SimplifiedModelBlock) => void
  saveUpdatedCurrentModelToDB: () => void
  saveUpdatedCurrentPropertyToDB: (updatedProperty: Property) => void
  saveFormulaForCurrentFormulaItem: (newFormula: string) => void
  saveFormulaForGivenFormulaItem: (newFormula: FormulaTabItem) => void
  selectUnsavedNewModelNodeIfExists: () => void
  addModel: () => void
  addModelDialog: (model: Model) => void
  copyModel: (modelId: number) => { success: boolean, error: Error | null }
  deleteModel: (id: number) => void
  removeModelTempFolder: (id: number) => void
  removeTempFolder: () => void
  copyModelBlock: (modelBlockId: number) => { success: boolean, error: Error | null }
  addMask: (modelId: number) => void
  addMaskDialog: (newMask: any) => void
  deleteMask: (maskId: number) => void
  /**
   * @param maskId {number} is the parent mask id
   */
  addBlock: (maskId: number) => void
  addBlockDialog: (newBlocks: any) => void
  deleteBlock: (id: number) => void
  /**
   * @param blockId {number} is the parent block id
   */
  addChildBlock: (blockId: number) => void
  addChildBlockDialog: (newChildBlokc: any) => void
  deleteChildBlock: (id: number) => void
  lookUpFullPropertyFor: (property: SimplifiedProperty) => Property
  selectUnsavedPropertyIfExists: () => void
  addProperty: (type: PropertyType) => void
  addPropertyLink: (node?: ModelNavigationNode) => void
  addPropertyDialog: (PropertyFrom: any) => void
  deleteProperty: (property: SimplifiedProperty) => void
  copyProperty: (property: SimplifiedProperty[]) => void
  pastePropertyFromClipboard: () => void
  updateModifyToSaveFormulaItemAsync: (formulas: FormulaTabItem[]) => void
  updateOpenedFormulaAllAsync: (formulas: FormulaTabItem[]) => void
  createNewClassifyList: (classifyObj: ClassifyObj) => void
  recoverClassifyListFromDB: () => void
  updateBlockLinks: (node: ModelNavigationNode) => void
  addProductBlock: (newProduct: AnchorProduct) => void
  updatedProductBlock: (product: AnchorProduct) => void
  deleteProduct: (productId: number) => void
}

export type ModelsModule = ModuleOption<State, Getters, Mutations, Actions>

export const getInitialState = once(() => ({
  hideModelNaviView: false,
  hidePropertyView: false,
  hideConsole: true,
  displayModelTreeNavi: false,
  modelNavigationTree: [] as ModelNavigationTree,
  currentModelNode: undefined,
  currentProperty: undefined,
  currentRootNode: undefined,
  temporaryModelNode: undefined,
  tempProperty: undefined,
  openedFormulaItems: [],
  currentFormulaItem: undefined,
  propertyClipboard: [],
  modifyToSaveFormulaItem: [],
  dependencyViewVisible: false,
  panelComponent: false,
  mainPaneDefaultRatio: 0.6,
  classifyList: [],
  isRelationLink: true,
  currentMaskAndLink: {
    linkName: '',
    maskName: ''
  }
} as State))

const mod: ModelsModule = {
  namespaced: true,
  state: getInitialState(),
  getters: {
    gettersModelNavigationTree(state): ModelNavigationTree {
      return state.modelNavigationTree
    }
  },
  mutations: {
    resetModels(state) {
      state.modelNavigationTree = []
      state.currentModelNode = undefined
      state.currentProperty = undefined
      state.tempProperty = undefined
      state.openedFormulaItems = []
      state.currentFormulaItem = undefined
      state.propertyClipboard = []
      state.currentRootNode = undefined
      state.modifyToSaveFormulaItem = []
      state.temporaryModelNode = undefined
      state.currentMaskAndLink = {
        linkName: '',
        maskName: ''
      }
    },
    clearCurrentProperty(state) {
      state.currentProperty = undefined
    },
    clearCurrentModelNode(state) {
      state.currentModelNode = undefined
    },
    clearOpenedFormulaItems(state) {
      state.openedFormulaItems.length = 0
    },
    clearCurrentFormulaItems(state) {
      state.currentFormulaItem = undefined
    },
    resetClassifyList(state) {
      state.classifyList = []
    },
    updateRelationLink(state, flag) {
      state.isRelationLink = flag
    },
    clearCurrentMaskAndLink(state) {
      state.currentMaskAndLink = {
        linkName: '',
        maskName: ''
      }
      const temporaryModelBlock = modelsDataSource.getTemporaryModelBlock()
      if (temporaryModelBlock) {
        modelsDataSource.deleteTemporaryModelBlock()
        const { id } = getCurrentModelParentId()
        const completeModelBlock = modelsDataSource.getCompleteModelBlock(id)
        state.currentModelNode = undefined
        if (completeModelBlock[PropertyType.links]['0']) {
          delete completeModelBlock[PropertyType.links]['0']
        }
      }
    },
    toggleModelNaviViewDisplay(state) {
      state.hideModelNaviView = !state.hideModelNaviView
    },
    togglePropertyViewDisplay(state) {
      state.hidePropertyView = !state.hidePropertyView
    },
    showPropertyView(state) {
      state.hidePropertyView = false
    },
    toggleConsoleDisplay(state) {
      state.hideConsole = !state.hideConsole
    },
    showConsole(state) {
      state.hideConsole = false
    },
    setDisplayModelTreeNavi(state, display) {
      state.displayModelTreeNavi = display
    },
    updatePanelComponent(state) {
      state.panelComponent = !state.panelComponent
    },
    legalizeTemporaryModel(state, legalModel: Model) {
      modelsDataSource.legalizeTemporaryModelWith(legalModel)
      state.modelNavigationTree[state.modelNavigationTree.length - 1] = {
        id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + legalModel.id,
        name: legalModel.name,
        children: []
      }
    },
    legalizeTemporaryModelBlock(state, legalModelBlock: Mask | Block) {
      modelsDataSource.legalizeTemporaryModelBlockWith(legalModelBlock)
      const ancestorPath = modelsDataSource.getAncestorPathForAModelBlock(legalModelBlock.id)
      let modelNaviNode = state.modelNavigationTree.find(node =>
        node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + legalModelBlock.modelId)!
      ancestorPath.slice(1, -1).forEach(ancestorId => {
        modelNaviNode = modelNaviNode.children.find(node =>
          node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
      })
      const length = modelNaviNode.children.length
      modelNaviNode.children[length - 1] = {
        id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + legalModelBlock.id,
        name: legalModelBlock.name,
        copyType: legalModelBlock.copyType,
        children: []
      }
    },
    // update navigation tree, modelMap, modelBlockMap and construct inheritance
    addModelsToDataSourceAndNaviTree(state, models) {
      const { newModelMap, newModelBlockMap, newModelNavigationNodes, newProductMap } = buildAppModelFromRawModels(models)
      modelsDataSource.addNewEntriesToModelMap(newModelMap)
      modelsDataSource.addNewEntriesToModelBlockMap(newModelBlockMap)
      modelsDataSource.addNewEntriesToProductMap(newProductMap)
      state.modelNavigationTree.push(...newModelNavigationNodes)
      const { id, type } = getModelNavigationNodeIdAndType(newModelNavigationNodes[0].id)
      switch (type) {
        case ModelNavigationNodeType.models:
          state.currentModelNode = modelsDataSource.getSimplifiedModelForView(id)
          break
        default:
          state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      }
      // each time a model node is clicked, clear the selected property
      state.currentProperty = undefined
    },
    addModelBlocksToDataSourceAndNaviTree(state, payload) {
      const siblingBlock = modelsDataSource.getCompleteModelBlock(payload.siblingId)!
      const parentBlock = siblingBlock.parentId
        ? modelsDataSource.getCompleteModelBlock(siblingBlock.parentId)
        : null
      const { newModelBlockMap, newModelNavigationNode } =
        buildAppModelFromRawModelBlocks(payload.modelBlocks, parentBlock)
      // add to data source
      modelsDataSource.addNewEntriesToModelBlockMap(newModelBlockMap)
      // add to navi tree
      const ancestorPath = modelsDataSource.getAncestorPathForAModelBlock(payload.siblingId)
      let modelNaviNode = state.modelNavigationTree.find(node =>
        node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + siblingBlock.modelId)!
      ancestorPath.slice(1, -1).forEach(ancestorId => {
        modelNaviNode = modelNaviNode.children.find(node =>
          node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
      })
      modelNaviNode.children.push(newModelNavigationNode)
      const { id } = getModelNavigationNodeIdAndType(newModelNavigationNode.id)
      state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      // each time a model node is clicked, clear the selected property
      state.currentProperty = undefined
    },
    deleteModelFromDataSourceAndNaviTree(state, modelId) {
      const modelNaviNodeId = ModelNavigationNodeType.models + NaviNodeIdDelimiter + modelId
      const index = state.modelNavigationTree.findIndex(node => node.id === modelNaviNodeId)
      index > -1 && state.modelNavigationTree.splice(index, 1)
      // clear the current model node if it is the same as the deleted one
      if (state.currentModelNode) {
        state.currentModelNode = modelId === state.currentModelNode.id ? undefined : state.currentModelNode
      }
      // clear all opened related formula items
      const newOpenedFormulaItems: FormulaTabItem[] = []
      state.openedFormulaItems.forEach(item => {
        if (modelsDataSource.validateBlockBelongsToModel(item.blockId, modelId) === false) {
          newOpenedFormulaItems.push(item)
        }
      })
      state.openedFormulaItems = newOpenedFormulaItems
      // clear current formula item
      if (state.currentFormulaItem && modelsDataSource.validateBlockBelongsToModel(state.currentFormulaItem.blockId, modelId)) {
        state.currentFormulaItem = undefined
      }
      // model has to be deleted from data source in the last
      modelsDataSource.deleteModel(modelId)
    },
    addTempModelToDataSourceAndNaviTree(state, tempModel) {
      modelsDataSource.setTemporaryModel(tempModel)
      state.modelNavigationTree.push({
        id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + tempModel.id,
        name: tempModel.name,
        children: []
      })
    },
    addTempModelBlockToDataSourceAndNaviTree(state, tempModelBlock) {
      modelsDataSource.setTemporaryModelBlock(tempModelBlock)
      const ancestorPath = modelsDataSource.getAncestorPathForAModelBlock(tempModelBlock.id)
      let modelNaviNode = state.modelNavigationTree.find(node =>
        node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + tempModelBlock.modelId)!

      ancestorPath.slice(1, -1).forEach(ancestorId => {
        modelNaviNode = modelNaviNode.children.find(node =>
          node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
      })

      modelNaviNode.children.push({
        id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempModelBlock.id,
        name: tempModelBlock.name,
        children: []
      })
    },
    deleteMaskFromDataSourceAndNaviTree(state, maskId) {
      // first, remove the mask from navi tree
      const mask = modelsDataSource.getCompleteModelBlock(maskId)!
      const modelNaviNodeBelonged = state.modelNavigationTree.find(node =>
        node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + mask.modelId
      )!
      const maskNaviNodeIndex = modelNaviNodeBelonged.children.findIndex(node =>
        node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + maskId
      )!
      maskNaviNodeIndex > -1 && modelNaviNodeBelonged.children.splice(maskNaviNodeIndex, 1)
      // second, clear the current model node if it is the same as the deleted one
      if (!state.currentModelNode) return
      if (getModelNodeType(state.currentModelNode) === ModelNodeType.modelBlocks &&
        (maskId === state.currentModelNode.id || modelsDataSource.validateBlockInheritedFromBlock(state.currentModelNode.id, maskId))) {
        state.currentModelNode = undefined
        state.currentProperty = undefined
      }
      // clear all opened related formula items
      const newOpenedFormulaItems: FormulaTabItem[] = []
      state.openedFormulaItems.forEach(item => {
        if (item.blockId !== maskId && !modelsDataSource.validateBlockInheritedFromBlock(item.blockId, maskId)) {
          newOpenedFormulaItems.push(item)
        }
      })
      state.openedFormulaItems = newOpenedFormulaItems
      // clear current formula item
      if (state.currentFormulaItem &&
        (state.currentFormulaItem.blockId === maskId || modelsDataSource.validateBlockInheritedFromBlock(state.currentFormulaItem.blockId, maskId))) {
        state.currentFormulaItem = undefined
      }
      // remove the mask from modelsDataSource in the last
      modelsDataSource.deleteMask(maskId)
    },
    deleteBlockFromDataSourceAndNaviTree(state, blockId) {
      // first, remove the block from navi tree
      const block = modelsDataSource.getCompleteModelBlock(blockId)!
      const modelNaviNodeBelonged = state.modelNavigationTree.find(node =>
        node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + block.modelId
      )!
      const maskNaviNodeBelonged = modelNaviNodeBelonged.children.find(node =>
        node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + block.parentId
      )!
      const blockNaviNodeIndex = maskNaviNodeBelonged?.children.findIndex(node =>
        node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + blockId
      )!
      blockNaviNodeIndex > -1 && maskNaviNodeBelonged.children.splice(blockNaviNodeIndex, 1)
      // second, clear the current model node if it is the same as the deleted one
      if (getModelNodeType(state.currentModelNode!) === ModelNodeType.modelBlocks &&
        (blockId === state.currentModelNode!.id || modelsDataSource.validateBlockInheritedFromBlock(state.currentModelNode!.id, blockId))) {
        state.currentModelNode = undefined
        state.currentProperty = undefined
      }
      // clear all opened related formula items
      const newOpenedFormulaItems: FormulaTabItem[] = []
      state.openedFormulaItems.forEach(item => {
        if (item.blockId !== blockId && !modelsDataSource.validateBlockInheritedFromBlock(item.blockId, blockId)) {
          newOpenedFormulaItems.push(item)
        }
      })
      state.openedFormulaItems = newOpenedFormulaItems
      // clear current formula item
      if (state.currentFormulaItem &&
        (state.currentFormulaItem.blockId === blockId || modelsDataSource.validateBlockInheritedFromBlock(state.currentFormulaItem.blockId, blockId))) {
        state.currentFormulaItem = undefined
      }
      const modelBlockType = modelsDataSource.getModelBlockType(blockId)
      // remove the block from modelsDataSource in the last
      modelsDataSource.deleteBlock(blockId)
    },
    deleteChildBlockFromDataSourceAndNaviTree(state, blockId) {
      // first, remove the child block from navi tree
      const [modelId, maskId, parentBlockId, selfBlockId] = modelsDataSource.getAncestorPathForAModelBlock(blockId)
      const modelNaviSubTree = state.modelNavigationTree.find(node =>
        node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + modelId
      )!
      const maskNaviSubTree = modelNaviSubTree.children.find(node =>
        node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + maskId
      )!
      const parentBlockNaviSubTree = maskNaviSubTree.children.find(node =>
        node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + parentBlockId
      )!
      const selfBlockIndex = parentBlockNaviSubTree.children.findIndex(node =>
        node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + selfBlockId
      )!
      selfBlockIndex > -1 && parentBlockNaviSubTree.children.splice(selfBlockIndex, 1)
      // second, clear the current model node if it is the same as the deleted one
      if (getModelNodeType(state.currentModelNode!) === ModelNodeType.modelBlocks &&
        blockId === state.currentModelNode!.id) {
        state.currentModelNode = undefined
      }
      // clear all opened related formula items
      const newOpenedFormulaItems: FormulaTabItem[] = []
      state.openedFormulaItems.forEach(item => {
        item.blockId !== blockId && newOpenedFormulaItems.push(item)
      })
      state.openedFormulaItems = newOpenedFormulaItems
      // clear current formula item
      if (state.currentFormulaItem && state.currentFormulaItem.blockId === blockId) {
        state.currentFormulaItem = undefined
      }
      // remove the child block from modelsDataSource in the last
      modelsDataSource.deleteChildBlock(selfBlockId)
    },
    deletePropertyFromDataSourceAndNaviTree(state, property) {
      const { id, currentBlockNodeId } = getCurrentModelParentId()
      const modelBlock = modelsDataSource.getCompleteModelBlock(id)!
      modelBlock.deleteProperty(property.type, property.id)
      // update current model node, so the property list will update automatically
      state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      if (state.displayModelTreeNavi) {
        state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(currentBlockNodeId)
      }
      // update current property
      if (state.currentProperty && property.id === state.currentProperty.id) {
        state.currentProperty = undefined
      }
      // update temporary property is necessary
      if (property.id === '0') {
        state.tempProperty = undefined
      }
      // update current formula item and opened formula items
      if (state.currentFormulaItem) {
        if (state.currentFormulaItem.propertyId === property.id) state.currentFormulaItem = undefined
        const index = state.openedFormulaItems.findIndex(formulaItem => formulaItem.propertyId === property.id)
        index > -1 && state.openedFormulaItems.splice(index, 1)
      }
    },
    updateModelInDataSourceNaviTree(state, updatedModel) {
      const model = modelsDataSource.getModel(updatedModel.id)
      // first update navi tree if necessary
      if (model.name !== updatedModel.name) {
        const naviNode = state.modelNavigationTree.find(modelNaviNode => {
          // eslint-disable-next-line no-unused-vars
          const [_, nodeId] = modelNaviNode.id.split(NaviNodeIdDelimiter)
          return model.id === parseInt(nodeId)
        })!
        naviNode.name = updatedModel.name
      }
      Object.assign(model, updatedModel)
    },
    updateModelBlockInDataSourceAndNaviTree(state, updatedModelBlock) {
      const modelBlock = modelsDataSource.getCompleteModelBlock(updatedModelBlock.id as number) as ModelBlock
      // first update navi tree if necessary
      if (modelBlock.name !== updatedModelBlock.name) {
        const ancestorIds = modelsDataSource.getAncestorPathForAModelBlock(modelBlock.id as number)
        let currentModelNaviSubTree: ModelNavigationTree = state.modelNavigationTree
        let currentModeNaviNode: ModelNavigationNode | null = null
        ancestorIds.forEach(id => {
          currentModeNaviNode = currentModelNaviSubTree.find(modelNaviNode => {
            // eslint-disable-next-line no-unused-vars
            const [_, nodeId] = modelNaviNode.id.split(NaviNodeIdDelimiter)
            return id === parseInt(nodeId)
          })!
          currentModelNaviSubTree = currentModeNaviNode.children
        })
        currentModeNaviNode!.name = updatedModelBlock.name
      }
      const newModelBlock = Object.assign(modelBlock, updatedModelBlock)
      state.modelNavigationTree.forEach((node: ModelNavigationNode) => {
        node.children.forEach((block: ModelNavigationNode) => {
          const { id, type } = getModelNavigationNodeIdAndType(block.id)
          if (id === newModelBlock.id) block.copyType = newModelBlock.copyType
        })
      })
    },
    updateCurrentModelNodeWithModelNaviNode(state, newModelNaviNode) {
      let currentModelNode: SimplifiedModel | SimplifiedModelBlock
      const { id, type } = getModelNavigationNodeIdAndType(newModelNaviNode.id)
      switch (type) {
        case ModelNavigationNodeType.models:
          currentModelNode = modelsDataSource.getSimplifiedModelForView(id)
          break
        default:
          currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      }
      state.currentModelNode = currentModelNode
      // each time a model node is clicked, clear the selected property
      state.currentProperty = undefined
    },
    updateCurrentBlockNodeWithModelNaviNode(state, newModelNaviNode) {
      const { id, type } = getModelNavigationNodeIdAndType(newModelNaviNode.id)
      let currentModelNode: SimplifiedModel | SimplifiedModelBlock | undefined
      switch (type) {
        case ModelNavigationNodeType.models:
          currentModelNode = modelsDataSource.getSimplifiedModelForView(id)
          break
        default:
          currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      }
      state.currentModelNode = currentModelNode
    },
    updateCurrentProperty(state, simplifiedProperty) {
      const { id: modelBlockId } = getCurrentModelParentId()
      const newProperty = modelsDataSource.getProperty(
        simplifiedProperty.id, simplifiedProperty.type, modelBlockId as number)
      if (newProperty.source === 'toDefine') {
        newProperty.isDefining = true
      }
      const flag = newProperty?.source === 'codeIndex' || newProperty?.source === 'codeIndexFormula'
      state.openedFormulaItems = state.openedFormulaItems.filter(formulaItem => formulaItem.propertyId !== newProperty.id || formulaItem.isCodeIndex === flag)
      state.currentProperty = newProperty
      state.currentFormulaItem = state.openedFormulaItems.find(f => f.name === state.currentFormulaItem?.name)
      if (!state.currentFormulaItem) {
        state.currentFormulaItem = state.openedFormulaItems.find(f => f.openTime ===
        Math.max(...state.openedFormulaItems.map((formula:FormulaTabItem) => formula.openTime)))
      }
      // set state's temp property, which has block id and new property
      if (simplifiedProperty.id === '0') {
        // state.tempProperty = {
        //   blockId: state.currentModelNode!.id,
        //   property: newProperty
        // }
        state.tempProperty = undefined
      }
    },
    updateCurrentPropertyFromLinkNode(state, linkNode) {
      const newProperty = modelsDataSource.getProperty(
        linkNode.id, PropertyType.links, linkNode.maskId)
      state.currentProperty = newProperty
    },
    setPropertyClipboard(state, simplifiedPropertys) {
      const { id } = getCurrentModelParentId()
      state.propertyClipboard = []
      simplifiedPropertys.forEach(simplifiedProperty => {
        const newSimplifiedProperty = modelsDataSource.getProperty(simplifiedProperty.id, simplifiedProperty.type, id)
        state.propertyClipboard.push(newSimplifiedProperty)
      })
    },
    clearPropertyClipboard(state) {
      state.propertyClipboard = []
    },
    updateCurrentFormulaItem(state, formulaItem) {
      let currentFormulaItem: FormulaTabItem
      const index = findIndexFormulaItemFromOpenedFormulaItems(formulaItem, state.openedFormulaItems)
      if (index === -1) {
        deleteNohasCalcFormulaLastFromOpenedFormulaItems(state.openedFormulaItems)
        state.openedFormulaItems.push(formulaItem)
        currentFormulaItem = state.openedFormulaItems[state.openedFormulaItems.length - 1]
      } else {
        currentFormulaItem = assignmentForOpenedFormulaItemsByFindIndex(formulaItem, state.openedFormulaItems)
      }
      state.currentFormulaItem = currentFormulaItem
    },
    updateCurrentFormulaItemForAll(state, formulaItem) {
      state.currentFormulaItem = formulaItem
    },
    updateCurrentFormulaItemForBySource(state, formulaItem) {
      if (typeof formulaItem === 'string') {
        const formulaItemName = formulaItem
        const index = state.openedFormulaItems.findIndex(item => item.name === formulaItemName)
        if (index > -1) {
          state.currentFormulaItem = state.openedFormulaItems[index]
        }
        return
      }
      const index = state.openedFormulaItems.findIndex(item => item.name === formulaItem.name)

      if (index === -1) {

      } else {
        state.openedFormulaItems[index].original = formulaItem.original
        state.openedFormulaItems[index] = formulaItem
      }
      state.currentFormulaItem = formulaItem
    },
    closeFormula(state, formulaItem) {
      const index = state.openedFormulaItems.findIndex(item => item.name === formulaItem.name)
      if (index === 0) {
        state.openedFormulaItems.splice(index, 1)
        state.currentFormulaItem = state.openedFormulaItems[0]
      } else if (index > 0) {
        state.openedFormulaItems.splice(index, 1)
        state.currentFormulaItem = state.openedFormulaItems[index - 1]
      }
    },
    closeAllFormula(state) {
      state.openedFormulaItems.length = 0
      state.currentFormulaItem = undefined
    },
    updateModifyToSaveFormulaItem(state, formulaItems) {
      state.modifyToSaveFormulaItem = formulaItems
    },
    showDependencyView(state) {
      state.dependencyViewVisible = true
    },
    hideDependencyView(state) {
      state.dependencyViewVisible = false
    },
    updateOpenedFormulaItemsAll(state, formulas) {
      state.openedFormulaItems = formulas
      if (!formulas.length) {
        state.currentFormulaItem = undefined
      }
    },
    updateMainPaneDefaultRatio(state, pane) {
      state.mainPaneDefaultRatio = pane
    },
    addClassifyList(state, ClassifyList: ClassifyList[]) {
      state.classifyList = ClassifyList
    },
    updateClassifyList(state, ClassifyObj: ClassifyObj) {
      const newArr = state.classifyList.filter(item => item.modelId !== ClassifyObj.modelId)
      state.classifyList = []
      state.classifyList.push(...newArr, ...ClassifyObj.ClassifyList)
    },
    updateFormulaItemContentByFormulaIndex(state, index: number) {
      const position = Number(index)
      const someCodeIndex = state.openedFormulaItems.findIndex(item => item.id === state.currentFormulaItem?.id)
      const productFormulas = state.openedFormulaItems[someCodeIndex].productFormulas
      state.openedFormulaItems[someCodeIndex].formulasIndex = position
      if (productFormulas && position !== -1) {
        const { key, content, name } = modelsDataSource.getFormulaItemNameKeyAndContent(state.currentProperty, productFormulas[position].formula, state.currentModelNode, position)
        state.openedFormulaItems[someCodeIndex].content = content
        state.openedFormulaItems[someCodeIndex].key = key
        state.openedFormulaItems[someCodeIndex].name = name
      }
      state.currentFormulaItem = state.openedFormulaItems[someCodeIndex]
    }
  },
  actions: {
    async recoverDefaultWorkspaceFromDB({ commit, rootState }): Promise<void> {
      commit('resetModels')
      const models = await useModelsAPIs().db.queryAllModelsOfWorkspace(rootState.workspace.id)
      // @ts-ignore
      models.length > 0 && commit('addModelsToDataSourceAndNaviTree', models)
    },
    async importModelsWithDBSync({ commit, rootState }, modelJSON: ModelJSON): Promise<Model> {
      const newModelJSON: ModelJSON = {
        id: 0,
        name: modelJSON.name ?? 'MODEL_' + new Date().getTime(),
        description: '',
        tags: [],
        rootBlockId: modelJSON.rootBlockId,
        blocks: modelJSON.blocks,
        products: modelJSON.products,
        workspaceId: rootState.workspace.id
      }
      const newModel = await useModelsAPIs().db.importModelJSON(newModelJSON)
      // @ts-ignore
      commit('addModelsToDataSourceAndNaviTree', [newModel])
      return newModel
    },
    async selectProperty({ commit, state }, property: SimplifiedProperty): Promise<void> {
      property.blockId && updatedModelBlockByBlockId(property.blockId)
      const { id } = getCurrentModelParentId()
      const currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      commit('updateCurrentProperty', property)
      // auto open calc formula for variables, series, links and methods
      const parentProperty = getParentProperty(id)

      const formulasIndex = (property.formulasIndex || property.formulasIndex === 0)
        ? property.formulasIndex
        : modelsDataSource.getFormulaItemFormulasIndex(state.openedFormulaItems, state.currentProperty)
      const productFormulas = state.currentProperty.productFormulas || []
      const {
        key, content, name
      } = modelsDataSource.getFormulaItemNameKeyAndContent(
        state.currentProperty, productFormulas[formulasIndex]?.formula, currentModelNode, formulasIndex)
      const formula = {
        name: name,
        content: content,
        key: key,
        blockName: currentModelNode!.name,
        modelId: modelsDataSource.getModelIdFormula(currentModelNode!.id),
        blockId: currentModelNode!.id as number,
        propertyType: getPropertyType(state.currentProperty!),
        propertyId: state.currentProperty!.id,
        formulasIndex,
        unsaved: false,
        readOnly: state.currentProperty!.isDirect
          ? false : !state.currentProperty!.isDefining,
        hasCalcFormula: hasCalcFormula(state.currentProperty!, parentProperty),
        breadcrumb: modelsDataSource.getBreadcrumb(currentModelNode!.id, state.currentProperty!, key),
        openTime: new Date().getTime(),
        productFormulas,
        original: property?.original || [],
        isCodeIndex: state.currentProperty.source === 'codeIndex' || state.currentProperty.source === 'codeIndexFormula'
      }
      commit('updateCurrentFormulaItem', {
        id: modelsDataSource.getUniqueIdentificationFormula(formula),
        ...formula
      })
    },
    async saveUpdatedCurrentModelBlockToDB({ commit, state, rootState, dispatch }, modelBlock): Promise<void> {
      if (!state.currentModelNode && !modelBlock) return
      const currentModelNode = modelBlock || state.currentModelNode as SimplifiedModelBlock
      try {
        const updatedModelBlock = clone({
          ...currentModelNode,
          name: currentModelNode!.name || state.currentMaskAndLink.maskName,
          variables: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.variables, currentModelNode.id),
          series: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.series, currentModelNode.id),
          links: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.links, currentModelNode.id),
          methods: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.methods, currentModelNode.id)
        }) as ModelBlock
        const ancestorMask = modelsDataSource.getMaskOfAModelBlock(currentModelNode.id)
        let newModelBlockId = updatedModelBlock.id
        if (updatedModelBlock.id === 0) {
          newModelBlockId = await useModelsAPIs().db.insertModelBlock(updatedModelBlock, ancestorMask.id)
          const newModelBlock = { ...updatedModelBlock, id: newModelBlockId } as Mask | Block
          let legalizeModelBlock: Mask | Block
          if (updatedModelBlock.parentId) {
            const parent = modelsDataSource.getCompleteModelBlock(updatedModelBlock.parentId) as Mask | Block
            legalizeModelBlock = new Block(parent, newModelBlock)
          } else {
            legalizeModelBlock = new Mask(newModelBlock)
          }

          // update legalize mask tree
          commit('legalizeTemporaryModelBlock', legalizeModelBlock)
          // update legalize CurrentModelNode
          commit('updateCurrentModelNodeWithModelNaviNode', {
            id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + newModelBlockId,
            name: updatedModelBlock.name,
            children: []
          })
        } else {
          await useModelsAPIs().db.updateModelBlock(updatedModelBlock.id as number, updatedModelBlock, ancestorMask.id)

          updatedModelBlockFormula(currentModelNode, state.openedFormulaItems)

          // @ts-ignore
          dispatch('relation/saveUpdatedRelationLickByModelBlockToDb', updatedModelBlock, { root: true })
          // update tree
          commit('updateModelBlockInDataSourceAndNaviTree', updatedModelBlock)
        }
        // only for mask
        const completeModelBlock = modelsDataSource.getCompleteModelBlock(newModelBlockId)

        if (!updatedModelBlock.modelId) return
        const detailedChildren = modelsDataSource.getAllModelBlocksForAModel(updatedModelBlock.modelId)
          .filter(modelBlock => modelBlock?.parentId === completeModelBlock.id)
        if (updatedModelBlock.isProductMask) {
          const updatedProductMasks = detailedChildren.filter(child => child.isProductMask)
          const { update, insert, updateIds } = getNewModelBlocksAndUpdatedModelBlocks(updatedModelBlock, updatedProductMasks)
          const newModelBlockIds = await useModelsAPIs().db.insertModelBlocks(insert)
          const newBlocksMap = new Map()
          insert.forEach((mask, index) => {
            newBlocksMap.set(<number>newModelBlockIds[index], new Mask({
              ...mask,
              id: newModelBlockIds[index]
            }))
          })
          modelsDataSource.addNewEntriesToProductModelBlockMap(newBlocksMap)
          await useModelsAPIs().db.updateModelBlocks(updateIds, update, true, true)
        } else {
          const productMaskIds = detailedChildren.filter(child => child.isProductMask && !!child.productId).map(mask => mask.id)
          productMaskIds.length && await useModelsAPIs().db.deleteModelBlocks(productMaskIds)
          modelsDataSource.deleteModelBlocksById(productMaskIds, currentModelNode.id)
        }
      } catch (error) {
        // TODO: deal with error
        console.log('saveUpdatedCurrentModelBlockToDB error:', error)
      }
    },
    async saveUpdatedCurrentModelToDB({ commit, state }): Promise<void> {
      try {
        const modelToUpdate = clone(omit(['codeIndexes'], state.currentModelNode))
        // delete modelToUpdate.detailedParentId
        if (modelToUpdate.id === 0) {
          const newModelId = await useModelsAPIs().db.insertModel(modelToUpdate)
          commit('legalizeTemporaryModel', {
            ...modelToUpdate,
            id: newModelId
          })
          commit('updateCurrentModelNodeWithModelNaviNode', {
            id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + newModelId,
            name: modelToUpdate.name!,
            children: []
          })
        } else {
          await useModelsAPIs().db.updateModel(modelToUpdate.id, modelToUpdate)
          commit('updateModelInDataSourceNaviTree', modelToUpdate)
          // @ts-ignore
          // commit('relation/updateModelInDataSourceNaviTree', modelToUpdate, { root: true })
          // @ts-ignore
          commit('relation/updatedRelationModelNavigationTreeByProperty', true, { root: true })
        }
      } catch (error) {
        // TODO: deal with error
        console.log('error:', error)
      }
    },
    async saveUpdatedCurrentPropertyToDB({ commit, dispatch, state, rootState }, updatedProperties: Property): Promise<void> {
      const updatedProperty = await getUpdatedProperties(updatedProperties)
      const { id } = getCurrentModelParentId()
      const { propertyType, oldProperty, formulaChanged, headerChanged, isANewProperty, calcModelNode, modelId, thisBlock } = getUpdatedPropertyBaseData(updatedProperty)
      const products = masterDataSource.getCompleteMastersByModelId(modelId as number)
      if (isANewProperty) {
        updatedProperty.id = uuid()
        delete (modelsDataSource.getCompleteModelBlock(id) as any)[propertyType]['0']
        modelsDataSource.getCompleteModelBlock(id)!.addProperty(propertyType, clone(updatedProperty))
      } else {
        updatePropertyForKeys(id, updatedProperty, oldProperty, propertyType, products)
        handleDetailedChildren(thisBlock, propertyType, updatedProperty, oldProperty)
      }
      const updateModelBlocks = needUpdatedModelBlocks()
      const updateIds = updateModelBlocks.map(block => block.id)
      await useModelsAPIs().db.updateModelBlocks(updateIds, updateModelBlocks, formulaChanged, headerChanged)

      // update UI
      state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(state.currentModelNode!.id)
      commit('updateCurrentProperty', { id: updatedProperty.id, type: propertyType, name: updatedProperty.name, modifiedAt: updatedProperty.modifiedAt })

      if (state.currentFormulaItem) {
        const currentFormulaItem = updateUi(state.currentProperty, state.openedFormulaItems, calcModelNode)
        commit('updateCurrentFormulaItem', currentFormulaItem)
      }

      if (!updatedProperties.override && oldProperty.override !== updatedProperties.override) {
        const openedFormulaItems = clone(state.openedFormulaItems)
        openedFormulaItems.forEach((formula: FormulaTabItem) => {
          // @ts-ignore
          formula.content = modelsDataSource.getCompleteModelBlock(formula.blockId)[propertyType][updatedProperty.id][formula.key]
        })
        commit('updateOpenedFormulaItemsAll', openedFormulaItems)
      }

      const noLink = getPropertyType(updatedProperty) === PropertyType.links
      if (noLink) {
        const relationCurrentModelNodeSource = clone(rootState.relation.relationCurrentModelNodeSource)
        // @ts-ignore
        commit('relation/updateRelationCurrentModelNodeSourceNaviNode', undefined, { root: true })
        // @ts-ignore
        commit('relation/updateRelationCurrentModelNodeSourceNaviNode', relationCurrentModelNodeSource, { root: true })
        const updatedPropertyName = updatedProperty?.target?.blockName || updatedProperty?.target?.maskName
        const oldPropertyName = oldProperty?.target?.blockName || oldProperty?.target?.maskName
        // @ts-ignore
        if (isANewProperty || !updatedPropertyName || !oldPropertyName || updatedPropertyName !== oldPropertyName) {
          // @ts-ignore
          commit('relation/updatedRelationModelNavigationTreeByProperty', true, { root: true })
        }
      }
    },
    async saveFormulaForCurrentFormulaItem({ commit, state, dispatch }, newFormula: string): Promise<void> {
      const currentFormulaItem = JSON.parse(JSON.stringify(state.currentFormulaItem!)) as FormulaTabItem
      currentFormulaItem.content = newFormula
      await dispatch('saveFormulaForGivenFormulaItem', currentFormulaItem)
    },
    async saveFormulaForGivenFormulaItem({ commit, state, dispatch }, formula): Promise<void> {
      const { property, modelBlock, oldProperty, thisBlock } = updatedPropertyOrModelBlock(formula, false)
      const modifiedAt = new Date().getTime()
      const creator = await useModelsAPIs().getModelCreator()
      const products = masterDataSource.getCompleteMastersByModelId(formula.modelId)
      if (property && oldProperty) {
        property.modifiedAt = modifiedAt
        property.creator = creator

        updatePropertyForKeys(formula.blockId, property, oldProperty, formula.propertyType as PropertyType, products)
        handleDetailedChildren(thisBlock, formula.propertyType as PropertyType, property, oldProperty)
      }

      try {
        if (modelBlock) {
          await useModelsAPIs().db.updateModelBlock(modelBlock.id as number, modelBlock, modelBlock.id, true, true)
        } else {
          const updateModelBlocks = needUpdatedModelBlocks(formula.blockId)
          const updateIds = updateModelBlocks.map(block => block.id)
          await useModelsAPIs().db.updateModelBlocks(updateIds, updateModelBlocks, true, true)
        }
        // updated view
        updatedPropertyOrModelBlock(formula, true)
        commit('updateCurrentProperty', { id: formula.propertyId, type: formula.propertyType as PropertyType, name: formula.name })
        // save to current formula item
        if (state.currentModelNode!.id === formula.blockId) { // update ui
          state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(formula.blockId)
        }
      } catch (error) {
        // TODO: deal with error
        console.log('saveFormulaForGivenFormulaItem error:', error)
      }
    },
    async updateModifyToSaveFormulaItemAsync({ state, dispatch }, formulas: FormulaTabItem[]): Promise<void> {
      for (let i = 0; i < formulas.length; i++) {
        const formula = formulas[i]
        await dispatch('saveFormulaForGivenFormulaItem', formula)
      }
    },
    async selectUnsavedNewModelNodeIfExists({ commit, state }): Promise<void> {
      // if a temp model already exists, select that model
      return new Promise((resolve, reject) => {
        const unsavedModel = modelsDataSource.getTemporaryModel()
        const unsavedModelBlock = modelsDataSource.getTemporaryModelBlock()
        const unsavedProduct = modelsDataSource.getTemporaryProduct()
        if (unsavedModel) {
          const tempModelNaviNode = state.modelNavigationTree[state.modelNavigationTree.length - 1]
          commit('updateCurrentModelNodeWithModelNaviNode', tempModelNaviNode)
          commit('showPropertyView')
          reject(new UnsavedModelExistsError(unsavedModel.name))
        } else if (unsavedModelBlock) {
          const ancestorPath = modelsDataSource.getAncestorPathForAModelBlock(0)
          let modelNaviNode = state.modelNavigationTree.find(node => node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + ancestorPath[0])!
          ancestorPath.slice(1).forEach(ancestorId => {
            modelNaviNode = modelNaviNode.children.find(node =>
              node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
          })
          commit('updateCurrentModelNodeWithModelNaviNode', modelNaviNode)
          commit('showPropertyView')
          reject(new UnsavedModelBlockExistsError(unsavedModelBlock.name))
        } else if (unsavedProduct) {
          // todo to update navigation node
          // const tempModelNaviNode = state.modelNavigationTree[state.modelNavigationTree.length - 1]
          // commit('updateCurrentModelNodeWithModelNaviNode', tempModelNaviNode)
          // commit('showPropertyView')
          reject(new UnsavedProductExistsError(unsavedProduct.name))
        } else {
          resolve()
        }
      })
    },
    async addModel({ commit, dispatch, rootState }): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary model to model data source and a model navi tree
        // after the model is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this model will be cleared when app restarts
        const tempModel: Model = {
          id: 0, // which indicate its a temporary one
          name: '',
          description: '',
          tags: [],
          rootBlockId: null, // which indicate no root block selected
          detailedChildren: [],
          // anchorProducts: [],
          workspaceId: rootState.workspace.id
        }

        commit('addTempModelToDataSourceAndNaviTree', tempModel)
        // select the tempModel
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + tempModel.id,
          name: tempModel.name,
          children: []
        })
        commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async addModelDialog({ commit, dispatch, rootState }, newModel: Model): Promise<void> {
      console.log(newModel, 'newModel')

      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary model to model data source and a model navi tree
        // after the model is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this model will be cleared when app restarts
        const tempModel: Model = {
          id: 0, // which indicate its a temporary one
          name: newModel.name,
          description: newModel.description,
          tags: [],
          isDateCenter: newModel.isDateCenter,
          dateAlignType: newModel.dateAlignType,
          rootBlockId: null, // which indicate no root block selected
          detailedChildren: [],
          // anchorProducts: [],
          workspaceId: rootState.workspace.id
        }
        commit('addTempModelToDataSourceAndNaviTree', tempModel)
        // select the tempModel
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + tempModel.id,
          name: tempModel.name,
          children: []
        })
        // commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async copyModel({ commit }, modelId: number): Promise<{ success: boolean, error: Error | null }> {
      try {
        const modelToCopy = modelsDataSource.getModel(modelId)
        delete modelToCopy.codeIndexes
        let allModelBlocks
        if (!navigator.userAgent.toLowerCase().includes('electron')) {
          allModelBlocks = modelsDataSource.getAllModelBlocksForAModelWithoutDetailChildern(modelId)
          modelToCopy.detailedChildren = []
        } else {
          allModelBlocks = clone(modelsDataSource.getAllModelBlocksForAModel(modelId))
        }
        allModelBlocks.forEach((block: ModelBlock) => {
          for (const key in block.variables) {
            delete block.variables[key].assumptionBind
          }
        })
        const modelName = modelsDataSource.generateCopyModelName(modelId, modelToCopy.name)
        const newModel = await useModelsAPIs().db.copyModel(modelToCopy, modelName, allModelBlocks) as Model
        // @ts-ignore
        commit('addModelsToDataSourceAndNaviTree', [newModel])
        // @ts-ignore
        commit('relation/addModelsToDataSourceAndNaviTree', {
          id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + newModel.id,
          name: newModel.name!,
          children: []
        }, { root: true })
        return { success: true, error: null }
      } catch (err: any) {
        return { success: false, error: err }
      }
    },
    async deleteModel({ commit, dispatch }, id: number): Promise<void> {
      dispatch('removeModelTempFolder', id)
      await useModelsAPIs().db.deleteModel(id)
      const codeIndexes = modelsDataSource.getCodeIndexesByModeId(id)
      // @ts-ignore
      dispatch('codeIndex/deleteCodeIndexksFromDB', codeIndexes, { root: true })
      commit('deleteModelFromDataSourceAndNaviTree', id)
      // @ts-ignore
      commit('relation/deleteModelFromDataSourceAndNaviTree', id, { root: true })
      dataInputsDataSource.deleteDataInputsInModelWithDBSync(id)
      deleteAssumptionData(id)
    },
    async removeModelTempFolder({ rootState }, id: number): Promise<void> {
      const model = modelsDataSource.getModel(id)!
      await useWorkspacesAPIs().removeTempFolderForModel(rootState.workspace.fileName, model.name)
    },
    async removeTempFolder({ rootState }): Promise<void> {
      await useWorkspacesAPIs().removeTempFolder()
    },
    async copyModelBlock({ commit }, modelBlockId: number): Promise<{ success: boolean, error: Error | null }> {
      try {
        const modelBlockToCopy = clone(modelsDataSource.getCompleteModelBlock(modelBlockId))
        for (const key in modelBlockToCopy.variables) {
          delete modelBlockToCopy.variables[key].assumptionBind
        }
        const copyBlocks = iterateModelBlockInPreOrder(modelBlockToCopy)
        const modelId = modelBlockToCopy.modelId
        let id = -1
        const newModelNames: string[] = copyBlocks.map(block => {
          const name = modelsDataSource.generateCopyBlockModelName(block.id as number, block.name)
          modelsDataSource.setTemporaryModelBlocksforCheck({ id, name, modelId })
          id--
          return name
        })
        modelsDataSource.clearTemporaryModelBlocksforCheck()
        const ancestorMask = modelsDataSource.getMaskOfAModelBlock(modelBlockId)
        const newModelBlocks = await useModelsAPIs().db.copyModelBlock(modelBlockToCopy, newModelNames, ancestorMask.id) as any
        newModelBlocks.forEach((block: any) => {
          block.variables = JSON.parse(block.variables)
          block.series = JSON.parse(block.series)
          block.links = JSON.parse(block.links)
          block.methods = JSON.parse(block.methods)
          block.tags = JSON.parse(block.tags)
        })
        const currentModel = modelsDataSource.getModel(modelBlockToCopy.modelId!)
        currentModel.detailedChildren = newModelBlocks
        commit('addModelBlocksToDataSourceAndNaviTree', {
          modelBlocks: newModelBlocks,
          siblingId: modelBlockId
        })
        return { success: true, error: null }
      } catch (err: any) {
        return { success: false, error: err }
      }
    },
    async addMask({ commit, dispatch, rootState, state }, modelId: number): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary mask to model data source and a model navi tree
        // after the mask is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this mask will be cleared after app restarts
        const tempMask = new Mask()
        tempMask.modelId = modelId
        tempMask.workspaceId = rootState.workspace.id
        commit('addTempModelBlockToDataSourceAndNaviTree', tempMask)
        // select the tempMask
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempMask.id,
          name: tempMask.name,
          children: []
        })
        commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async addMaskDialog({ commit, dispatch, rootState, state }, newMask: any): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary mask to model data source and a model navi tree
        // after the mask is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this mask will be cleared after app restarts
        const tempMask = new Mask()
        tempMask.modelId = newMask.id
        tempMask.name = newMask.name
        tempMask.rebaseNeeded = newMask.rebaseNeeded
        tempMask.tags = newMask.tags
        tempMask.slidingWindow = newMask.slidingWindow
        tempMask.description = newMask.description
        tempMask.copyType = newMask.copyType
        tempMask.workspaceId = rootState.workspace.id
        commit('addTempModelBlockToDataSourceAndNaviTree', tempMask)
        // select the tempMask
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempMask.id,
          name: tempMask.name,
          children: []
        })
        //  commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async deleteMask({ commit, dispatch, state }, maskId: number): Promise<void> {
      let completeModel
      const completeModelBlock = modelsDataSource.getCompleteModelBlock(maskId)
      if (completeModelBlock.modelId) completeModel = modelsDataSource.getCompleteModel(completeModelBlock.modelId)
      try {
        await useModelsAPIs().db.deleteModelBlock(maskId)
        commit('deleteMaskFromDataSourceAndNaviTree', maskId)
        // @ts-ignore
        commit('relation/delRelationLinkByModelBlock', maskId, { root: true })
      } catch (err) {
        console.log('deleteMask error:', err)
      }
    },
    async addBlock({ commit, dispatch }, maskId: number): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary mask to model data source and a model navi tree
        // after the mask is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this mask will be cleared after app restarts
        const parent = modelsDataSource.getCompleteModelBlock(maskId) as Mask
        const tempBlock = new Block(parent)
        commit('addTempModelBlockToDataSourceAndNaviTree', tempBlock)
        // select the tempMask
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempBlock.id,
          name: tempBlock.name,
          children: []
        })
        commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async addBlockDialog({ commit, dispatch }, newBlocks: any): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary mask to model data source and a model navi tree
        // after the mask is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this mask will be cleared after app restarts
        const parent = modelsDataSource.getCompleteModelBlock(newBlocks.id) as Mask
        const tempBlock = new Block(parent)
        tempBlock.name = newBlocks.name
        tempBlock.rebaseNeeded = newBlocks.rebaseNeeded
        tempBlock.tags = newBlocks.tags
        tempBlock.description = newBlocks.description
        tempBlock.slidingWindow = newBlocks.slidingWindow
        tempBlock.copyType = newBlocks.copyType
        commit('addTempModelBlockToDataSourceAndNaviTree', tempBlock)
        // select the tempMask
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempBlock.id,
          name: tempBlock.name,
          children: []
        })
        // commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async addProductBlock({ commit, dispatch, state }, newProduct: AnchorProduct): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(async () => {
        try {
          const newModelBlocks: ModelBlock[] = []
          const blockArray = Array.from(modelsDataSource.getModelBlockMap().values())
          const blocks = blockArray.filter(block => !block.parentId && block.modelId === newProduct.modelId && !block.productId && block.isProductMask)
          const blockNames = blockArray.filter(block => {
            const { id } = getProductIdAndName(block)
            return !!id
          }).map(block => block.name)
          blocks.forEach(block => {
            const newBlock = generateProductBlock(newProduct, block as Block)
            newBlock && !(blockNames.includes(newBlock.name)) && newModelBlocks.push({ ...omit(['id', 'parent', 'children', 'detailedChildren', 'startUp', 'detailedParent'], newBlock) })
          })
          const newModelBlockIds = await useModelsAPIs().db.insertModelBlocks(newModelBlocks)
          const newBlocksMap = new Map()
          const newBlocks = newModelBlocks
          newBlocks.forEach((mask, index) => {
            newBlocksMap.set(<number>newModelBlockIds[index], new Mask({
              ...mask,
              id: newModelBlockIds[index]
            }))
          })
          modelsDataSource.addNewEntriesToModelBlockMap(newBlocksMap)
        } catch (err) {
          console.log('addProductBlock is error: ', err)
        }
        // todo ui react
      }).catch((err: any) => { throw err })
    },
    async updatedProductBlock({ commit, dispatch, state }, product): Promise<void> {
      const masks = modelsDataSource.getAllModelBlocksForAModel(product.modelId!)
      const modelMasks = masks.filter(mask => mask.isProductMask && !mask.productId)

      const newProductMask: ModelBlock[] = []
      const updateIds: number[] = []
      modelMasks.forEach(master => {
        const newBlock = generateProductBlock(product, master as any)!
        newProductMask.push(newBlock)
        const findMask = masks.find(mask => mask.name === newBlock.name)!
        updateIds.push(findMask.id)
      })

      await useModelsAPIs().db.updateModelBlocks(updateIds, newProductMask, true, true)

      modelMasks.forEach(master => {
        const newBlock = generateProductBlock(product, master as any)!
        const findMask = masks.find(mask => mask.name === newBlock.name)!
        Object.assign(findMask, omit(['id'], newBlock))
      })
    },
    async deleteBlock({ commit }, id: number): Promise<void> {
      deleteAssociatedSourceDataBatch(id).then(async _ => {
        try {
          const ancestorMask = modelsDataSource.getMaskOfAModelBlock(id)
          await useModelsAPIs().db.deleteModelBlock(id, ancestorMask.id)
          commit('deleteBlockFromDataSourceAndNaviTree', id)
          // @ts-ignore
          commit('relation/delRelationLinkByModelBlock', id, { root: true })
        } catch (err) {
          console.log('deleteBlock error:', err)
        }
      })
    },
    async addChildBlock({ commit, dispatch }, blockId: number): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary mask to model data source and a model navi tree
        // after the mask is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this mask will be cleared after app restarts
        const parent = modelsDataSource.getCompleteModelBlock(blockId) as Block
        const tempBlock = new Block(parent)
        commit('addTempModelBlockToDataSourceAndNaviTree', tempBlock)
        // select the tempMask
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempBlock.id,
          name: tempBlock.name,
          children: []
        })
        commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async addChildBlockDialog({ commit, dispatch }, newChildBlock: any): Promise<void> {
      return dispatch('selectUnsavedNewModelNodeIfExists').then(() => {
        // add a temporary mask to model data source and a model navi tree
        // after the mask is set properly(with a unique name) and saved into DB
        // it will receive a legal id from DB, only then it will become a formal one
        // otherwise, this mask will be cleared after app restarts
        const parent = modelsDataSource.getCompleteModelBlock(newChildBlock.id) as Block
        const tempBlock = new Block(parent)
        tempBlock.name = newChildBlock.name
        tempBlock.rebaseNeeded = newChildBlock.rebaseNeeded
        tempBlock.tags = newChildBlock.tags
        tempBlock.description = newChildBlock.description
        tempBlock.slidingWindow = newChildBlock.slidingWindow
        tempBlock.copyType = newChildBlock.copyType
        commit('addTempModelBlockToDataSourceAndNaviTree', tempBlock)
        // select the tempMask
        commit('updateCurrentModelNodeWithModelNaviNode', {
          id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + tempBlock.id,
          name: tempBlock.name,
          children: []
        })
        //  commit('showPropertyView')
      }).catch((err: any) => { throw err })
    },
    async deleteChildBlock({ commit }, id: number): Promise<void> {
      //  await useModelsAPIs().db.deleteProduct(id)
      deleteAssociatedSourceDataBatch(id).then(async _ => {
        try {
          const ancestorMask = modelsDataSource.getMaskOfAModelBlock(id)
          await useModelsAPIs().db.deleteModelBlock(id, ancestorMask.id)
          // commit('deleteBlockFromDataSourceAndNaviTree', id)
          commit('deleteChildBlockFromDataSourceAndNaviTree', id)
        } catch (err) {
          console.log('deleteBlock error:', err)
        }
      })
    },
    async deleteProduct({ commit }, id: number): Promise<void> {
      try {
        const anchorProduct = modelsDataSource.getProduct(id)
        modelsDataSource.deleteProduct(id)
        await useModelsAPIs().db.deleteProduct(id)
        modelsDataSource.getModelBlockMap().forEach(async block => {
          if (block.modelId === anchorProduct.modelId && block.productId === id) {
            const ancestorMask = modelsDataSource.getMaskOfAModelBlock(block.id as number)
            await useModelsAPIs().db.deleteModelBlock(block.id as number, ancestorMask.id)
            modelsDataSource.deleteChildBlock(block.id as number)
          }
        })
        // todo ui react
        // commit('deleteChildBlockFromDataSourceAndNaviTree', id)
      } catch (err) {
        console.log('deleteChildBlock error:', err)
      }
    },
    async lookUpFullPropertyFor({ state }, property: SimplifiedProperty): Promise<Property> {
      const { id } = getCurrentModelParentId()
      return modelsDataSource.getProperty(property.id, property.type, id)
    },
    async selectUnsavedPropertyIfExists({ commit, state }) {
      return new Promise((resolve, reject) => {
        if (state.tempProperty) {
          // find the belonged model block navi node first
          const ancestorPath = modelsDataSource.getAncestorPathForAModelBlock(state.tempProperty.blockId)
          let modelNaviNode = state.modelNavigationTree.find(node =>
            node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + ancestorPath[0])!
          ancestorPath.slice(1).forEach(ancestorId => {
            modelNaviNode = modelNaviNode.children.find(node =>
              node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
          })
          // select the belonged model block
          commit('updateCurrentModelNodeWithModelNaviNode', modelNaviNode)
          // then select the property
          commit('updateCurrentProperty', {
            id: state.tempProperty.property.id,
            type: getPropertyType(state.tempProperty.property),
            name: state.tempProperty.property.name
          })
          reject(new UnsavedPropertyExistsError(''))
        } else {
          resolve()
        }
      })
    },
    async addProperty({ dispatch, commit, state }, type: PropertyType): Promise<void> {
      return dispatch('selectUnsavedPropertyIfExists').then(async () => {
        // create a new property with id === 0
        let newProperty: Property | undefined
        const tempPropertyId = '0'
        const creator = await useModelsAPIs().getModelCreator()
        switch (type) {
          case PropertyType.variables:
            newProperty = createVariable(tempPropertyId, creator)
            break
          case PropertyType.series:
            newProperty = createSeries(tempPropertyId, creator)
            break
          case PropertyType.links:
            newProperty = createLink(tempPropertyId, creator)
            break
          default:
            newProperty = createMethod(tempPropertyId, creator)
        }
        // add the new property into current model block
        const currentModelNode = state.currentModelNode as SimplifiedModelBlock
        const { id: blockId } = getCurrentModelParentId()
        const modelBlock = modelsDataSource.getCompleteModelBlock(blockId)
        modelBlock[type][tempPropertyId] = newProperty
        // reset currentModelNode to itself to refresh property list
        if (!currentModelNode?.parentNode?.id) {
          state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(currentModelNode.id)
        }
        // update current property
        commit('updateCurrentProperty', { id: tempPropertyId, type, name: '', modifiedAt: new Date().getTime() })
      }).catch((err: any) => { throw err })
    },
    addPropertyLink({ dispatch, commit, state }, node): Promise<void> {
      return dispatch('selectUnsavedPropertyIfExists').then(async () => {
        const tempPropertyId = '0'
        const creator = await useModelsAPIs().getModelCreator()
        const newProperty = createLink(tempPropertyId, creator)
        const currentModelNode = state.currentModelNode as SimplifiedModelBlock
        const { id: blockId } = getCurrentModelParentId()
        const modelBlock = modelsDataSource.getCompleteModelBlock(blockId)
        modelBlock[PropertyType.links][tempPropertyId] = newProperty
        if (!currentModelNode?.parentNode?.id) {
          state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(currentModelNode.id)
        }
        commit('updateCurrentProperty', { id: tempPropertyId, type: PropertyType.links, name: '', modifiedAt: new Date().getTime() })
      })
    },
    async addPropertyDialog({ dispatch, commit, state }, PropertyFrom: any): Promise<void> {
      return dispatch('selectUnsavedPropertyIfExists').then(async () => {
        // create a new property with id === 0
        let newProperty: Property | undefined
        const tempPropertyId = '0'
        const creator = await useModelsAPIs().getModelCreator()
        switch (PropertyFrom.PropertyType) {
          case PropertyType.variables:
            newProperty = createVariableDialog(PropertyFrom, creator)
            break
          case PropertyType.series:
            newProperty = createSeriesDiaLog(PropertyFrom, creator)
            break
          case PropertyType.links:
            newProperty = createLinkDialog(PropertyFrom, creator)
            break
          default:
            newProperty = createMethodDialog(PropertyFrom, creator)
        }
        // add the new property into current model block
        const { id: currId } = getCurrentModelParentId()

        const modelBlock = modelsDataSource.getCompleteModelBlock(currId) as any
        modelBlock[PropertyFrom.PropertyType][tempPropertyId] = newProperty

        // update current property
        commit('updateCurrentProperty', { id: tempPropertyId, type: PropertyFrom.PropertyType, name: PropertyFrom.name })
      }).catch((err: any) => { throw err })
    },
    async deleteProperty({ commit, state, rootState }, property: SimplifiedProperty) {
      try {
        const { id, currentBlockNodeId } = getCurrentModelParentId()
        const modelBlock = clone(modelsDataSource.getCompleteModelBlock(id)!)
        const ancestorMask = modelsDataSource.getMaskOfAModelBlock(modelBlock.id as number)
        const res = await useModelsAPIs().db.deleteProperty(property.id, property.type, modelBlock, ancestorMask.id)
        await deleteAssociatedSourceData(property)
        commit('deletePropertyFromDataSourceAndNaviTree', property)
        return res
      } catch (err) {
        console.log('deleteProperty error:', err)
      }
    },
    async updateBlockLinks({ commit, state }, node: ModelNavigationNode) {
      try {
        if (node.parentNode) {
          const { id } = getModelNavigationNodeIdAndType(node.parentNode.id)
          const modelBlock = clone(modelsDataSource.getCompleteModelBlock(id))
          const allLinks: Link[] = Object.values(modelBlock.links)
          const links = allLinks.filter((item: Link) => item.target && item.target?.maskName === node.name)
          links.forEach(item => delete modelBlock.links[item.id])
          const ancestorMask = modelsDataSource.getMaskOfAModelBlock(Number(modelBlock.id))
          const res = await useModelsAPIs().db.updateModelBlock(modelBlock.id as number, modelBlock, ancestorMask.id, true, true)
          commit('updateModelBlockInDataSourceAndNaviTree', modelBlock)
          state.temporaryModelNode = undefined
          return res
        }
      } catch (err) {
        console.log('deleteProperty error:', err)
      }
    },
    async copyProperty({ commit }, propertys: SimplifiedProperty[]) {
      commit('setPropertyClipboard', propertys)
    },
    async pastePropertyFromClipboard({ commit, state }) {
      try {
        const { id, currentBlockNodeId } = getCurrentModelParentId()
        asyncForEach(state.propertyClipboard,
          async (propertyClipboard) => {
            const propertyType = getPropertyType(propertyClipboard!)
            const properties = modelsDataSource.getAllClonedPropertiesOfType(propertyType, id)
            const propertyID = uuid()
            const newPropertyName = modelsDataSource.generateCopyPropertyName(propertyID, id, propertyClipboard!.name)
            const newProperty = {
              ...clone(propertyClipboard!),
              id: propertyID,
              name: newPropertyName,
              isDirect: true,
              isDefining: true,
              source: propertyClipboard?.source === 'parent' ? (propertyType === 'series' ? 'calculated' : 'default') : propertyClipboard?.source,
              modifiedAt: new Date().getTime(),
              creator: await useModelsAPIs().getModelCreator()
            }
            properties[newProperty.id] = newProperty
            const fieldsToUpdate: any = {
              [propertyType]: properties
            }
            const ancestorMask = modelsDataSource.getMaskOfAModelBlock(id as number)
            await useModelsAPIs().db.updateModelBlock(id, fieldsToUpdate, ancestorMask.id, true, true)
            // after db update success, update model data source and property navi list
            modelsDataSource.getCompleteModelBlock(id)!.addProperty(propertyType, newProperty)
            // update UI
            state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
            if (state.displayModelTreeNavi) {
              state.currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(currentBlockNodeId)
            }
            commit('updateCurrentProperty', { id: newProperty.id, type: propertyType, name: newProperty.name })
          })
      } catch (err) {
        // TODO:
        console.log('pasteProperty error:', err)
      }
    },
    async updateOpenedFormulaAllAsync({ commit }, formulas: FormulaTabItem[]) {
      commit('updateOpenedFormulaItemsAll', formulas)
    },
    async createNewClassifyList({ commit }, ClassifyObj: ClassifyObj): Promise<void> {
      const newclassifyList = clone(ClassifyObj.ClassifyList)
      return useModelsAPIs().db.insertModelsClassifyListToDB(ClassifyObj.modelId, newclassifyList).then(result => {
        modelsDataSource.addClassifyList(JSON.parse(JSON.stringify(newclassifyList)), ClassifyObj.modelId)
        commit('updateClassifyList', ClassifyObj)
      })
    },
    async recoverClassifyListFromDB({ commit, rootState }): Promise<void> {
      commit('resetClassifyList')
      const classifyList = await useModelsAPIs().db.queryAllClassifyListFromDB(rootState.workspace.id)
      const classifyLists: any = []
      classifyList.map((item: any) => {
        classifyLists.push(...item)
      })
      commit('addClassifyList', classifyLists)
    }
  }
}

export default mod
