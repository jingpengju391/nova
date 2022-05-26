import modelsDataSource from '../modules/modelsDataSource'
import { clone, omit } from '@shared/functional'
import { hasCalcFormula, getPropertyType, getModelNavigationNodeIdAndType, ModelNodeType } from '../../utils'
import { getCurrentModelParentId } from '../baseModules'
import type { FormulaTabItem, SimplifiedModelBlock, Property, ModelBlock, Model } from '@shared/dataModelTypes'
import { createLink } from '@shared/dataModelTypes/models/links'
import Block from '@shared/dataModelTypes/models/blocks'
import { PropertyType, LinkTargetType, VariableSource, SeriesSource, LinkSource, MethodSource } from '@shared/dataModelTypes/models/helpers'
import { v4 as uuid } from 'uuid'
import { useModelsAPIs } from '../../hooks/apis'
import Mask from '@shared/dataModelTypes/models/masks'
import store from '@/store'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { ElMessage } from 'element-plus'
import { AnchorProduct } from '@shared/dataModelTypes/product/products'

export function handleDetailedChildren(thisBlock: ModelBlock, propertyType: PropertyType, updatedProperty: Property, oldProperty: Property) {
  if (!thisBlock.detailedChildren) return
  const detailedChildren = thisBlock.detailedChildren
  const thisProperty = thisBlock[propertyType][updatedProperty.id]
  for (let childIndex = 0; childIndex < detailedChildren.length; ++childIndex) {
    const childBlock = detailedChildren[childIndex]
    let childProperty = childBlock[propertyType][updatedProperty.id]
    if (!childProperty || (childProperty.isDefining && thisBlock.parentId)) continue
    childProperty = { ...thisProperty, override: childProperty.override, isDefining: childProperty.isDefining }
    handleDetailedChildren(childBlock, propertyType, childProperty, oldProperty)
  }
}

// export async function updateDetailedChildrenToDb(detailedChildren:Block[], propertyType:PropertyType, ancestorMask:Mask, formulaChanged:boolean, headerChanged:boolean) {
//   for (let childIndex = 0; childIndex < detailedChildren.length; ++childIndex) {
//     const childBlock = detailedChildren[childIndex]
//     const childBlockfieldsToUpdate: any = {
//       [propertyType]: childBlock[propertyType]
//     }
//     await useModelsAPIs().db.updateModelBlock(childBlock.id, JSON.parse(JSON.stringify(childBlockfieldsToUpdate)), ancestorMask.id, formulaChanged, headerChanged)
//     if (childBlock.detailedChildren) {
//       for (let grandChildIndex = 0; grandChildIndex < childBlock.detailedChildren?.length; ++grandChildIndex) {
//         const grandChildBlock = childBlock.detailedChildren[grandChildIndex]
//         const grandChildBlockfieldsToUpdate: any = {
//           [propertyType]: grandChildBlock[propertyType]
//         }
//         await useModelsAPIs().db.updateModelBlock(grandChildBlock.id, grandChildBlockfieldsToUpdate, ancestorMask.id, formulaChanged, headerChanged)
//       }
//     }
//   }
// }

export function updateDetailedChildrenToDb(detailedChildren: Block[], propertyType: PropertyType, ancestorMask: Mask, formulaChanged: boolean, headerChanged: boolean, currentProperty: Property, currentModelNode: SimplifiedModelBlock) {
  const sourceEnum = getSourceEnum(currentProperty)
  const isDefining = currentProperty.isDefining
  !isDefining && currentModelNode.parentId && setDefining()

  const override = currentProperty.override
  !override && setOverride()

  function getChildNewSource(childBlock: Block) {
    const property = clone(currentProperty)
    property.isDefining = false
    property.isDirect = currentProperty.isDirect
    property.source = sourceEnum.parent
    property.override = childBlock[propertyType][currentProperty.id].override
    return property
  }

  async function setOverride() {
    for (let childIndex = 0; childIndex < detailedChildren.length; childIndex++) {
      const childBlock = detailedChildren[childIndex]
      const property = getChildNewSource(childBlock)
      const childBlockfieldsToUpdate = {
        [propertyType]: childBlock[propertyType]
      }
      childBlockfieldsToUpdate[propertyType][property.id] = property
      await useModelsAPIs().db.updateModelBlock(childBlock.id, JSON.parse(JSON.stringify(childBlockfieldsToUpdate)), ancestorMask.id, formulaChanged, headerChanged)
      if (childBlock.detailedChildren) {
        const detailedChildren = childBlock.detailedChildren
        for (let grandChildIndex = 0; grandChildIndex < detailedChildren.length; grandChildIndex++) {
          const grandChildBlock = detailedChildren[grandChildIndex]
          const property = getChildNewSource(grandChildBlock)
          const grandChildBlockfieldsToUpdate = {
            [propertyType]: grandChildBlock[propertyType]
          }
          grandChildBlockfieldsToUpdate[propertyType][property.id] = property
          await useModelsAPIs().db.updateModelBlock(grandChildBlock.id, grandChildBlockfieldsToUpdate, ancestorMask.id, formulaChanged, headerChanged)
        }
      }
    }
  }

  async function setDefining() {
    const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.parentId!)
    const property = clone(completeModelBlock[propertyType][currentProperty.id])
    property.isDefining = false
    property.source = sourceEnum.parent
    property.override = currentProperty.override
    property.isDirect = currentProperty.isDirect
    for (let grandChildIndex = 0; grandChildIndex < detailedChildren.length; grandChildIndex++) {
      const grandChildBlock = detailedChildren[grandChildIndex]
      const grandChildBlockfieldsToUpdate = {
        [propertyType]: grandChildBlock[propertyType]
      }
      grandChildBlockfieldsToUpdate[propertyType][property.id] = property
      await useModelsAPIs().db.updateModelBlock(grandChildBlock.id, grandChildBlockfieldsToUpdate, ancestorMask.id, formulaChanged, headerChanged)
    }
    return property
  }
}

export function updateUi(currentProperty: Property, openedFormulaItems: FormulaTabItem[], currentModelNode: SimplifiedModelBlock) {
  let parentProperty: Property | undefined
  if (currentModelNode?.parentId) {
    const parentModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode?.parentId) as any
    const propertyType = getPropertyType(currentProperty!)
    parentProperty = parentModelBlock[propertyType][currentProperty.id]
  }
  const productFormulas = clone(currentProperty?.productFormulas || [])
  const formulasIndex = modelsDataSource.getFormulaItemFormulasIndex(openedFormulaItems, currentProperty)
  const { key, content, name } = modelsDataSource.getFormulaItemNameKeyAndContent(currentProperty, productFormulas[formulasIndex]?.formula, currentModelNode, formulasIndex)
  const f = {
    name,
    content,
    key,
    blockName: currentModelNode!.name,
    modelId: modelsDataSource.getModelIdFormula(currentModelNode!.id),
    blockId: currentModelNode!.id as number,
    propertyType: getPropertyType(currentProperty!),
    propertyId: currentProperty!.id,
    formulasIndex: formulasIndex,
    unsaved: false,
    readOnly: currentProperty!.isDirect
      ? false : !currentProperty!.isDefining,
    hasCalcFormula: hasCalcFormula(currentProperty!, parentProperty),
    breadcrumb: modelsDataSource.getBreadcrumb(currentModelNode!.id, currentProperty!, key),
    openTime: new Date().getTime(),
    productFormulas: productFormulas || [],
    original: currentProperty?.original || [],
    isCodeIndex: currentProperty.source === 'codeIndex' || currentProperty.source === 'codeIndexFormula'
  }
  return { id: modelsDataSource.getUniqueIdentificationFormula(f), ...f }
}

export async function getNewProperty(currentMaskAndLink: { maskName: string, linkName: string }) {
  const newProperty = createLink('0')
  newProperty.name = currentMaskAndLink.linkName
  newProperty.target = { blockName: '', maskName: currentMaskAndLink.maskName, type: LinkTargetType.mask, id: -1 }
  return newProperty
}

export async function getUpdatedProperties(updatedProperties: Property): Promise<Property> {
  const currentMaskAndLink = store.state.models.currentMaskAndLink
  const updatedProperty = updatedProperties || await getNewProperty(currentMaskAndLink)
  updatedProperty.creator = await useModelsAPIs().getModelCreator()
  return JSON.parse(JSON.stringify(updatedProperty))
}

function getUpdatedModelBlockBaseInfo(updatedProperty: Property) {
  const { id } = getCurrentModelParentId()
  const calcModelNode = modelsDataSource.getSimplifiedModelBlockForView(id)
  const ancestorMask = modelsDataSource.getMaskOfAModelBlock(id)
  const propertyType = getPropertyType(updatedProperty)
  const thisBlock = modelsDataSource.getCompleteModelBlock(id)
  const properties = clone(thisBlock[propertyType])
  const oldProperty = properties[updatedProperty.id]
  const formulaChanged = modelsDataSource.formulaChanged(updatedProperty, oldProperty)
  const headerChanged = modelsDataSource.headerChanged(updatedProperty, oldProperty)
  return { calcModelNode, ancestorMask, propertyType, formulaChanged, headerChanged, oldProperty, properties, thisBlock }
}

export function updatedModelBlockByBlockId(blockId: number, modeType?: string) {
  modeType = modeType || ModelNavigationNodeType.modelBlocks
  const api = modeType === ModelNavigationNodeType.models ? 'getCompleteModel' : 'getCompleteModelBlock'
  const thisModelBlock: ModelBlock | Model = modelsDataSource[api](blockId)

  store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
    id: modeType + NaviNodeIdDelimiter + blockId,
    name: thisModelBlock.name,
    children: []
  })
}

export function getParentProperty(blockId: number, property?: Property): Property | undefined {
  let completeModelBlock = modelsDataSource.getCompleteModelBlock(blockId)
  const currentProperty = property || store.state.models.currentProperty
  const propertyType = getPropertyType(currentProperty)
  deepFor()
  return completeModelBlock[propertyType][currentProperty.id]

  function deepFor() {
    if (!completeModelBlock.parentId) return
    const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId)
    const source = parentModelBlock[propertyType][currentProperty.id]
    if (!source) return
    completeModelBlock = parentModelBlock
    if (source.isDefining) return
    deepFor()
  }
}

// this's really a collapsing logic, reset!
export function needUpdatedModelBlocks(blockId?: number): ModelBlock[] {
  // current modelBlock
  const currentModelBlock = needUpdatedCurrentModelBlocks(blockId)
  // child modelBlock
  const childModelBlock = needUpdatedChildModelBlocks(currentModelBlock)
  // product modelBlock
  // const productModelBlock = needUpdatedProductModelBlocks(currentModelBlock)

  return [currentModelBlock, ...childModelBlock]
    .map(modelBlock => clone(omit(['parent', 'children', 'detailedChildren', 'startUp', 'detailedParent'], modelBlock)))
}

function needUpdatedCurrentModelBlocks(blockId?: number) {
  const { id: currentBlockId } = getCurrentModelParentId()
  const id = blockId || currentBlockId
  return modelsDataSource.getCompleteModelBlock(id)
}

function needUpdatedProductModelBlocks(modelBlock: ModelBlock): ModelBlock[] {
  const modelId = modelBlock.modelId
  // only for mask
  if (!modelId) return []
  // all mask | block in current modelblock
  return modelsDataSource.getAllModelBlocksForAModel(modelId)
    .filter(mask => mask.productId && mask.parentId && modelBlock.id === mask.parentId)
}

function needUpdatedChildModelBlocks(modelBlock: ModelBlock): ModelBlock[] {
  const children: ModelBlock[] = []
  recursion(modelBlock)
  return children
  function recursion(modelBlock: ModelBlock) {
    const childBlock = modelBlock.detailedChildren
    if (!childBlock || !childBlock.length) return
    children.push(...childBlock)
    childBlock.forEach(block => recursion(block))
  }
}

function toUpdatedCurrentModelBlock(currentModelBlock: ModelBlock, updatedProperty: Property) {
  const isANewProperty = updatedProperty.id === '0'
  const propertyType = getPropertyType(updatedProperty)
  updatedProperty.id = isANewProperty ? uuid() : updatedProperty.id
  isANewProperty && delete currentModelBlock[propertyType]['0']
  isANewProperty && (updatedProperty.isDefining = true)

  // const oldProperty = isANewProperty ? undefined : clone(currentModelBlock[propertyType][updatedProperty.id])

  currentModelBlock[propertyType][updatedProperty.id] = updatedProperty
  const isDefining = currentModelBlock[propertyType][updatedProperty.id].isDefining
  // only for not mask
  if (!currentModelBlock.parentId) return
  if (!isDefining) {
    // replace the current property with the parent's property

    // get parent modelBlock
    const parentModelBlock = modelsDataSource.getCompleteModelBlock(currentModelBlock.parentId)
    if (!parentModelBlock[propertyType][updatedProperty.id]) {
      ElMessage('当前资源来源非父级，请直接删除！')
      return
    }
    currentModelBlock[propertyType][updatedProperty.id] = parentModelBlock[propertyType][updatedProperty.id]
    setProperty(currentModelBlock, currentModelBlock[propertyType][updatedProperty.id])
  }
}

function toUpdatedChildModelBlock(childModelBlock: ModelBlock[], currentModelBlock: ModelBlock, updatedProperty: Property) {
  const propertyType = getPropertyType(updatedProperty)
  const currentProperty = currentModelBlock[propertyType][updatedProperty.id]

  childModelBlock.forEach(block => {
    if (!block[propertyType][currentProperty.id] || !currentProperty.override || !block[propertyType][currentProperty.id].isDefining) {
      block[propertyType][currentProperty.id] = currentProperty
      setProperty(block, block[propertyType][currentProperty.id])
    }
  })
}

function formulaHeaderChanged(updatedProperty: Property, currentModelBlock: ModelBlock): { formulaChanged: boolean, headerChanged: boolean } {
  const propertyType = getPropertyType(updatedProperty)
  const properties = clone(currentModelBlock[propertyType])
  const oldProperty = properties[updatedProperty.id]
  const formulaChanged = modelsDataSource.formulaChanged(updatedProperty, oldProperty)
  const headerChanged = modelsDataSource.headerChanged(updatedProperty, oldProperty)
  return { formulaChanged, headerChanged }
}

function setProperty(modelBlock: ModelBlock, property: Property) {
  const sourceEnum = getSourceEnum(property)
  property.isDefining = false
  // @ts-ignore
  modelBlock.parentId && (property.source = sourceEnum.parent)
}

export function getSourceEnum(currentProperty: Property) {
  let sourceEnum: typeof VariableSource | typeof SeriesSource | typeof LinkSource | typeof MethodSource
  const propertyType = getPropertyType(currentProperty)
  if (propertyType === PropertyType.variables) {
    sourceEnum = VariableSource
  } else if (propertyType === PropertyType.series) {
    sourceEnum = SeriesSource
  } else if (propertyType === PropertyType.links) {
    sourceEnum = LinkSource
  } else {
    sourceEnum = MethodSource
  }
  return sourceEnum
}

export function getUpdatedPropertyBaseData(updatedProperty: Property) {
  const modelId = getCurrentModelBlockModelId()
  const isANewProperty = updatedProperty.id === '0'
  const { calcModelNode, ancestorMask, propertyType, formulaChanged, headerChanged, properties, oldProperty, thisBlock } = getUpdatedModelBlockBaseInfo(updatedProperty)
  return { calcModelNode, ancestorMask, propertyType, formulaChanged, headerChanged, properties, oldProperty, modelId, isANewProperty, thisBlock }
}

export function getCurrentModelBlockModelId(blockId?: number) {
  const { idString } = getCurrentModelParentId()
  const { id, type } = getModelNavigationNodeIdAndType(idString)
  if (type === ModelNavigationNodeType.models) return id
  blockId = blockId || id
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(id)
  if (completeModelBlock.modelId) return completeModelBlock.modelId
  if (completeModelBlock.parentId) {
    getCurrentModelBlockModelId(completeModelBlock.parentId)
  } else {
    return -1
  }
}

export function updatePropertyForKeys(id: number, updatedProperty: Property, oldProperty: Property, propertyType: PropertyType, products: AnchorProduct[]) {
  const newFields = new Map<string, any>()
  for (const key in updatedProperty) {
    if (updatedProperty[key] !== oldProperty[key] && key !== 'id') {
      newFields.set(key, updatedProperty[key])
    }
  }
  newFields.forEach((newValue, fieldKey) => {
    modelsDataSource.getCompleteModelBlock(id)!.updatePropertyForKey(
      propertyType, updatedProperty.id, fieldKey, newValue, products)
  })
}
