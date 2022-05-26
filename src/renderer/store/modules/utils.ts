import type { Model, ModelBlock, ModelNavigationNode, SimplifiedModel, SimplifiedModelBlock, ModelNavigationTree } from '@shared/dataModelTypes'
import Mask from '@shared/dataModelTypes/models/masks'
import Block from '@shared/dataModelTypes/models/blocks'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { AnchorProduct, Product, SimplifiedProduct, ProductBlock } from '@shared/dataModelTypes/product/products'
import { Queue } from '@shared/dataModelTypes/runs/projections'
import { getMasterNavigationNodeIdAndType, MasterNodeType, ModelNodeType, getProductIdAndName, getModelNodeType, treeFind } from '@/utils'
import masterDataSource from './masterDataSource'

export function parseStringPostfixNumber(nameStr: string): number {
  let index: number = nameStr?.length
  let chr: string = ''
  do {
    --index
    chr = nameStr.charAt(index)
  } while (chr >= '0' && chr <= '9' && index >= 0)
  return ++index
}
// iterate in pre order: mask first, block second, child block last
// for each block, execute the callback
export function iterateModelInPreOrder(model: Model, callback: (block: ModelBlock) => any) {
  if (model.detailedChildren.length === 0) return
  const modelBlockStack = [] as ModelBlock[]
  for (let i = model.detailedChildren.length - 1; i >= 0; i--) {
    modelBlockStack.push(model.detailedChildren[i])
  }
  while (modelBlockStack.length > 0) {
    const current = modelBlockStack.pop()!
    callback(current)
    if (current.detailedChildren) {
      for (let j = current.detailedChildren.length - 1; j >= 0; j--) {
        modelBlockStack.push(current.detailedChildren[j])
      }
    }
  }
}
/**
 *
 * @param models raw model array, each model's detailedChildren is a flat modelBlock array
 * @returns object: { newModelMap: map of <model.id, model>, newModelBlockMap: map of <modelBlock.id, modelBlock> }
 */
export function buildAppModelFromRawModels(models: Model[]): {
  newModelMap: Map<number, Model>,
  newModelBlockMap: Map<number, ModelBlock>
  newProductMap: Map<number, AnchorProduct>
  newModelNavigationNodes: ModelNavigationNode[]
  newProductBlockMap: Map<number, ModelBlock>
} {
  const newModelMap = new Map<number, Model>()
  const newModelBlockMap = new Map<number, ModelBlock>()
  const newProductMap = new Map<number, AnchorProduct>()
  const newModelNavigationNodes = [] as ModelNavigationNode[]
  const newProductBlockMap = new Map<number, ModelBlock>()
  models.forEach(model => {
    newModelMap.set(model.id as number, model)

    const blockArray = model.detailedChildren
    const allMasks = blockArray.filter(block => !block.parentId).map(block => new Mask(block))
    allMasks.forEach(mask => {
      newModelBlockMap.set(mask.id, mask)
    })

    const allBlocks = blockArray.filter(block =>
      block.parentId && newModelBlockMap.get(block.parentId)
    ).map(block => new Block(newModelBlockMap.get(block.parentId!) as Mask, block))

    // TODO: may remove allBlockJSONMap logic later.
    // TODO: Using this is to be compatible with json that still has ref field inside property
    const allBlockJSONMap = blockArray.filter(block =>
      block.parentId && newModelBlockMap.get(block.parentId)
    ).reduce((acc, cur) => {
      acc.set(cur.id as number, cur)
      return acc
    }, new Map<number, ModelBlock>())
    const blockMap = new Map<number, Block>()
    allBlocks.forEach(block => {
      newModelBlockMap.set(block.id, block)
      blockMap.set(block.id, block)
    })

    const allChildBlocks = blockArray.filter(block =>
      block.parentId && blockMap.get(block.parentId)
    ).map(block => {
      const parent = newModelBlockMap.get(block.parentId!)! as Block
      // TODO: may remove parentJSON logic later.
      // TODO: Using this is to be compatible with json that still has ref field inside property
      const parentJSON = allBlockJSONMap.get(block.parentId!)! as Block
      return new Block(parent, block, parentJSON)
    })

    allChildBlocks.forEach(childBlock => {
      newModelBlockMap.set(childBlock.id, childBlock)
    })

    // construct newModelNavigationTree
    const currentModelTree = {
      id: ModelNavigationNodeType.models + NaviNodeIdDelimiter + model.id,
      name: model.name,
      children: allMasks.map(mask => buildModelNavigationTree(mask))
    }
    newModelNavigationNodes.push(currentModelTree)

    blockArray.filter(block => block.productId)
      .map(productBlock => {
        return productBlock.parentId
          ? newProductBlockMap.set(<number>productBlock.id, new Block(productBlock as Block))
          : newProductBlockMap.set(<number>productBlock.id, new Mask(productBlock as Block))
      })
    // model.anchorProducts?.forEach((product: AnchorProductInterface) => {
    //   newProductMap.set(product.id, new AnchorProduct(product))
    // })
  })
  return { newModelMap, newModelBlockMap, newModelNavigationNodes, newProductMap, newProductBlockMap }
}

function buildModelNavigationTree(block: ModelBlock): ModelNavigationNode {
  return {
    id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + block.id,
    name: block.name,
    copyType: block.copyType,
    children: block.detailedChildren?.filter(block => !block.productId).map(block => buildModelNavigationTree(block)) ?? []
  }
}

/**
 *
 * @param modelBlocks {ModelBlock[]} can not be empty. It is the result of transverse of a model block and its precedents in pre order
 *        therefore, the first model block in the array must be the root of the model block tree
 * @returns
 */
export function buildAppModelFromRawModelBlocks(modelBlocks: ModelBlock[], parentBlock: ModelBlock | null): {
  newModelBlockMap: Map<number, ModelBlock>
  newModelNavigationNode: ModelNavigationNode
} {
  const newModelBlockMap = new Map<number, ModelBlock>()

  if (modelBlocks.length <= 0) throw new TypeError('first parameter can not be an empty array')

  const rootBlock = parentBlock ? new Block(parentBlock as Mask | Block, modelBlocks[0]) : new Mask(modelBlocks[0])
  newModelBlockMap.set(rootBlock.id, rootBlock)

  const allChildBlocks = modelBlocks.filter(block =>
    block.parentId && block.parentId === rootBlock.id
  ).map(block => new Block(newModelBlockMap.get(block.parentId!) as Mask, block))

  const childBlockMap = new Map<number, Block>()
  allChildBlocks.forEach(block => {
    newModelBlockMap.set(block.id, block)
    childBlockMap.set(block.id, block)
  })

  const allGrandChildBlocks = modelBlocks.filter(block =>
    block.parentId && childBlockMap.get(block.parentId)
  ).map(block => new Block(childBlockMap.get(block.parentId!) as Block, block))

  allGrandChildBlocks.forEach(childBlock => {
    newModelBlockMap.set(childBlock.id, childBlock)
  })
  // construct newModelNavigationTree
  const newModelNavigationNode = {
    id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + rootBlock.id,
    name: rootBlock.name,
    children: rootBlock.detailedChildren!.map(block => buildModelNavigationTree(block))
  }

  return { newModelBlockMap, newModelNavigationNode }
}

export function generateADuplicatedItemName<T extends { name: string }>(item: T, allItems: T[]): string {
  let newItemName = item.name
  const numberPostfix = parseStringPostfixNumber(item.name)
  const nameLen = item.name.length
  let postfixNumber = 1
  let namePrefix = ''
  if (nameLen === numberPostfix) {
    postfixNumber = 1
    namePrefix = item.name
  } else {
    postfixNumber = parseInt(item.name.substring(numberPostfix, nameLen)) + 1
    namePrefix = item.name.substring(0, numberPostfix)
  }
  newItemName = namePrefix + postfixNumber.toString()
  while (allItems.find(item => item.name === newItemName)) {
    ++postfixNumber
    newItemName = namePrefix + postfixNumber.toString()
  }
  return newItemName
}
// iterate in pre order: mask first, block second, child block last
// for each block, execute the callback
export function iterateModelBlockInPreOrder(modelBlock: ModelBlock): ModelBlock[] {
  const modelBlockStack = [] as ModelBlock[]
  if (!modelBlock.detailedChildren || modelBlock.detailedChildren.length === 0) return [modelBlock]

  modelBlockStack.push(modelBlock)
  const modelBlockArray = [] as ModelBlock[]
  while (modelBlockStack.length > 0) {
    const current = modelBlockStack.pop()!
    modelBlockArray.push(current)
    if (current.detailedChildren) {
      for (let j = current.detailedChildren.length - 1; j >= 0; j--) {
        modelBlockStack.push(current.detailedChildren[j])
      }
    }
  }
  return modelBlockArray
}

// export async function getDefaultSettings(projItem: Projection): Promise<void> {
//   let appSettings = await window.apis.appSettings.app.query()
//   let projSettings = await window.apis.appSettings.task.query()
//   let runSettings = await window.apis.appSettings.runner.query()
//   projItem.calculationStackHeightLimit = appSettings.calculationStackHeightLimit
//   projItem.errorTraceLength = appSettings.errorTraceLength

//   projItem.outputFolder = projSettings.outputFolder
//   projItem.outputPrecision = projSettings.outputPrecision
//   projItem.childFolderSelect = projSettings.childFolderSelect
//   projItem.mode = projSettings.mode

//   projItem.slidingWindow = runSettings.slidingWindow
//   projItem.rebaseDepth = runSettings.rebaseDepth
//   projItem.rebaseSwitch = runSettings.rebaseSwitch
//   projItem.allowIterationWhenCircularReference = runSettings.allowIterationWhenCircularReference
//   projItem.modelPointsOutput = runSettings.modelPointsOutput
//   projItem.independentInnerLoop = runSettings.independentInnerLoop
//   projItem.independentOuterLoop = runSettings.independentOuterLoop
//   projItem.allowOuterLoopNumber = runSettings.allowOuterLoopNumber
//   projItem.allowScope = runSettings.allowScope
//   projItem.multiThreadNumber = runSettings.multiThreadNumber
//   projItem.allowInnerLoopNumber = runSettings.allowInnerLoopNumber
// }

export async function getQueueDefaultSettings(projItem: Queue): Promise<void> {
  let appSettings = await window.apis.appSettings.app.query()
  let projSettings = await window.apis.appSettings.task.query()
  let runSettings = await window.apis.appSettings.runner.query()
  // projItem.calculationStackHeightLimit = appSettings.calculationStackHeightLimit
  // projItem.errorTraceLength = appSettings.errorTraceLength

  // projItem.outputFolder = projSettings.outputFolder
  // projItem.outputPrecision = projSettings.outputPrecision
  // projItem.childFolderSelect = projSettings.childFolderSelect
  // projItem.mode = projSettings.mode

  projItem.slidingWindow = runSettings.slidingWindow
  projItem.rebaseDepth = runSettings.rebaseDepth
  projItem.rebaseSwitch = runSettings.rebaseSwitch
  projItem.allowIterationWhenCircularReference = runSettings.allowIterationWhenCircularReference
  projItem.modelPointsOutput = runSettings.modelPointsOutput
  projItem.independentInnerLoop = runSettings.independentInnerLoop
  projItem.independentOuterLoop = runSettings.independentOuterLoop
  projItem.allowOuterLoopNumber = runSettings.allowOuterLoopNumber
  projItem.allowScope = runSettings.allowScope
  projItem.multiThreadNumber = runSettings.multiThreadNumber
  projItem.allowInnerLoopNumber = runSettings.allowInnerLoopNumber
  projItem.scopeFrom = runSettings.scopeFrom
  projItem.scopeTo = runSettings.scopeTo
  projItem.innerLoopNumberFrom = runSettings.innerLoopNumberFrom
  projItem.innerLoopNumberTo = runSettings.innerLoopNumberTo
  projItem.outerLoopNumberFrom = runSettings.outerLoopNumberFrom
  projItem.outerLoopNumberTo = runSettings.outerLoopNumberTo
}

// export async function updateAllSettings(projItem: Partial<Projection>): Promise<void> {
//   await window.apis.appSettings.app.update({
//     calculationStackHeightLimit: projItem.calculationStackHeightLimit,
//     errorTraceLength: projItem.errorTraceLength
//   })
//   await window.apis.appSettings.task.update({
//     outputFolder: projItem.outputFolder,
//     outputPrecision: projItem.outputPrecision,
//     childFolderSelect: projItem.childFolderSelect || true, // TODO 现在前端可能还没适配该属性
//     mode: projItem.mode
//   })
//   await window.apis.appSettings.runner.update({
//     slidingWindow: projItem.slidingWindow,
//     rebaseDepth: projItem.rebaseDepth,
//     rebaseSwitch: projItem.rebaseSwitch,
//     allowIterationWhenCircularReference: projItem.allowIterationWhenCircularReference,
//     modelPointsOutput: projItem.modelPointsOutput,
//     independentInnerLoop: projItem.independentInnerLoop,
//     independentOuterLoop: projItem.independentOuterLoop,
//     allowOuterLoopNumber: projItem.allowOuterLoopNumber,
//     allowScope: projItem.allowScope,
//     multiThreadNumber: projItem.multiThreadNumber,
//     allowInnerLoopNumber: projItem.allowInnerLoopNumber,
//     scopeFrom: projItem.scopeFrom,
//     scopeTo: projItem.scopeTo,
//     innerLoopNumberFrom: projItem.innerLoopNumberFrom,
//     innerLoopNumberTo: projItem.innerLoopNumberTo,
//     outerLoopNumberFrom: projItem.outerLoopNumberFrom,
//     outerLoopNumberTo: projItem.outerLoopNumberTo
//   })
// }

export function getModelIdByCurrentMasterNode(currentMasterNode: SimplifiedProduct | Product): { modelId: number, masterId: number } {
  const { id, type } = getMasterNavigationNodeIdAndType(currentMasterNode!.id)
  let CompleteData
  if (MasterNodeType.master === type) {
    CompleteData = masterDataSource.getCompleteMaster(id)
  } else {
    const product = masterDataSource.getCompleteProduct(currentMasterNode!.id)
    CompleteData = masterDataSource.getCompleteMaster(product!.masterId)
  }
  return {
    modelId: CompleteData.modelId!,
    masterId: CompleteData.id
  }
}

export function filterProductMaskAndBlock(data: ModelBlock[], masterId: number): ProductBlock[] {
  const isParentBlockIds: number[] = []
  return data.filter(block => {
    const { id } = getProductIdAndName(block)
    if (block.isProductMask) {
      !id && isParentBlockIds.push(block.id)
      return !!id
    }
    return block
  }).filter(block => {
    const { id } = getProductIdAndName(block)
    return !block.parentId || !isParentBlockIds.includes(block.parentId) || id === masterId
  }).map(block => {
    const { id, name } = getProductIdAndName(block)
    return {
      name: id ? name : block.name,
      id: block.id,
      parentId: id ? null : block.parentId
    }
  })
}
// 多层构造树型结构数据
export function constructStructureTreeDataForProduct(data: ProductBlock[]) {
  if (!Array.isArray(data) || !data.length) return
  let map: any = {}

  data.forEach((item: any) => {
    item.id = `${ModelNodeType.modelBlocks}${NaviNodeIdDelimiter}${item.id}`
    if (item.parentId) item.parentId = `${ModelNodeType.modelBlocks}${NaviNodeIdDelimiter}${item.parentId}`
    map[item.id] = item
  })

  let roots: any = []
  data.forEach((item: any) => {
    const parent = map[item.parentId]
    if (parent) {
      (parent.children || (parent.children = [])).push(item)
    } else {
      roots.push(item)
    }
  })
  return roots
}
export function checkedQueueAndQueueRunnerIsNew(id: string) {
  if (id.indexOf('new-') !== -1) {
    return true
  } else {
    return false
  }
}
export function generateCopyQueueName(queueList: Queue[], queueName: string) {
  let newQueueName = queueName
  const numberPostfix = parseStringPostfixNumber(queueName)
  const nameLen = queueName.length
  let postfixNumber = 1
  let namePrefix = ''
  if (nameLen === numberPostfix) {
    postfixNumber = 1
    namePrefix = queueName
  } else {
    postfixNumber = parseInt(queueName.substring(numberPostfix, nameLen)) + 1
    namePrefix = queueName.substring(0, numberPostfix)
  }
  newQueueName = namePrefix + postfixNumber.toString()
  while (!checkNewQueueName(queueList, newQueueName)) {
    ++postfixNumber
    newQueueName = namePrefix + postfixNumber.toString()
  }
  return newQueueName
}
function checkNewQueueName(queueList: Queue[], queueName: string) {
  let result = true
  for (let i = 0; i < queueList.length; i++) {
    if (queueList[i].name === queueName) {
      result = false
    }
  }
  return result
}

export function generateRandomNumber() {
  return Math.round(Math.random() * 80 + 20)
}
