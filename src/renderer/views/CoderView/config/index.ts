import { currentCollapse, basic, transmit, calcHeight } from './collapse'
import { getModelBlockMapByName } from './transmit-details'
import { tableData, tableColumn, options, getCurrentVariables, getTargetVariables, addTransmit, handleSelectionChange, deleteTransmit, multipleSelection } from './transmit-table'
import { buttons } from './tool-bar'
import { unSavedFormulas, handlerTabClick, handlerTabClose, setCurrentFormula } from './code-navigation'
import store from '@/store'
import type { FormulaTabItem } from '@shared/dataModelTypes'
import { onButtonsClicked, Created, Delete, Copy, Stick } from './indicator-tool-bar'
import {
  onLeftButtonsClicked, filterText, filterClassifyName,
  loadData, onCodeIndexSelected, isCppKeywords, expandRowKeys,
  currentRowKey, switchCurrentRowKey, indicatorData, handleOperation,
  addProductFormula, deleteProductFormula, switchProductFormulas,
  UpdateCurrentFormulaItem, operation, updateProductFormula, handleSaveCodeIndex, currrentCodeIndexExpression
} from './indicator'
import { dialogVisible, indicatorFormData, productFormulas, loading, handleClose, handleProductFormulas } from './indicator-dialog'
import { CodeIndex, CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'
import { getCodeIndexNavigationNodeIdAndType } from '@/utils'
import { omit, clone } from '@shared/functional'
import router from '@/router'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export const completionProvider:any = {
  monacoProviderRef: null
}
export const popoverVisible = ref<boolean>(true)
export const directClose = {
  label: '直接关闭',
  type: 'danger',
  onClick: () => {
    const currentFormulaItem: FormulaTabItem | undefined = store.state.models.currentFormulaItem
    if (!currentFormulaItem) return
    currentFormulaItem.unsaved = false
    const params = currentFormulaItem ? [currentFormulaItem] : []
    unSavedFormulas.length = 0
    handlerTabClose(params)
  }
}

export const directCloseAll = {
  label: '直接关闭所有',
  type: 'danger',
  onClick: () => {
    const openedFormulaItems = store.state.models.openedFormulaItems
    openedFormulaItems.forEach((formula: FormulaTabItem) => { formula.unsaved = false })
    unSavedFormulas.length = 0
    handlerTabClose(openedFormulaItems)
  }
}

export const cancel = {
  label: '取 消',
  type: '',
  onClick: () => {
    unSavedFormulas.length = 0
  }
}

export const saveAfterClose = {
  label: '保存后关闭',
  type: 'primary',
  onClick: async () => {
    await store.dispatch('models/saveFormulaForGivenFormulaItem', unSavedFormulas[0])
    const params = clone(unSavedFormulas)
    params.unsaved = false
    handlerTabClose(params, true)
    unSavedFormulas.length = 0
  }
}

export function isProduct(): boolean {
  return router.currentRoute.value.path === '/product'
}

export const saveAllAfterClose = {
  label: '保存所有后关闭',
  type: 'primary',
  onClick: async () => {
    const result = getCodeIndexAndPropertys()
    const openedFormulaItems = store.state.models.openedFormulaItems
    await store.dispatch('codeIndex/updateCodeIndexesFromDB', result.codeIndexes)
    await store.dispatch('models/updateModifyToSaveFormulaItemAsync', result.propertys)
    openedFormulaItems.forEach((formula: FormulaTabItem) => { formula.unsaved = false })
    unSavedFormulas.length = 0
    handlerTabClose(openedFormulaItems)
  }
}

export const saveAll = {
  label: '保存所有',
  type: 'primary',
  onClick: async () => {
    const result = getCodeIndexAndPropertys()
    const openedFormulaItems = store.state.models.openedFormulaItems
    await store.dispatch('codeIndex/updateCodeIndexesFromDB', result.codeIndexes)
    await store.dispatch('models/updateModifyToSaveFormulaItemAsync', result.propertys)
    unSavedFormulas.length = 0
    openedFormulaItems.forEach((formula: FormulaTabItem) => { formula.unsaved = false })
  }
}

function getCodeIndexAndPropertys():{codeIndexes:CodeIndex[], propertys:FormulaTabItem[]} {
  const codeIndexes = store.state.codeIndex.codeIndexes
  const result:{codeIndexes:CodeIndex[], propertys:FormulaTabItem[]} = {
    codeIndexes: [],
    propertys: []
  }
  unSavedFormulas.forEach((formula:FormulaTabItem) => {
    const { id, type } = getCodeIndexNavigationNodeIdAndType(formula.propertyId)
    if (type === CodeIndexNavigationNodeType.codeIndex) {
      const codeIndex = codeIndexes.find((codeIndex:CodeIndex) => codeIndex.id === id)
      result.codeIndexes.push({
        ...omit([], codeIndex),
        abandonIf: formula.abandonIf || '',
        chooseIf: formula.chooseIf || ''
      })
    } else {
      result.propertys.push(formula)
    }
  })
  return result
}

export const DirectCloseContent = '直接关闭将导致公式改动丢失，确认关闭？'

export const DirectCloseAllContent = '直接关闭将导致所有公式改动丢失，确认关闭？'

export const SaveAllContent = '即将保存所有改动公式，确认保存？'

export const tabs = computed(() => {
  const route = useRoute()
  const tabPanes = [
    // {
    //   value: '0',
    //   label: 'error list'
    // },
    {
      value: '0',
      label: '信息'
    },
    // {
    //   value: '2',
    //   label: 'watch'
    // },
    {
      value: '1',
      label: '本地任务'
    }
  ]
  route.path === '/coder' && tabPanes.push(...[

    {
      value: '2',
      label: '查找/替换'
    },
    {
      value: '3',
      label: '版本管理'
    }
  ])
  return {
    type: 'border-card',
    tabPanes
  }
})

export const BlockSearch = ['definitions', 'initializeFormula', 'finalizeFormula', 'rebaseBaseFunctionLines', 'runAfterRebaseFormula', 'copySizeFunctionLines']

export const BlockSearchChild = ['links', 'series', 'variables']

export {
  currentCollapse, basic, transmit, calcHeight,
  getModelBlockMapByName, buttons, tableData,
  tableColumn, options, getCurrentVariables,
  getTargetVariables, addTransmit, unSavedFormulas, deleteTransmit, multipleSelection, handleSelectionChange,
  handlerTabClick, handlerTabClose, onButtonsClicked, isCppKeywords,
  onLeftButtonsClicked, filterText, loadData, filterClassifyName, switchCurrentRowKey,
  onCodeIndexSelected, Created, Delete, Copy, Stick, expandRowKeys, currentRowKey, indicatorData, addProductFormula,
  deleteProductFormula, switchProductFormulas, UpdateCurrentFormulaItem, dialogVisible, handleOperation, currrentCodeIndexExpression,
  indicatorFormData, productFormulas, loading, handleClose, handleProductFormulas, operation, updateProductFormula, setCurrentFormula, handleSaveCodeIndex
}
