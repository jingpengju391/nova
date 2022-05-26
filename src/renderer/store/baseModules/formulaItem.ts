import type { FormulaTabItem, ModelBlock, Property, SimplifiedModelBlock } from '@shared/dataModelTypes'
import modelsDataSource from '@/store/modules/modelsDataSource'
import store from '@/store'
import { clone } from '@shared/functional'
export function findIndexFormulaItemFromOpenedFormulaItems(formulaItem:FormulaTabItem, formulaItems:FormulaTabItem[]): number {
  return findIndexFormulaItem(formulaItem, formulaItems)
}

function findIndexFormulaItem(formulaItem:FormulaTabItem, formulaItems:FormulaTabItem[]) {
  return formulaItems.findIndex(item =>
    modelsDataSource.getUniqueIdentificationFormula(item) === modelsDataSource.getUniqueIdentificationFormula(formulaItem))
}

export function assignmentForOpenedFormulaItemsByFindIndex(formulaItem:FormulaTabItem, formulaItems:FormulaTabItem[]): FormulaTabItem {
  const index = findIndexFormulaItem(formulaItem, formulaItems)
  updatedOpenedFormulaItemsNameProperty(index, formulaItem, formulaItems)
  updatedOpenedFormulaItemsNameByPropertyId(formulaItem, formulaItems)
  assignmentForOpenedFormulaItemsInCodeIndex(formulaItem, formulaItems, index)
  return formulaItems[index]
}

function assignmentForOpenedFormulaItemsInCodeIndex(formulaItem:FormulaTabItem, formulaItems:FormulaTabItem[], findIndex:number) {
  const productFormulas = formulaItems[findIndex].productFormulas
  const formulasIndex = formulaItem.formulasIndex
  if (productFormulas && formulasIndex && formulasIndex !== -1) formulaItems[findIndex].content = productFormulas[formulasIndex]?.formula || ''
}

function updatedOpenedFormulaItemsNameByPropertyId(formulaItem:FormulaTabItem, formulaItems:FormulaTabItem[]) {
  formulaItems.forEach((item, index) => {
    if (modelsDataSource.getUniqueIdentificationFormula(item) === modelsDataSource.getUniqueIdentificationFormula(formulaItem)) {
      formulaItems[index].name = formulaItem.name
      formulaItems[index].breadcrumb = formulaItem.breadcrumb
    }
  })
}

export function deleteNohasCalcFormulaLastFromOpenedFormulaItems(formulaItems:FormulaTabItem[]): FormulaTabItem[] {
  const length = formulaItems.length
  length > 0 && !formulaItems[length - 1].hasCalcFormula && formulaItems.pop()
  return formulaItems
}

export function updatedModelBlockFormula(currentModelNode:SimplifiedModelBlock, formulaItems:FormulaTabItem[]) {
  const formulas = formulaItems.filter(formula => formula.blockId === currentModelNode.id)
  formulas.forEach(formula => {
    formula.name = currentModelNode.name + '.' + formula.key
    store.commit('models/updateCurrentFormulaItem', formula)
  })
}

function updatedOpenedFormulaItemsNameProperty(index:number, formulaItem:FormulaTabItem, formulaItems:FormulaTabItem[]) {
  if (!formulaItem.propertyType || !formulaItem.propertyId) return
  formulaItems[index].formulasIndex = formulaItem.formulasIndex
  formulaItems[index].productFormulas = formulaItem.productFormulas
  formulaItems[index].hasCalcFormula = formulaItem.hasCalcFormula
  formulaItems[index].key = formulaItem.key
  formulaItems[index].original = formulaItem.original
  formulaItems[index].readOnly = formulaItem.readOnly
  formulaItems[index].openTime = formulaItem.openTime
  if (!formulaItems[index].unsaved) {
    formulaItems[index].content = formulaItem.content
  }
  formulaItems
    .filter((formula, num) => formulaItem.propertyId === formula.propertyId && !formula.isCodeIndex && num !== index)
    .forEach(formula => {
    // @ts-ignore
      const property = modelsDataSource.getCompleteModelBlock(formula.blockId)[formula.propertyType][formula.propertyId]
      if (!property.isDefining) {
        formula.hasCalcFormula = formulaItem.hasCalcFormula
        formula.key = formulaItem.key
        formula.original = formulaItem.original
        formula.content = formulaItem.content
      }
    })
  // const completeModelBlock = modelsDataSource.getCompleteModelBlock(formulaItem.blockId)
  // if (!formulaItem.propertyType || !formulaItem.propertyId) return
  // const childProperty = [completeModelBlock.id]
  // deepChildBlock(completeModelBlock)
  // formulaItems.forEach((formula, num) => {
  //   if (childProperty.includes(formula.blockId)) {
  //     const completeModelBlock = modelsDataSource.getCompleteModelBlock(formula.blockId)
  //     // @ts-ignore
  //     const property = completeModelBlock[formula.propertyType][formula.propertyId]
  //     if (!property.isDefining) {

  //       console.log(formula, 6666)
  //     }
  //   }
  // })
  // function deepChildBlock(completeModelBlock:ModelBlock) {
  //   if (!completeModelBlock?.detailedChildren) return
  //   completeModelBlock.detailedChildren.forEach(block => {
  //     childProperty.push(block.id)
  //     deepChildBlock(block)
  //   })
  // }
}

export function updatedPropertyOrModelBlock(formulaItem:FormulaTabItem, updatedView:boolean):
{ property:Property | undefined, modelBlock:ModelBlock | undefined, oldProperty:Property | undefined, thisBlock:ModelBlock} {
  const oldBlock = modelsDataSource.getCompleteModelBlock(formulaItem.blockId)
  const newBlock = clone(modelsDataSource.getCompleteModelBlock(formulaItem.blockId))
  const completeModelBlock = updatedView ? oldBlock : newBlock

  const newValue = formulaItem.content
  formulaItem.unsaved = !updatedView
  return {
    property: updatedProperty(newValue, completeModelBlock, formulaItem),
    modelBlock: updatedModelBlock(newValue, completeModelBlock, formulaItem),
    oldProperty: updateOldProperty(oldBlock, formulaItem),
    thisBlock: newBlock
  }
}

function updateOldProperty(oldBlock:ModelBlock, formulaItem:FormulaTabItem):Property | undefined {
  if (!isProperty(formulaItem)) return undefined
  // @ts-ignore
  return oldBlock[formulaItem.propertyType][formulaItem.propertyId]
}

export function updatedProperty(value:string, completeModelBlock:ModelBlock, formulaItem:FormulaTabItem): Property | undefined {
  if (!isProperty(formulaItem)) return undefined
  // @ts-ignore
  const property = completeModelBlock[formulaItem.propertyType][formulaItem.propertyId]
  if (isProductFormulaItem(property, formulaItem)) {
    property.productFormulas[formulaItem.formulasIndex!].formula = value
  } else {
    property[formulaItem.key] = value
  }
  return property
}

export function updatedModelBlock(value:string, modelBlock:ModelBlock, formulaItem:FormulaTabItem): ModelBlock | undefined {
  if (isProperty(formulaItem)) return undefined
  // @ts-ignore
  modelBlock[formulaItem.key] = value
  return modelBlock
}

function isProductFormulaItem(property:Property, formulaItem:FormulaTabItem):boolean {
  return (property.source === 'codeIndex' || property.source === 'codeIndexFormula') &&
  (!!formulaItem.formulasIndex || formulaItem.formulasIndex === 0)
}

function isProperty(formulaItem:FormulaTabItem):boolean {
  return !!formulaItem.propertyId && !!formulaItem.propertyType
}
