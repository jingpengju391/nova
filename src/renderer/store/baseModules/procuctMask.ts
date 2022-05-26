import { ModelBlock } from '@shared/dataModelTypes'
import Mask from '@shared/dataModelTypes/models/masks'
import Block, { generateProductBlock } from '@shared/dataModelTypes/models/blocks'
import { omit, clone, once } from '@shared/functional'
import masterDataSource from '../modules/masterDataSource'
import modelsDataSource from '../modules/modelsDataSource'

export function getNewModelBlocksAndUpdatedModelBlocks(updatedModelBlock: ModelBlock, updatedModelBlocks: ModelBlock[]): { insert: ModelBlock[], update: ModelBlock[], updateIds: number[] } {
  const result: { insert: ModelBlock[], update: ModelBlock[], updateIds: number[] } = {
    insert: [],
    update: [],
    updateIds: []
  }

  const names = updatedModelBlocks.map(mask => mask.name)
  const productIds = updatedModelBlocks.map(block => block.productId)
  const masters = masterDataSource.getCompleteMastersByModelId(updatedModelBlock.modelId!)
  const newProductBlocks = masters
    .filter(master => !productIds.includes(master.id))
    .map(master => generateProductBlock(master, updatedModelBlock as any))
  result.updateIds = updatedModelBlocks.map(item => item.id)
  result.update = updatedModelBlocks.map(mask => {
    return { ...omit(['id', 'parent', 'children', 'detailedChildren', 'startUp', 'detailedParent'], mask) }
  })
  result.insert = newProductBlocks.filter(mask => !names.includes(mask!.name)).map(mask => {
    return { ...omit(['id', 'parent', 'children', 'detailedChildren', 'startUp', 'detailedParent'], mask) }
  })
  return result
}

export function getNewModelBlocksAndUpdatedModelBlocks2(updatedModelBlock: ModelBlock): { insert: ModelBlock[], updated: ModelBlock[], deleted: ModelBlock[] } {
  const result: { insert: ModelBlock[], updated: ModelBlock[], deleted: ModelBlock[] } = {
    insert: [],
    updated: [],
    deleted: []
  }

  const isAddModelBlock = updatedModelBlock.id === 0

  const isMask = !updatedModelBlock?.parentId

  const childBlock: Mask[] = updatedModelBlock.detailedChildren || []

  const masters = masterDataSource.getCompleteMastersByModelId(updatedModelBlock.modelId!)

  let currentModelBlock: Mask | Block = isMask ? new Mask(updatedModelBlock) : new Block(updatedModelBlock as Block)

  if (isAddModelBlock) {
    result.insert.push(currentModelBlock)
  } else {
    result.updated.push(currentModelBlock)
  }

  if (isMask) {
    const updatedChildBlocks = childBlock.filter(child => !!child.productId)
    if (updatedModelBlock.isProductMask) {
      const updatedChildBlockIds: number[] = []
      updatedChildBlocks.forEach(child => {
        const master = masterDataSource.getCompleteMaster(child.productId!)
        const newProductMask = generateProductBlock(master, updatedModelBlock as any)!
        newProductMask.id = child.id
        result.updated.push(newProductMask)
        updatedChildBlockIds.push(child.productId!)
      })
      const newProductBlocks = masters.filter(master => updatedChildBlockIds.includes(master.id))
        .map(master => generateProductBlock(master, updatedModelBlock as any)!)
      result.insert.push(...newProductBlocks)
    } else {
      result.deleted.push(...updatedChildBlocks)
    }
  }

  return result
}
