import { ModuleOption } from '../definition'
import type {
  ModelBlock, ModelNavigationNode, ModelNavigationTree,
  SimplifiedModelBlock, SimplifiedModel,
  SimplifiedProperty, Property
} from '@shared/dataModelTypes'
import { useModelsAPIs } from '../../hooks/apis'
import {
  hasCalcFormula, getPropertyType, getModelNodeType, ModelNodeType,
  getModelNavigationNodeIdAndType,
  treeFind
} from '../../utils'
import { getCurrentModelParentId, getAncestorPaths, getLinkTarget, getRelationLickByModelBlock, updatedModelBlocksLinkName } from '../baseModules'
import { clone, once } from '@shared/functional'
import { ModelNavigationNodeType, NaviNodeIdDelimiter, Model } from '@shared/dataModelTypes/models/models'
import modelsDataSource from './modelsDataSource'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import { createLink } from '@shared/dataModelTypes/models/links'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { v4 as uuid } from 'uuid'
interface State {
  modelNavigationTree: ModelNavigationTree
  currentNavigationNode: ModelNavigationNode | undefined
  currentMaskAndLink: { maskName: string, linkName: string }
  isRelationLink: boolean
  relationCurrentModelNodeSource: ModelNavigationNode | undefined
  toModelNavigationTree:Boolean
}
interface Getters {}
interface Mutations {
  addModelsToDataSourceAndNaviTree: ModelNavigationNode[] | ModelNavigationNode
  legalizeTemporaryModel: Model
  deleteModelFromDataSourceAndNaviTree: number
  delRelationLinkByModelBlock:number
  updateModelInDataSourceNaviTree: SimplifiedModel
  updateModelBlockInDataSourceAndNaviTree: ModelBlock
  addRelationModelBlockInForView:{legalizeModelBlock:SimplifiedModelBlock, idString:string}
  updateCurrentNavigationNode:ModelNavigationNode | undefined
  clearCurrentMaskAndLink: void
  updatedIsRelationLink: void
  updateRelationCurrentModelNodeSourceNaviNode: ModelNavigationNode
  updatedRelationModelNavigationTreeByProperty:Boolean
  refreshRelationCurrentModelNodeSource:void
}
interface Actions {
  updateModelRootBlockIdToDb:(rootBlockId:number | null) => void
  addModelBlockToDb: (node: ModelNavigationNode) => void
  addLinkToDb:boolean | void
  saveUpdatedRelationModelBlockToDb: () => void
  saveUpdatedRelationLickByModelBlockToDb: (updatedModelBlock:ModelBlock) => void
  delRelationLinkByModelBlockToDb: (modelBlockId:number) => void
  deleteRelationLinkModelBlock: (property:SimplifiedProperty) => void
  selectProperty: (property: SimplifiedProperty) => void
}

export type RelationLink = ModuleOption<State, Getters, Mutations, Actions>

export const getInitialState = once(() => ({
  modelNavigationTree: [],
  currentNavigationNode: undefined,
  currentMaskAndLink: {
    linkName: '',
    maskName: ''
  },
  isRelationLink: true,
  relationCurrentModelNodeSource: undefined,
  toModelNavigationTree: true
} as State))

const rel: RelationLink = {
  namespaced: true,
  state: getInitialState(),
  getters: {},
  mutations: {
    addModelsToDataSourceAndNaviTree(state, models) {
      if (Array.isArray(models)) {
        state.modelNavigationTree.length = 0
        state.modelNavigationTree.push(...models)
      } else {
        state.modelNavigationTree.push(models)
      }
    },
    legalizeTemporaryModel(state, legalModel) {
      const id = ModelNavigationNodeType.models + NaviNodeIdDelimiter + legalModel.id
      state.modelNavigationTree.push({
        id,
        name: legalModel.name,
        children: []
      })
    },
    refreshRelationCurrentModelNodeSource(state) {
      if (!state.relationCurrentModelNodeSource) return
      const nodeKey = state.relationCurrentModelNodeSource.nodeKey
      state.relationCurrentModelNodeSource = {
        ...state.relationCurrentModelNodeSource,
        nodeKey: ''
      }
      state.relationCurrentModelNodeSource = {
        ...state.relationCurrentModelNodeSource,
        nodeKey
      }
    },
    deleteModelFromDataSourceAndNaviTree(state, modelId) {
      const modelNaviNodeId = ModelNavigationNodeType.models + NaviNodeIdDelimiter + modelId
      const index = state.modelNavigationTree.findIndex(node => node.id === modelNaviNodeId)
      index > -1 && state.modelNavigationTree.splice(index, 1)
    },
    delRelationLinkByModelBlock(state, modelBlockId) {
      const modelNavigationTree = state.modelNavigationTree
      const idString = ModelNodeType.modelBlocks + NaviNodeIdDelimiter + modelBlockId
      const ancestorPath = getAncestorPaths(modelNavigationTree, idString)
      let currentModeNaviNode = modelNavigationTree.find(node => node.id === ModelNodeType.models + NaviNodeIdDelimiter + ancestorPath[0])
      if (!currentModeNaviNode) return
      ancestorPath.slice(1, -1).forEach(ancestorId => {
        currentModeNaviNode = currentModeNaviNode!.children.find(modelNaviNode => modelNaviNode.id === ModelNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
      })
      const index = currentModeNaviNode.children.findIndex(modelBlock => modelBlock.id === ModelNodeType.modelBlocks + NaviNodeIdDelimiter + modelBlockId)
      currentModeNaviNode.children.splice(index, 1)
    },
    updateModelInDataSourceNaviTree(state, updatedModel) {
      const model = modelsDataSource.getModel(updatedModel.id)
      const naviNode = state.modelNavigationTree.find(modelNaviNode => {
        const { id } = getModelNavigationNodeIdAndType(modelNaviNode.id)
        return model.id === id
      })!
      naviNode.name = updatedModel.name
      Object.assign(model, updatedModel)
      // update root block
      naviNode.children.length = 0
      if (!model.rootBlockId) return
      const completeModelBlock = modelsDataSource.getCompleteModelBlock(model.rootBlockId)
      if (!completeModelBlock) return
      naviNode.children.push({
        id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + completeModelBlock.id,
        name: completeModelBlock.name,
        parentNode: naviNode,
        children: []
      })
    },
    updateModelBlockInDataSourceAndNaviTree(state, updatedModelBlock) {
      const modelNavigationTree = state.modelNavigationTree
      const idString = ModelNodeType.modelBlocks + NaviNodeIdDelimiter + updatedModelBlock.id
      const ancestorPath = getAncestorPaths(modelNavigationTree, idString)
      if (!ancestorPath.length) return
      let currentModeNaviNode = modelNavigationTree.find(node => node.id === ModelNodeType.models + NaviNodeIdDelimiter + ancestorPath[0])!
      ancestorPath.slice(1).forEach(ancestorId => {
        currentModeNaviNode = currentModeNaviNode.children.find(modelNaviNode => modelNaviNode.id === ModelNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
      })
      currentModeNaviNode.name = updatedModelBlock.name
    },
    addRelationModelBlockInForView(state, params) {
      const { legalizeModelBlock, idString } = params
      const modelNavigationTree = state.modelNavigationTree
      const ancestorPath = getAncestorPaths(modelNavigationTree, idString)
      let modelNaviNode = modelNavigationTree.find(node => node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + ancestorPath[0])!
      ancestorPath.slice(1).forEach(ancestorId => {
        modelNaviNode = modelNaviNode.children.find(node =>
          node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
      })
      modelNaviNode.children.push({
        id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + legalizeModelBlock.id,
        name: legalizeModelBlock.name,
        copyType: legalizeModelBlock.copyType,
        children: [],
        parentNode: modelNaviNode
      })
    },
    updateCurrentNavigationNode(state, navigationNode) {
      state.currentNavigationNode = navigationNode
    },
    clearCurrentMaskAndLink(state) {
      state.currentMaskAndLink = {
        linkName: '',
        maskName: ''
      }
      state.currentNavigationNode = undefined
    },
    updatedIsRelationLink(state) {
      state.isRelationLink = !state.isRelationLink
    },
    updateRelationCurrentModelNodeSourceNaviNode(state, newModelNaviNode) {
      state.relationCurrentModelNodeSource = newModelNaviNode
    },
    updatedRelationModelNavigationTreeByProperty(state, property) {
      state.toModelNavigationTree = property
    }
  },
  actions: {
    async updateModelRootBlockIdToDb({ commit, state, rootState }, rootBlockId): Promise<void> {
      const currentModelNode = rootState.models.currentModelNode as SimplifiedModelBlock
      const result = await useModelsAPIs().db.updateModelRootBlockId(currentModelNode.modelId!, rootBlockId)
      const completeModel = modelsDataSource.getModel(currentModelNode.modelId!)
      completeModel.rootBlockId = rootBlockId
      commit('updateModelInDataSourceNaviTree', completeModel)
      // @ts-ignore
      commit('models/updateModelInDataSourceNaviTree', completeModel, { root: true })
      return result
    },
    async addModelBlockToDb({ commit, dispatch, state }): Promise<void> {
      const currentNavigationNode = state.currentNavigationNode
      if (!currentNavigationNode) return
      const { id, type } = getModelNavigationNodeIdAndType(currentNavigationNode.id)
      const completelyMask = modelsDataSource.getCompleteModelBlock(id)
      const modelBlockType = modelsDataSource.getModelBlockType(id)
      switch (modelBlockType) {
        case ModelBlockType.masks:
          // @ts-ignore
          await dispatch('models/addMask', completelyMask.modelId, { root: true })
          await dispatch('addLinkToDb')
          break
        default:
          // @ts-ignore
          await dispatch('models/addChildBlock', id, { root: true })
          await dispatch('addLinkToDb')
      }
    },
    async addLinkToDb({ dispatch }): Promise<boolean | void> {
      // @ts-ignore
      dispatch('models/selectUnsavedPropertyIfExists', null, { root: true }).then(async _ => {
        const creator = await useModelsAPIs().getModelCreator()
        const { id } = getCurrentModelParentId()
        const tempPropertyId = '0'
        const newProperty = createLink(tempPropertyId, creator)
        const modelBlock = modelsDataSource.getCompleteModelBlock(id)
        modelBlock[PropertyType.links][tempPropertyId] = newProperty
      })
    },
    async saveUpdatedRelationModelBlockToDb({ commit, state, dispatch, rootState }): Promise<void> {
      const currentModelNode = rootState.models.currentModelNode as SimplifiedModelBlock
      const { id, idString } = getCurrentModelParentId()

      const newModelBlock = clone({
        ...currentModelNode,
        name: currentModelNode!.name || rootState.models.currentMaskAndLink.maskName,
        variables: {},
        series: {},
        links: {},
        methods: {}
        // variables: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.variables, id),
        // series: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.series, id),
        // links: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.links, id),
        // methods: modelsDataSource.getAllClonedPropertiesOfType(PropertyType.methods, id)
      })

      const newAncestorMask = modelsDataSource.getMaskOfAModelBlock(currentModelNode.id)
      const newModelBlockId = await useModelsAPIs().db.insertModelBlock(newModelBlock, newAncestorMask.id)

      const updateAncestorMask = modelsDataSource.getMaskOfAModelBlock(id)
      const updatedModelBlock = modelsDataSource.getCompleteModelBlock(id)
      const target = getLinkTarget(newModelBlock.name, newModelBlockId)

      const tempPropertyId = '0'
      const uid = uuid()
      const structureLink = clone(updatedModelBlock[PropertyType.links][tempPropertyId])
      structureLink.target = target
      structureLink.id = uid
      structureLink.name = rootState.models.currentMaskAndLink.linkName
      updatedModelBlock[PropertyType.links][uid] = structureLink
      delete updatedModelBlock[PropertyType.links][tempPropertyId]
      await useModelsAPIs().db.updateModelBlock(updatedModelBlock.id as number, updatedModelBlock, updateAncestorMask.id)

      const legalizeModelBlock = { ...newModelBlock, id: newModelBlockId }
      // update legalize mask tree
      // @ts-ignore
      commit('models/legalizeTemporaryModelBlock', legalizeModelBlock, { root: true })
      // update legalize CurrentModelNode
      // @ts-ignore
      commit('models/updateCurrentModelNodeWithModelNaviNode', {
        id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + newModelBlockId,
        name: updatedModelBlock.name,
        children: []
      }, { root: true })
      commit('addRelationModelBlockInForView', { legalizeModelBlock, idString })
    },
    async saveUpdatedRelationLickByModelBlockToDb({ commit }, updatedModelBlock:ModelBlock): Promise<void> {
      console.log('go to updated relation modelblock for view')
      try {
        const oldCompleteModelBlock = modelsDataSource.getCompleteModelBlock(updatedModelBlock.id)
        const modelId = modelsDataSource.getAncestorPathForAModelBlock(updatedModelBlock.id)[0]
        const updatedModelBlocks = getRelationLickByModelBlock(modelId, oldCompleteModelBlock.name)
        const finishUpdatedModelBlocks = updatedModelBlocksLinkName(updatedModelBlocks, oldCompleteModelBlock.name, updatedModelBlock.name)
        const modelBlockIds = finishUpdatedModelBlocks.map(modelBlock => modelBlock.id)
        await useModelsAPIs().db.updateModelBlocks(modelBlockIds, finishUpdatedModelBlocks, true, true)
        // @ts-ignore
        commit('updateModelBlockInDataSourceAndNaviTree', updatedModelBlock)
      } catch {
        console.log('err: updated relation modelblock for view')
      }
    },
    async delRelationLinkByModelBlockToDb({ commit }, modelBlockId): Promise<void> {
      const completeModelBlock = modelsDataSource.getCompleteModelBlock(modelBlockId)
      const modelId = modelsDataSource.getAncestorPathForAModelBlock(completeModelBlock.id)[0]
      const updatedModelBlocks = getRelationLickByModelBlock(modelId, completeModelBlock.name)
      const finishUpdatedModelBlocks = updatedModelBlocksLinkName(updatedModelBlocks, completeModelBlock.name)
      const modelBlockIds = finishUpdatedModelBlocks.map(modelBlock => modelBlock.id)
      await useModelsAPIs().db.updateModelBlocks(modelBlockIds, finishUpdatedModelBlocks, true, true)
      commit('delRelationLinkByModelBlock', modelBlockId)
    },
    async deleteRelationLinkModelBlock({ commit, state, rootState }, property) {
      if (property.type !== PropertyType.links) return
      const { id, currentBlockNodeId } = getCurrentModelParentId()
      const pId = rootState.models.isRelationLink ? id : currentBlockNodeId
      const completeModelBlock = modelsDataSource.getCompleteModelBlock(pId)
      const completeProperty = completeModelBlock[PropertyType.links][property.id]
      const oldRelationModelBlockName = completeProperty.target?.maskName || completeProperty.target?.blockName
      completeProperty.target!.blockName = ''
      completeProperty.target!.maskName = ''
      completeProperty.target!.id = -1
      const updatedModelBlock = clone(completeModelBlock)
      try {
        await useModelsAPIs().db.updateModelBlock(updatedModelBlock.id as number, updatedModelBlock, updatedModelBlock.id)
      } catch (err) {
        console.log('error updateModelBlock:' + err)
      }
      const links = Object.values(completeModelBlock.links).filter(link => {
        const newRelationModelBlockName = link.target?.maskName || link.target?.blockName
        return newRelationModelBlockName &&
        newRelationModelBlockName === oldRelationModelBlockName &&
        link.id !== property.id
      })
      if (links.length) {
        commit('refreshRelationCurrentModelNodeSource')
        return
      }
      const modelNavigationTree = state.modelNavigationTree
      const nodes = treeFind(modelNavigationTree, (data:any) => data.name === oldRelationModelBlockName)
      if (!nodes) return
      const { id: modelBlockId } = getModelNavigationNodeIdAndType(nodes.id)
      commit('delRelationLinkByModelBlock', modelBlockId)
    },
    async selectProperty({ commit, state, rootState }, property): Promise<void> {
      const { id } = getCurrentModelParentId()
      const currentModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
      if (property.blockId) {
        const thisModelBlock: ModelBlock = modelsDataSource.getCompleteModelBlock(property.blockId as number)
        if (!currentModelNode || thisModelBlock.id !== currentModelNode.id) {
          // @ts-ignore
          commit('models/updateCurrentModelNodeWithModelNaviNode', {
            id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + property.blockId,
            name: thisModelBlock.name,
            children: []
          }, { root: true })
        }
      }

      // @ts-ignore
      commit('models/updateCurrentProperty', property, { root: true })

      let parentProperty: Property | undefined
      const isModels = getModelNodeType(currentModelNode) === ModelNodeType.models
      if (!isModels) {
        const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
        if (completeModelBlock.parentId) {
          const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId)
          const propertyType = getPropertyType(rootState.models.currentProperty!)
          parentProperty = parentModelBlock[propertyType][rootState.models.currentProperty!.id]
        }
      }
      const productFormulas = rootState.models.currentProperty?.productFormulas || []
      const formulasIndex = (property.formulasIndex || property.formulasIndex === 0) ? property.formulasIndex : modelsDataSource.getFormulaItemFormulasIndex(rootState.models.openedFormulaItems, rootState.models.currentProperty)
      const { key, content, name } = modelsDataSource.getFormulaItemNameKeyAndContent(rootState.models.currentProperty, productFormulas[formulasIndex]?.formula, currentModelNode, formulasIndex)
      const f = {
        name: name,
        content: content,
        key: key,
        blockName: currentModelNode!.name,
        modelId: modelsDataSource.getModelIdFormula(currentModelNode!.id),
        blockId: currentModelNode!.id as number,
        propertyType: getPropertyType(rootState.models.currentProperty!),
        propertyId: rootState.models.currentProperty!.id,
        formulasIndex: formulasIndex,
        unsaved: false,
        readOnly: rootState.models.currentProperty!.isDirect
          ? false : !rootState.models.currentProperty!.isDefining,
        hasCalcFormula: hasCalcFormula(rootState.models.currentProperty!, parentProperty) || !!property?.original?.length,
        breadcrumb: modelsDataSource.getBreadcrumb(currentModelNode.id, rootState.models.currentProperty!, key),
        openTime: new Date().getTime(),
        productFormulas: productFormulas || [],
        original: property?.original || [],
        isCodeIndex: rootState.models.currentProperty.source === 'codeIndex'
      }
      // @ts-ignore
      commit('models/updateCurrentFormulaItem', {
        id: modelsDataSource.getUniqueIdentificationFormula(f),
        ...f
      }, { root: true })
    }
  }
}
export default rel
