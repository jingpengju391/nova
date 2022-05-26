import router from '../renderer/router'
import store from '../renderer/store'
import { clone } from '@shared/functional'
import { FormulaTabItem, Property, SimplifiedModel, SimplifiedModelBlock } from '../shared/dataModelTypes'
import { NaviNodeIdDelimiter } from '../shared/dataModelTypes/models/models'
import { getCodeIndexNavigationNodeIdAndType, getMasterNavigationNodeIdAndType, getModelNodeType, getPropertyType, hasCalcFormula, MasterNodeType } from '../renderer/utils'
import { getParentProperty } from '../renderer/store/baseModules'
import modelsDataSource from '../renderer/store/modules/modelsDataSource'
import { CodeIndexNavigationNodeType } from '../shared/dataModelTypes/product/indicators'

let maskModelNode: SimplifiedModel | SimplifiedModelBlock | undefined,
  maskProperty: Property | undefined,
  maskFormulaItems: FormulaTabItem[],
  maskFormulaItem: FormulaTabItem | undefined
let productModelNode: SimplifiedModel | SimplifiedModelBlock | undefined,
  productProperty: Property | undefined,
  productFormulaItems: FormulaTabItem[],
  productFormulaItem: FormulaTabItem | undefined

export const interceptor = () => {
  router.beforeEach((to, from, next) => {
    if (isProduct(from.path) || isMask(from.path)) {
      const { currentModelNode, currentProperty, currentFormulaItem, openedFormulaItems } = current()
      isProduct(from.path) && updateProductData(currentModelNode, currentProperty, currentFormulaItem, openedFormulaItems)
      isMask(from.path) && updateMaskData(currentModelNode, currentProperty, currentFormulaItem, openedFormulaItems)
    }
    next()
  })

  router.afterEach(async (to) => {
    if (isProduct(to.path) || isMask(to.path)) {
      clearCurrentData()
      const targetModelNode = isProduct(to.path) ? productModelNode : maskModelNode
      const targetProperty = isProduct(to.path) ? productProperty : maskProperty
      const targetFormulaItems = isProduct(to.path) ? productFormulaItems : maskFormulaItems
      const targetFormulaItem = isProduct(to.path) ? productFormulaItem : maskFormulaItem
      targetModelNode && updatedCurrentModelNode(targetModelNode)
      targetProperty && updatedCurrentProperty(targetProperty)
      targetFormulaItems?.length && await updatedOpenFormulaItems(targetFormulaItems)
      targetFormulaItem && updatedCurrentFormulaItem(targetFormulaItem)
    }
  })
}

function isProduct(routePath:string):boolean {
  return routePath === '/product'
}

function isMask(routePath:string):boolean {
  return routePath === '/coder'
}

function current():{currentModelNode:SimplifiedModel | SimplifiedModelBlock | undefined, currentProperty: Property | undefined, currentFormulaItem:FormulaTabItem | undefined, openedFormulaItems: FormulaTabItem[]} {
  const currentModelNode = clone(store.state.models.currentModelNode)
  const currentProperty = clone(store.state.models.currentProperty)
  const openedFormulaItems = clone(store.state.models.openedFormulaItems)
  const currentFormulaItem = clone(store.state.models.currentFormulaItem)
  return { currentModelNode, currentProperty, currentFormulaItem, openedFormulaItems }
}

function updateMaskData(modelNode:SimplifiedModel | SimplifiedModelBlock | undefined, property: Property | undefined, formulaItem:FormulaTabItem | undefined, formulaItems: FormulaTabItem[]) {
  maskModelNode = modelNode
  maskProperty = property
  maskFormulaItems = formulaItems
  maskFormulaItem = formulaItem
}

function updateProductData(modelNode:SimplifiedModel | SimplifiedModelBlock | undefined, property: Property | undefined, formulaItem:FormulaTabItem | undefined, formulaItems: FormulaTabItem[]) {
  productModelNode = modelNode
  productProperty = property
  productFormulaItems = formulaItems
  productFormulaItem = formulaItem
}

function updatedCurrentModelNode(modelBlock:SimplifiedModel | SimplifiedModelBlock) {
  const type = getModelNodeType(modelBlock)
  store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
    id: type + NaviNodeIdDelimiter + modelBlock.id
  })
}

function updatedCurrentProperty(property: Property) {
  const type = getPropertyType(property)
  store.commit('models/updateCurrentProperty', {
    id: property.id,
    name: property.name,
    type
  })
}

async function updatedOpenFormulaItems(formulaItems: FormulaTabItem[]) {
  let formulas = []
  for (let i = 0; i < formulaItems.length; i++) {
    const formulaItem = formulaItems[i]
    const newFormulaItem = await updatedFormulaItem(formulaItem)
    formulas.push(newFormulaItem)
  }
  store.commit('models/updateOpenedFormulaItemsAll', formulas)
}

async function updatedCurrentFormulaItem(formula: FormulaTabItem) {
  const newFormula = await updatedFormulaItem(formula)
  store.commit('models/updateCurrentFormulaItem', newFormula)
}

async function updatedFormulaItem(formula: FormulaTabItem): Promise<FormulaTabItem> {
  const { type } = getMasterNavigationNodeIdAndType(formula.id)
  return type === MasterNodeType.codeIndex
    ? await updatedCodeIndexFormulaItem(formula)
    : updatedOtherFormulaItem(formula)
}

async function updatedCodeIndexFormulaItem(formula: FormulaTabItem): Promise<FormulaTabItem> {
  const { id } = getCodeIndexNavigationNodeIdAndType(formula.id)
  const codeIndex = await store.dispatch('codeIndex/queryCodeIndexesByCodeIndexIdFromDB', id)
  const currentModelNode = modelsDataSource.getCompleteModel(formula.modelId)
  return {
    id: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
    name: codeIndex.name,
    content: '',
    key: '',
    modelName: currentModelNode!.name,
    modelId: codeIndex.modelId,
    propertyType: CodeIndexNavigationNodeType.codeIndex,
    propertyId: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
    unsaved: formula.unsaved,
    readOnly: formula.readOnly,
    hasCalcFormula: formula.hasCalcFormula,
    breadcrumb: [currentModelNode!.name, codeIndex.name],
    openTime: new Date().getTime(),
    modifiedAt: codeIndex.modifiedAt,
    chooseIf: formula.unsaved ? formula.chooseIf : codeIndex.chooseIf,
    abandonIf: formula.unsaved ? formula.abandonIf : codeIndex.abandonIf,
    isCodeIndex: true
  } as FormulaTabItem
}

function updatedOtherFormulaItem(formula: FormulaTabItem) {
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(formula.blockId)
  const simplifiedModelBlock = modelsDataSource.getSimplifiedModelBlockForView(formula.blockId)
  // @ts-ignore
  const property = completeModelBlock[formula.propertyType][formula.propertyId]
  const parentProperty = getParentProperty(formula.blockId, property)
  const formulasIndex = property.formulasIndex
  const productFormulas = property.productFormulas || []
  const {
    key, content, name
  } = modelsDataSource.getFormulaItemNameKeyAndContent(
    property, productFormulas[formulasIndex]?.formula, simplifiedModelBlock, formulasIndex)
  const newFormula = {
    name: name,
    content: formula.unsaved ? formula.content : content,
    key: key,
    blockName: simplifiedModelBlock.name,
    modelId: modelsDataSource.getModelIdFormula(completeModelBlock.id),
    blockId: simplifiedModelBlock.id as number,
    propertyType: getPropertyType(property),
    propertyId: property.id,
    formulasIndex: property.formulasIndex,
    unsaved: formula.unsaved,
    readOnly: formula.readOnly,
    hasCalcFormula: hasCalcFormula(property, parentProperty),
    breadcrumb: modelsDataSource.getBreadcrumb(simplifiedModelBlock!.id, property, key),
    openTime: formula.openTime,
    productFormulas,
    original: property?.original || [],
    isCodeIndex: property.source === 'codeIndex' || property.source === 'codeIndexFormula'
  }
  return {
    id: modelsDataSource.getUniqueIdentificationFormula(newFormula),
    ...newFormula
  }
}

function clearCurrentData() {
  store.commit('models/clearCurrentModelNode')
  store.commit('models/clearCurrentProperty')
  store.commit('models/clearCurrentFormulaItems')
  store.commit('models/clearOpenedFormulaItems')
}
