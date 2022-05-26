
import { reactive, ref, computed } from 'vue'
import store from '@/store'
import { CodeIndex, CodeTransformation, CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'
import { clone } from '@shared/functional'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import type { ProductFormula, ComplexProductFormula } from '@shared/dataModelTypes/product/products'
import type { Property } from '@shared/dataModelTypes'
import { hasCalcFormula, getPropertyType, getModelNodeType, ModelNodeType } from '@/utils'
import modelsDataSource from '@/store/modules/modelsDataSource'
function onLeftButtonsClicked() {
  console.log(5555)
}

const filterText = ref('')
const filterClassifyName = ref('')
const expandRowKeys:number[] = reactive([])
let currentRowKey = ref(-1)
const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)

const indicatorData = computed<ComplexProductFormula[]>(() => {
  const productFormulas:ProductFormula[] = currentFormulaItem.value?.productFormulas || []
  return productFormulas.map((formula:any, index:number) => {
    return {
      ...formula,
      id: index,
      name: 'indicator or indica'
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

const loadData = computed<CodeTransformation[]>(() => {
  const codeIndexes = clone(store.state.codeIndex.codeIndexes)
  const test = filterText.value.toLowerCase()
  const classify = filterClassifyName.value.toLowerCase()
  return codeIndexes.map((codeIndex:CodeIndex):CodeTransformation => {
    return {
      ...codeIndex,
      updatedAt: formatDate(codeIndex.updatedAt as number)
    }
  }).filter((codeIndex:CodeTransformation) => codeIndex.name.includes(test))
})

function onCodeIndexSelected(codeIndex:CodeIndex) {
  store.commit('codeIndex/updateCurrentCodeIndex', codeIndex)
  const currentModelNode = store.state.models.currentModelNode!
  const currentProperty = store.state.models.currentProperty
  const currentFormulaItem = {
    name: codeIndex.name + '.' + ' (' + currentModelNode!.name + ')',
    content: '',
    key: '',
    modelName: currentModelNode.name,
    modelId: codeIndex.modelId,
    propertyType: CodeIndexNavigationNodeType.codeIndex,
    propertyId: CodeIndexNavigationNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id,
    unsaved: false,
    readOnly: false,
    hasCalcFormula: true,
    breadcrumb: [currentModelNode.name, codeIndex.name],
    openTime: new Date().getTime(),
    modifiedAt: codeIndex.updatedAt,
    chooseIf: codeIndex.chooseIf,
    abandonIf: codeIndex.abandonIf,
    isCodeIndex: currentProperty.source === 'codeIndex' || currentProperty.source === 'codeIndexFormula'
  }
  store.commit('models/updateCurrentFormulaItem', {
    id: currentFormulaItem.propertyId,
    ...currentFormulaItem
  })
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
  const currentProperty = store.state.models.currentProperty
  const currentFormulaItem = store.state.models.currentFormulaItem
  const productFormulas = currentProperty.productFormulas || []
  productFormulas.push({
    codeIndexExpression: '',
    formula: ''
  })
  if (!currentFormulaItem) return
  currentProperty.productFormulas = productFormulas
  currentFormulaItem.productFormulas = productFormulas
  // UpdateCurrentFormulaItem()
}

function deleteProductFormula(index:number) {
  const currentProperty = store.state.models.currentProperty
  const productFormulas = currentProperty.productFormulas || []
  productFormulas.splice(index, 1)
}

function switchProductFormulas(index:number) {
  const cindex = expandRowKeys.indexOf(index)
  cindex === -1 ? expandRowKeys.push(index) : expandRowKeys.splice(cindex, 1)
}

function switchCurrentRowKey(index:number) {
  currentRowKey.value = index
}

function UpdateCurrentFormulaItem() {
  const currentModelNode = store.state.models.currentModelNode!
  const property = store.state.models.currentProperty
  let parentProperty: Property | undefined
  const isModels = getModelNodeType(currentModelNode) === ModelNodeType.models
  if (!isModels) {
    const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
    if (completeModelBlock.parentId) {
      const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId)
      const propertyType = getPropertyType(property!)
      parentProperty = parentModelBlock[propertyType][property!.id]
    }
  }

  const productFormulas = property?.productFormulas || []
  const formulasIndex = modelsDataSource.getFormulaItemFormulasIndex(store.state.models.openedFormulaItems, property)
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
    original: property?.original || []
  }
  store.commit('models/updateCurrentFormulaItem', {
    id: modelsDataSource.getUniqueIdentificationFormula(currentFormulaItem),
    ...currentFormulaItem
  })
}

export {
  onLeftButtonsClicked, filterText, loadData, filterClassifyName,
  onCodeIndexSelected, isCppKeywords, expandRowKeys, switchCurrentRowKey, currentRowKey, indicatorData, addProductFormula,
  deleteProductFormula, switchProductFormulas
}
