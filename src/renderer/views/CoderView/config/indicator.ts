
import { reactive, ref, computed, watch } from 'vue'
import store from '@/store'
import { CodeIndex, CodeTransformation, CodeIndexNavigationNodeType, kCode, kCodes } from '@shared/dataModelTypes/product/indicators'
import { clone } from '@shared/functional'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import type { ProductFormula, ComplexProductFormula } from '@shared/dataModelTypes/product/products'
import type { ModelBlock, Property } from '@shared/dataModelTypes'
import { hasCalcFormula, getPropertyType, getModelNodeType, ModelNodeType } from '@/utils'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { productFormulas, loading, dialogVisible } from './indicator-dialog'
const filterText = ref('')
const filterClassifyName = ref('')
const operation:any = reactive({
  label: '新增',
  id: 0
})
const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)
const openedFormulaItems = computed(() => store.state.models.openedFormulaItems)
// currentRowKey
let currentRowKey = ref(-1)
function switchCurrentRowKey(index:number) {
  if (!currentFormulaItem.value || !openedFormulaItems.value.length || (!currentFormulaItem.value.formulasIndex && currentFormulaItem.value.formulasIndex !== 0)) return
  currentRowKey.value = index
}
watch(() => currentRowKey.value, newValue => newValue !== -1 && currentFormulaItem.value?.isCodeIndex && UpdateCurrentFormulaItem(newValue))
watch(() => currentFormulaItem.value?.productFormulas, newValue => (!newValue || !newValue.length) && (currentRowKey.value = -1), { deep: true })
// loadData
const loadData = computed<CodeTransformation[]>(() => {
  if (!store.state.models.currentModelNode?.id) return []
  const codeIndexes = clone(store.state.codeIndex.codeIndexes)
  const test = filterText.value.toLowerCase()
  return codeIndexes.map((codeIndex:CodeIndex):CodeTransformation => {
    return {
      ...codeIndex,
      updatedAt: formatDate(codeIndex.updatedAt as number)
    }
  }).filter((codeIndex:CodeTransformation) => codeIndex.name.includes(test))
})

// expandRowKeys
const expandRowKeys:number[] = reactive([])
function switchProductFormulas(index:number) {
  const cindex = expandRowKeys.indexOf(index)
  cindex === -1 ? expandRowKeys.push(index) : expandRowKeys.splice(cindex, 1)
}

// indicatorData
const currrentCodeIndexExpression = reactive<{index:number, newValue:string}>({
  index: -1,
  newValue: ''
})
const indicatorData = computed<ComplexProductFormula[]>(() => {
  const productFormulas:ProductFormula[] = currentFormulaItem.value?.productFormulas || []
  return productFormulas.map((formula:{ formula: string, codeIndexExpression: string, name: string, classify: string }, index:number) => {
    const unsaved = currrentCodeIndexExpression.index !== -1 &&
    currrentCodeIndexExpression.index === index &&
    formula.codeIndexExpression !== currrentCodeIndexExpression.newValue
    return {
      ...formula,
      id: index,
      unsaved
    }
  })
})

const isCppKeywords = (value: string): boolean => {
  const list = [
    'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const',
    'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'false',
    'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
    'mutable', 'namespace', 'new', 'operator', 'private', 'protected', 'public',
    'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
    'template', 'this', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
    'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'while', 'name', 'profile', 'links', 'series', 'variables'
  ]
  return list.indexOf(value) !== -1
}

function onCodeIndexSelected(codeIndex: CodeIndex, modelBlock?: ModelBlock) {
  modelBlock && store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
    id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + modelBlock.id,
    name: modelBlock.name
  })
  store.commit('codeIndex/updateCurrentCodeIndex', codeIndex)
  const currentModelNode = store.state.models.currentModelNode
  const currentFormulaItem = {
    id: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
    name: codeIndex.name + '.' + ' (' + currentModelNode!.name + ')',
    content: '',
    key: '',
    modelName: currentModelNode!.name,
    modelId: codeIndex.modelId,
    propertyType: CodeIndexNavigationNodeType.codeIndex,
    propertyId: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
    unsaved: false,
    readOnly: false,
    hasCalcFormula: true,
    breadcrumb: [currentModelNode!.name, codeIndex.name],
    openTime: new Date().getTime(),
    modifiedAt: codeIndex.updatedAt,
    chooseIf: codeIndex.chooseIf,
    abandonIf: codeIndex.abandonIf,
    isCodeIndex: true
  }
  store.commit('models/updateCurrentFormulaItem', currentFormulaItem)
}

function formatDate(timeStr:number) {
  const now = new Date(timeStr)
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const date = now.getDate()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const second = now.getSeconds()
  return year + '-' + month + '-' + date + ' ' + hour + ':' + minute
}

function addProductFormula() {
  loading.value = true
  const openedFormulaItems = store.state.models.openedFormulaItems
  const currentFormulaItem = openedFormulaItems.find(formula => formula.propertyId === store.state.models.currentFormulaItem?.propertyId)
  if (!currentFormulaItem) return
  const currentProperty = store.state.models.currentProperty
  const currentProductFormulas = currentFormulaItem.productFormulas || []
  currentProductFormulas.push(productFormulas)
  currentProperty.productFormulas = currentProductFormulas
  currentFormulaItem.productFormulas = currentProductFormulas
  currentRowKey.value = currentRowKey.value === -1 ? 0 : currentRowKey.value
  UpdateCurrentFormulaItem()
}

function deleteProductFormula(index:number) {
  const currentFormulaItem = store.state.models.currentFormulaItem
  if (currentFormulaItem && (currentFormulaItem.formulasIndex || currentFormulaItem.formulasIndex === 0)) {
    const productFormulas = currentFormulaItem.productFormulas || []
    productFormulas.splice(currentFormulaItem.formulasIndex, 1)
    const currentProperty = store.state.models.currentProperty
    currentProperty.productFormulas = productFormulas
    currentRowKey.value = -1
    loading.value = dialogVisible.value = false
    // UpdateCurrentFormulaItem()
  }
}

function updateProductFormula() {
  const openedFormulaItems = store.state.models.openedFormulaItems
  const currentFormulaItem = openedFormulaItems.find(formula => formula.propertyId === store.state.models.currentFormulaItem?.propertyId)
  if (currentFormulaItem && (currentFormulaItem.formulasIndex || currentFormulaItem.formulasIndex === 0)) {
    loading.value = true
    const currentProperty = store.state.models.currentProperty
    const currentProductFormulas = currentFormulaItem.productFormulas || []
    currentProductFormulas[currentFormulaItem.formulasIndex] = productFormulas
    currentProperty.productFormulas = currentProductFormulas
    currentFormulaItem.productFormulas = currentProductFormulas
    currentRowKey.value = currentRowKey.value === -1 ? 0 : currentRowKey.value
    UpdateCurrentFormulaItem()
  }
}

function UpdateCurrentFormulaItem(formulasIndex?:number) {
  const currentModelNode = store.state.models.currentModelNode!
  const property = store.state.models.currentProperty

  let parentProperty: Property | undefined
  const isModels = getModelNodeType(currentModelNode) === ModelNodeType.models
  if (!isModels) {
    const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
    if (completeModelBlock.parentId) {
      const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId)
      const propertyType = getPropertyType(property!)
      parentProperty = parentModelBlock[propertyType][property.id]
    }
  }

  const productFormulas = property?.productFormulas || []
  formulasIndex = formulasIndex || formulasIndex === 0 ? formulasIndex : modelsDataSource.getFormulaItemFormulasIndex(store.state.models.openedFormulaItems, property)
  const { key, content, name } = modelsDataSource.getFormulaItemNameKeyAndContent(property, productFormulas[formulasIndex]?.formula, currentModelNode, formulasIndex)
  const currentFormulaItem = {
    name,
    content,
    key,
    blockName: currentModelNode!.name,
    modelId: modelsDataSource.getModelIdFormula(currentModelNode!.id),
    blockId: currentModelNode!.id as number,
    propertyType: getPropertyType(property!),
    propertyId: property!.id,
    formulasIndex: formulasIndex,
    unsaved: false,
    readOnly: property!.isDirect
      ? false : !property!.isDefining,
    hasCalcFormula: hasCalcFormula(property!, parentProperty),
    breadcrumb: modelsDataSource.getBreadcrumb(currentModelNode!.id, property!, key),
    openTime: new Date().getTime(),
    productFormulas: property.productFormulas || [],
    original: property?.original || [],
    isCodeIndex: property.source === 'codeIndex'
  }
  store.commit('models/updateCurrentFormulaItem', {
    id: modelsDataSource.getUniqueIdentificationFormula(currentFormulaItem),
    ...currentFormulaItem
  })
  loading.value = dialogVisible.value = false
}

function onLeftButtonsClicked() {

}

function handleOperation(id?:number) {
  id = id || 0
  let label:string = ''
  switch (id) {
    case 1:
      label = '修改'
      break
    case 2:
      label = '删除'
      break
    default:
      label = '新增'
  }
  operation.label = label
  operation.id = id
}

function handleSaveCodeIndex(codeIndex:CodeIndex, key:kCode) {
  if (!codeIndex[key]) return codeIndex
  if (key === kCodes.moduleOnly) {
    codeIndex[kCodes.productOnly] = codeIndex[kCodes.newBlockDefault] = codeIndex[kCodes.newProductDefault] = 0
  }
  if (key === kCodes.productOnly) {
    codeIndex[kCodes.moduleOnly] = codeIndex[kCodes.newBlockDefault] = codeIndex[kCodes.newProductDefault] = 0
  }
  if (key === kCodes.newBlockDefault || key === kCodes.newProductDefault) {
    codeIndex[kCodes.moduleOnly] = codeIndex[kCodes.productOnly] = 0
  }
  return codeIndex
}

export {
  onLeftButtonsClicked, filterText, loadData, filterClassifyName, UpdateCurrentFormulaItem,
  onCodeIndexSelected, isCppKeywords, expandRowKeys, switchCurrentRowKey, currentRowKey, indicatorData,
  addProductFormula, deleteProductFormula, switchProductFormulas, handleOperation, operation, updateProductFormula,
  handleSaveCodeIndex, currrentCodeIndexExpression
}
