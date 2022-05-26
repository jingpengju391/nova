
import store from '@/store'
import { reactive } from 'vue'
import type { FormulaTabItem } from '@shared/dataModelTypes'
import { ElTabs } from 'element-plus'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { getCodeIndexNavigationNodeIdAndType } from '@/utils'
import { CodeIndex, CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'
import { currentRowKey } from '../config'
const unSavedFormulas = reactive<FormulaTabItem[]>([])

const handlerTabClick = (tab: typeof ElTabs) => {
  const openedFormulaItems = store.state.models.openedFormulaItems
  const currentFormulaItem = openedFormulaItems[tab.index]
  const { id, type } = getCodeIndexNavigationNodeIdAndType(currentFormulaItem.propertyId)
  if (type === CodeIndexNavigationNodeType.codeIndex) {
    const codeIndexes = store.state.codeIndex.codeIndexes
    const condeIndex = codeIndexes.find((codeIndex:CodeIndex) => codeIndex.id === id) as CodeIndex
    setCodeIndex(condeIndex, currentFormulaItem)
  } else {
    setProperty(currentFormulaItem)
  }
  if (currentFormulaItem.isCodeIndex && (currentFormulaItem.formulasIndex || currentFormulaItem.formulasIndex === 0)) {
    currentRowKey.value = currentFormulaItem.formulasIndex
  }
}

const handlerTabClose = (formulaTabItems: FormulaTabItem[], saved?:boolean) => {
  const FormulaTabItems = JSON.parse(JSON.stringify(formulaTabItems))
  const resultFormulas:FormulaTabItem[] = clearFormulas(FormulaTabItems)
  unSavedFormulas.length = 0
  unSavedFormulas.push(...FormulaTabItems.filter((FormulaTabItem: FormulaTabItem) => FormulaTabItem.unsaved))
  const unSaved = saved || unSavedFormulas.length === 0
  unSaved && store.commit('models/updateOpenedFormulaItemsAll', resultFormulas)
  unSaved && setCurrentFormula()
}

function setProperty(currentFormulaItem:FormulaTabItem) {
  const name = currentFormulaItem.name.split('.')[0]
  if (currentFormulaItem.propertyId) {
    store.dispatch('models/selectProperty', {
      id: currentFormulaItem.propertyId,
      name: name,
      type: currentFormulaItem.propertyType,
      blockId: currentFormulaItem.blockId,
      original: currentFormulaItem.original
    })
  } else {
    const params = modelsDataSource.generateBlockFormulaItem(currentFormulaItem.blockName, currentFormulaItem.blockId, currentFormulaItem.key, currentFormulaItem.content) as FormulaTabItem
    store.commit('models/updateCurrentFormulaItem', params)
    store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
      id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + currentFormulaItem.blockId,
      name: currentFormulaItem.blockName,
      children: []
    })
  }
}

function setCodeIndex(currentCodeIndex:CodeIndex, currentFormulaItem:FormulaTabItem) {
  if (!currentCodeIndex) return
  store.commit('codeIndex/updateCurrentCodeIndex', currentCodeIndex)
  store.commit('models/updateCurrentFormulaItem', currentFormulaItem)
  store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
    id: CodeIndexNavigationNodeType.models + NaviNodeIdDelimiter + currentCodeIndex.modelId,
    name: '',
    children: []
  })
}

function setIndicator() {

}

function clearFormulas(formulaTabItems:FormulaTabItem[]): FormulaTabItem[] {
  const openedFormulaItems = store.state.models.openedFormulaItems
  const result = openedFormulaItems.filter((openeFormula:FormulaTabItem) =>
    !formulaTabItems.some((closeFormula:FormulaTabItem) => openeFormula.name === closeFormula.name))
  return result
}

export function setCurrentFormula() {
  const currentFormulaItem = store.state.models.currentFormulaItem as FormulaTabItem
  const openedFormulaItems = store.state.models.openedFormulaItems
  let resultFormulaItem = openedFormulaItems.find((formulaTabItem:FormulaTabItem) => formulaTabItem.name === currentFormulaItem.name)

  if (openedFormulaItems.length > 0 && !resultFormulaItem) {
    // const timeArr = openedFormulaItems.map((formula:FormulaTabItem) => formula.openTime)
    // const r = findNearesttargetber(timeArr, currentFormulaItem.openTime)
    resultFormulaItem = openedFormulaItems.find((formula:FormulaTabItem) => formula.openTime ===
    Math.max(...openedFormulaItems.map((formula:FormulaTabItem) => formula.openTime)))
    if (resultFormulaItem) {
      const { id, type } = getCodeIndexNavigationNodeIdAndType(resultFormulaItem.propertyId)
      if (type === CodeIndexNavigationNodeType.codeIndex) {
        const codeIndexes = store.state.codeIndex.codeIndexes
        const condeIndex = codeIndexes.find((codeIndex:CodeIndex) => codeIndex.id === id) as CodeIndex
        setCodeIndex(condeIndex, resultFormulaItem)
      } else {
        const name = resultFormulaItem.name.split('.')[0]
        store.dispatch('models/selectProperty', {
          ...resultFormulaItem,
          id: resultFormulaItem.propertyId,
          name: name,
          type: resultFormulaItem.propertyType
        })
      }
    }
  }
}

function findNearesttargetber(timeArr:any, target:any) {
  let mid
  let l = 0
  let r = timeArr.length - 1
  while (r - l > 1) {
    mid = Math.floor((l + r) / 2)
    if (target < timeArr[mid]) {
      r = mid
    } else {
      l = mid
    }
  }
  return Math.abs(target - timeArr[l]) <= Math.abs(target - timeArr[r]) ? timeArr[l] : timeArr[r]
}

export { unSavedFormulas, handlerTabClick, handlerTabClose }
