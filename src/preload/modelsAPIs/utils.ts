import type {
  ModelBlockJSON, ModelBlock, Variable, Series, Link, Method,
  Model, Property, ModelJSON
} from '@shared/dataModelTypes'
import { RebaseNeededType } from '@shared/dataModelTypes/models/helpers'
import { AnchorProduct, AnchorProductInterface, AnchorProductJson } from '@shared/dataModelTypes/product/products'
import { omit, clone } from '@shared/functional'
import { ObjectSerialize } from '../productAPIs/utils'
import { IndexBlock } from '@shared/dataModelTypes/product/indicators'
export function convertIndexBlocksToIndexBlocksJSON(indexBlock: IndexBlock): IndexBlock {
  const B = clone(indexBlock)
  const updatedAtNow = new Date().getTime()
  return {
    ...omit(['id'], ObjectSerialize(B)),
    updatedAt: updatedAtNow
  }
}

export function reformatModelJSONForModelDBInsertion(modelJSON: ModelJSON): Partial<ModelJSON> {
  return {
    ...omit(['id', 'version', 'blocks', 'tags', 'indexBlock'], modelJSON),
    tags: JSON.stringify(modelJSON.tags)
  }
}

export function convertModelBlocksToModelBlocksJSON(modelBlocks: ModelBlock[]): ModelBlockJSON[] {
  const blocks = modelBlocks.map(block => ({
    ...block,
    variables: convertModelBlockPropertiesToArray(block.variables) as Variable[],
    series: convertModelBlockPropertiesToArray(block.series) as Series[],
    links: convertModelBlockPropertiesToArray(block.links) as Link[],
    methods: convertModelBlockPropertiesToArray(block.methods) as Method[]
  }))
  const { blocksMap, inheritanceMap } = generateHelperMaps(blocks)

  const formattedBlocks = blocks.map(block => {
    const childrenIDs = inheritanceMap.get(block.id) ?? []
    const children = childrenIDs.map(id => {
      return {
        id,
        name: blocksMap.get(id)!.block.name,
        index: blocksMap.get(id)!.index
      }
    })

    // figure out parent's name
    let parentName = ''
    let currentBlock: ModelBlockJSON | undefined = block
    while (currentBlock) {
      const pBlock: ModelBlockJSON | undefined = currentBlock.parentId ? blocksMap.get(currentBlock.parentId)?.block : undefined
      if (pBlock) {
        parentName = parentName === '' ? pBlock.name : pBlock.name + '::' + parentName
      }
      currentBlock = pBlock
    }

    const blockOutput = {
      ...block,
      children,
      parent: {
        id: block.parentId,
        name: parentName,
        index: block.parentId ? blocksMap.get(block.parentId)?.index : null
      }
    }
    // remove repeated fields
    delete blockOutput.parentId
    delete blockOutput.modelId
    delete blockOutput.workspaceId

    return blockOutput
  })
  return formattedBlocks as any[]
}

function generateHelperMaps(blocks: ModelBlockJSON[]): {
  blocksMap: Map<number | string, { block: ModelBlockJSON, index: number }>
  inheritanceMap: Map<number | string, (number | string)[]>
} {
  // blocksMap is a key-value table, where key is block.id
  // and value is an object contains block itself and its index in the blocks
  const blocksMap = new Map<number, { block: ModelBlockJSON, index: number }>()
  // inheritanceMap is a key-value table, where key is parentId
  // and value is an array contains its children's ids
  const inheritanceMap = new Map<number, number[]>()
  blocks.forEach((block, index) => {
    blocksMap.set(block.id as number, { block, index })
    if (block.parentId) {
      const oldChildIDList = inheritanceMap.get(block.parentId)
      const newChildIDList = oldChildIDList ? [block.id].concat(oldChildIDList) : [block.id]
      inheritanceMap.set(block.parentId, newChildIDList as number[])
    }
  })
  return { blocksMap, inheritanceMap }
}

function convertModelBlockPropertiesToArray(properties: Record<string, Property>): Property[] {
  const propertiesArray: Property[] = []
  for (const currentId in properties) {
    propertiesArray.push(properties[currentId])
  }
  return propertiesArray
}

export function blockHeaderUpdated(oldBlock: Partial<ModelBlock>, newBlock: Partial<ModelBlock>): boolean {
  if (oldBlock.name !== newBlock.name) {
    return true
  }
  if (oldBlock.copySize !== newBlock.copySize) {
    return true
  }
  if (oldBlock.copyType !== newBlock.copyType) {
    return true
  }
  if (oldBlock.definitions !== newBlock.definitions) {
    return true
  }
  return false
}

export function blockFormulaUpdated(oldBlock: Partial<ModelBlock>, newBlock: Partial<ModelBlock>): boolean {
  if (oldBlock.copySizeFunctionLines !== newBlock.copySizeFunctionLines) {
    return true
  }
  if (oldBlock.initializeFormula !== newBlock.initializeFormula) {
    return true
  }
  if (oldBlock.finalizeFormula !== newBlock.finalizeFormula) {
    return true
  }
  if (oldBlock.runAfterRebaseFormula !== newBlock.runAfterRebaseFormula) {
    return true
  }
  if (oldBlock.rebaseBaseFunctionLines !== newBlock.rebaseBaseFunctionLines) {
    return true
  }
  return false
}

export function convertModelBlockJSONToModelBlock(
  blockJSON: ModelBlockJSON, modelId: number, workspaceId: number): ModelBlock {
  const { variables, series, links, methods } = normalizePropertiesForModelBlockJSON(blockJSON)
  const copySizeFunctionLines = blockJSON.copySizeFunctionLines
    ? blockJSON.copySizeFunctionLines : 'return 0;'
  const runAfterRebaseFormula = blockJSON.runAfterRebaseFormula
    ? blockJSON.runAfterRebaseFormula : 'return ;'
  const initializeFormula = blockJSON.initializeFormula
    ? blockJSON.initializeFormula : 'return;'
  const finalizeFormula = blockJSON.finalizeFormula
    ? blockJSON.finalizeFormula : 'return;'
  const definitions = blockJSON.definitions
    ? blockJSON.definitions : ''
  const timeNow = new Date().getTime()
  return {
    ...blockJSON,
    updatedAt: timeNow,
    updatedPropertyAt: timeNow,
    updatedFormulaAt: timeNow,
    updatedHeaderAt: timeNow,
    modelId,
    workspaceId,
    copySizeFunctionLines,
    runAfterRebaseFormula,
    initializeFormula,
    finalizeFormula,
    definitions,
    variables,
    series,
    links,
    methods,
    isProductMask: blockJSON.isProductMask ?? false,
    // normalize some fields which the json may be missing
    rebaseNeeded: blockJSON.rebaseNeeded ? RebaseNeededType.yes : RebaseNeededType.no,
    tags: blockJSON.tags ?? [],
    share: blockJSON.share ?? false,
    static: blockJSON.static ?? false,
    allowManualResize: blockJSON.allowManualResize ?? false,
    slidingWindow: blockJSON.slidingWindow ?? false
  }
}

/**
 * Normalize some fields that may be missing in variables, series, link and methods fields
 * in model block json
 * @param blockJSON
 * @returns
 */
function normalizePropertiesForModelBlockJSON(blockJSON: ModelBlockJSON): {
  variables: Record<string, Variable>
  series: Record<string, Series>
  links: Record<string, Link>
  methods: Record<string, Method>
} {
  const timeNow = new Date().getTime()
  const variables: Record<string, Variable> = {}
  blockJSON.variables?.forEach(v => {
    v.copyFormula = v.copyFormula || 'return 0;\n'
    v.calcFormula = v.calcFormula || 'return 0;\n'
    v.creator = v.creator || ''
    v.classify = v.classify || ''
    v.modifiedAt = v.modifiedAt || timeNow
    v.allowManualResize = v.allowManualResize ?? false
    variables[v.id] = v
  })
  const series: Record<string, Series> = {}
  blockJSON.series?.forEach(s => {
    // normalize auto sum
    s.isAutoSum = s.isAutoSum ?? false
    s.autoSumLevel = s.autoSumLevel ?? 0
    s.copyFormula = s.copyFormula || 'return 0;\n'
    s.calcFormula = s.calcFormula || 'return 0;\n'
    s.slidingWindow = s.slidingWindow ?? false
    s.allowManualResize = s.allowManualResize ?? false
    s.slidingWindowChunks = s.slidingWindowChunks ?? 1
    s.creator = s.creator || ''
    s.classify = s.classify || ''
    s.modifiedAt = s.modifiedAt || timeNow
    series[s.id] = s
  })
  const links: Record<string, Link> = {}
  blockJSON.links?.forEach(l => {
    l.creator = l.creator || ''
    l.classify = l.classify || ''
    l.modifiedAt = l.modifiedAt || timeNow
    links[l.id] = l
  })
  const methods: Record<string, Method> = {}
  blockJSON.methods?.forEach(m => {
    m.creator = m.creator || ''
    m.classify = m.classify || ''
    m.modifiedAt = m.modifiedAt || timeNow
    methods[m.id] = m
  })
  return { variables, series, links, methods }
}

export function reformatBlockForDB(block?: Partial<ModelBlock>, updateFormula?: boolean, updateHeader?: boolean): any {
  const blockForDB = clone(block)
  blockForDB?.tags && (blockForDB.tags = JSON.stringify(blockForDB.tags))
  blockForDB?.variables && (blockForDB.variables = JSON.stringify(blockForDB.variables))
  blockForDB?.series && (blockForDB.series = JSON.stringify(blockForDB.series))
  blockForDB?.links && (blockForDB.links = JSON.stringify(blockForDB.links))
  blockForDB?.methods && (blockForDB.methods = JSON.stringify(blockForDB.methods))
  const updatedAtNow = new Date().getTime()
  const timeUpdate: any = {}
  if (updateFormula) {
    timeUpdate.updatedFormulaAt = updatedAtNow
  }
  if (updateHeader) {
    timeUpdate.updatedHeaderAt = updatedAtNow
  }
  return {
    ...omit(['id', 'parent', 'children', 'detailedChildren', 'startUp', 'detailedParent', 'updatedFormulaAt', 'updatedHeaderAt'], blockForDB),
    updatedAt: updatedAtNow,
    ...timeUpdate
  }
}

export function reformatBlockForDBCopy(block?: Partial<ModelBlock>, updateFormula?: boolean, updateHeader?: boolean): any {
  const blockForDB = clone(block)
  blockForDB?.tags && (blockForDB.tags = JSON.parse(JSON.stringify(blockForDB.tags)))
  blockForDB?.variables && (blockForDB.variables = JSON.parse(JSON.stringify(blockForDB.variables)))
  blockForDB?.series && (blockForDB.series = JSON.parse(JSON.stringify(blockForDB.series)))
  blockForDB?.links && (blockForDB.links = JSON.parse(JSON.stringify(blockForDB.links)))
  blockForDB?.methods && (blockForDB.methods = JSON.parse(JSON.stringify(blockForDB.methods)))
  const updatedAtNow = new Date().getTime()
  const timeUpdate: any = {}
  if (updateFormula) {
    timeUpdate.updatedFormulaAt = updatedAtNow
  }
  if (updateHeader) {
    timeUpdate.updatedHeaderAt = updatedAtNow
  }
  return {
    ...omit(['id', 'parent', 'children', 'detailedChildren', 'startUp', 'detailedParent'], blockForDB),
    updatedAt: updatedAtNow,
    ...timeUpdate
  }
}

export function reformatProductForDB(product?: Partial<AnchorProduct>): any {
  const productForDB = clone(product)
  productForDB?.tags && (productForDB.tags = JSON.stringify(productForDB.tags))
  productForDB?.products && (productForDB.products = JSON.stringify(productForDB.products))
  productForDB?.codeIndexes && (productForDB.codeIndexes = JSON.stringify(productForDB.codeIndexes))
  const updatedAtNow = new Date().getTime()
  return {
    ...omit(['updateCodeIndexForEval', 'updateCodeIndexForEval'], productForDB),
    updatedAt: updatedAtNow
  }
}

export function reformatModelForDB(model: Partial<Model>): any {
  const modelForDB = model as any
  modelForDB.tags && (modelForDB.tags = JSON.stringify(modelForDB.tags))
  return {
    ...omit(['id', 'detailedChildren'], modelForDB)
  }
}

export function parseAModelFromDBQuery(result: any): Model {
  const tags = JSON.parse(result.tags)
  return {
    ...result,
    tags
  }
}

export function convertModelQueryResultToModelArray(result: any[], products?: AnchorProductInterface[]): Model[] {
  const modelMap = new Map() as Map<number, Model>
  result.forEach(currentModelBlock => {
    let currentModel = modelMap.get(currentModelBlock.modelId)
    if (!currentModel) {
      // create a new model
      // normalize tags format
      let parsedTags: string[] = []
      try {
        parsedTags = JSON.parse(currentModelBlock.modelTags)
      } catch (err) {
      }
      parsedTags = typeof parsedTags.length === 'number' ? parsedTags : []

      currentModel = {
        id: currentModelBlock.modelId,
        name: currentModelBlock.modelName,
        tags: parsedTags,
        description: currentModelBlock.modelDescription,
        isDateCenter: currentModelBlock.modelIsDateCenter,
        dateAlignType: currentModelBlock.modelDateAlignType,
        rootBlockId: currentModelBlock.modelRootBlockId,
        detailedChildren: [],
        // anchorProducts: products?.filter(product => product.modelId === currentModelBlock.modelId) ?? [],
        workspaceId: currentModelBlock.workspaceId
      }
      modelMap.set(currentModelBlock.modelId, currentModel)
    }
    // this is to filter out empty model, which do not have any model block
    if (currentModelBlock.id) {
      currentModelBlock = parseAModelBlockFromDBQuery(currentModelBlock)
      currentModel.detailedChildren.push(omit(['modelName', 'modelTags', 'modelDescription', 'modelIsDateCenter', 'modelDateAlignType'], currentModelBlock))
    }
  })

  const models: Model[] = []
  modelMap.forEach(model => {
    model.isDateCenter = !!model.isDateCenter
    models.push(model)
  })
  return models
}

export function parseAModelBlockFromDBQuery(result: any): ModelBlock {
  const variables = JSON.parse(result.variables)
  const series = JSON.parse(result.series)
  const links = JSON.parse(result.links)
  const methods = JSON.parse(result.methods)
  const tags = JSON.parse(result.tags)
  return {
    ...result,
    variables,
    series,
    links,
    methods,
    tags,
    // sqlite3 doesn't support boolean type, and uses 0 and 1 instead
    share: !!result.share,
    static: !!result.static,
    allowManualResize: !!result.allowManualResize,
    slidingWindow: !!result.slidingWindow,
    rebaseSwitch: !!result.rebaseSwitch,
    rebaseDepth: !!result.rebaseDepth,
    isDateCenter: !!result.isDateCenter
  }
}

export function parseAProductFromDBQuery(result: any): AnchorProductInterface {
  const products = JSON.parse(result.products)
  const tags = JSON.parse(result.tags)
  const codeIndexes = JSON.parse(result.codeIndexes)

  return {
    ...result,
    products,
    codeIndexes,
    tags
    // sqlite3 doesn't support boolean type, and uses 0 and 1 instead
  }
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
