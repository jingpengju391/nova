/* eslint-disable no-useless-return */
import type {
  Model, ModelBlock, Mask, Block, SimplifiedModel, SimplifiedModelBlock,
  Variable, DataMappingItem, FormulaTabItem, Property
} from '@shared/dataModelTypes'
import { PropertyType, VariableSource, CopyTypeBlock, SeriesSource, LinkSource, MethodSource } from '@shared/dataModelTypes/models/helpers'
import { clone, omit } from '@shared/functional'
import { parseStringPostfixNumber } from './utils'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import {
  getModelNavigationNodeIdAndType, getPropertyType
} from '@/utils'
import { AnchorProduct, AnchorProductInterface } from '@shared/dataModelTypes/product/products'
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
// this works as the data support layer for models module
// since we don't need the whole modelTree to be reactive
// just keep the necessary data in vuex to work with view layer
const wm = new WeakMap()
export class ModelsDataSource {
  #modelMap = new Map<number, Model>()
  #modelBlockMap = new Map<number, ModelBlock>()
  #originalModelMap = new Map<number, Model>()
  #productMap = new Map<number, AnchorProduct>()

  getModelRootId(modelId: number) {
    let rootBlockId
    const iterator = this.#modelMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      if (value.id === modelId) {
        rootBlockId = value.rootBlockId
        done = true
      }
      const newResult = iterator.next()
      value = newResult.value
    }
    return rootBlockId
  }

  clear() {
    this.#modelMap.clear()
    this.#modelBlockMap.clear()
    this.#productMap.clear()
  }

  getCompleteModels() {
    return Array.from(this.#modelMap.values())
  }

  addClassifyList(classifyList: any, id: number) {
    const model = this.#modelMap.get(id)
    if (!model) return
    model.classifyList = classifyList
  }

  addNewEntriesToModelMap(newEntries: Map<number, Model>) {
    newEntries.forEach(entry => {
      this.#modelMap.set(<number>entry.id, entry)
    })
  }

  addNewEntriesToOriginalModelMap(newEntries: Map<number, Model>) {
    newEntries.forEach(entry => {
      this.#originalModelMap.set(<number>entry.id, clone(entry))
    })
  }

  addNewEntriesToProductMap(newEntries: Map<number, AnchorProduct>) {
    newEntries.forEach(entry => {
      this.#productMap.set(<number>entry.id, entry)
    })
  }

  addNewCodeIndexesToModelMap(codeIndexes: CodeIndex[]) {
    codeIndexes.forEach(codeIndex => {
      const model = this.getCompleteModel(codeIndex.modelId)
      if (codeIndex.id && model) {
        model.codeIndexes = model.codeIndexes || {}
        model.codeIndexes[codeIndex.id] = codeIndex
      }
    })
  }

  getCodeIndexesByModeId(modeId: number): CodeIndex[] {
    const model = this.getCompleteModel(modeId)
    return model.codeIndexes ? Object.values(model.codeIndexes) : []
  }

  getCodeIndexesByModeIdAndCodeIndexId(modeId: number, codeIndexId:number): CodeIndex | undefined {
    const model = this.getCompleteModel(modeId)
    return model.codeIndexes ? model.codeIndexes[codeIndexId] : undefined
  }

  updatedCodeIndexesToModelMap(codeIndex: CodeIndex) {
    if (!codeIndex.id) return
    const model = this.getCompleteModel(codeIndex.modelId)
    model.codeIndexes = model.codeIndexes || {}
    model.codeIndexes[codeIndex.id] = codeIndex
  }

  deleteCodeIndexesToModelMap(codeIndexes: CodeIndex[]) {
    codeIndexes.forEach(codeIndex => {
      const model = this.getCompleteModel(codeIndex.modelId)
      if (model) delete model.codeIndexes![codeIndex.id]
    })
  }

  getModelBlockMap() {
    return this.#modelBlockMap
  }

  setTemporaryModel(model: Model) {
    if (model.id !== 0) return
    this.#modelMap.set(0, model)
  }

  getTemporaryModel(): Model | undefined {
    return this.#modelMap.get(0)
  }

  getTemporaryProduct(): AnchorProduct | undefined {
    return this.#productMap.get(-1)
  }

  legalizeTemporaryModelWith(model: Model) {
    this.#modelMap.delete(0)
    this.#modelMap.set(<number>model.id, model)
  }

  deleteTemporaryModel() {
    this.#modelMap.delete(0)
  }

  deleteModel(modelId: number) {
    this.#modelMap.delete(modelId)
    this.#modelBlockMap.forEach(modelBlock => {
      modelBlock.modelId === modelId && this.#modelBlockMap.delete(modelBlock.id as number)
    })
  }

  deleteProduct(productId: number) {
    this.#productMap.delete(productId)
  }

  addNewEntriesToModelBlockMap(newEntries: Map<number, ModelBlock>) {
    newEntries.forEach(entry => {
      this.#modelBlockMap.set(entry.id as number, entry)
    })
  }

  addNewEntriesToProductModelBlockMap(newEntries: Map<number, ModelBlock>) {
    newEntries.forEach(entry => {
      if (entry.parentId) {
        const mask = this.#modelBlockMap.get(entry.parentId)!
        const detailedChildren = mask?.detailedChildren || []
        detailedChildren.push(entry as Block)
        mask.detailedChildren = detailedChildren
      }
    })
  }

  deleteModelBlocksById(ids: number[], maskId: number) {
    const mask = this.#modelBlockMap.get(maskId)
    if (!mask?.detailedChildren) return
    mask.detailedChildren = mask.detailedChildren.filter(m => !ids.includes(m.id))
    // const
    ids.forEach(id => this.#modelBlockMap.delete(id))
  }

  legalizeTemporaryModelBlockWith(modelBlock: Mask | Block) {
    const tempModelBlock = this.#modelBlockMap.get(0)!
    // this way, all the reference chain will be reserved
    // E.g. if we legalize a block, which is one of a Mask's detailedChildren
    // this way, the Mask still has the updated block as its child
    if (!tempModelBlock) return
    Object.assign(tempModelBlock, modelBlock)
    this.#modelBlockMap.delete(0)
    this.#modelBlockMap.set(tempModelBlock.id as number, tempModelBlock)
    if (!tempModelBlock.modelId) return
    const model = this.#modelMap.get(tempModelBlock.modelId)!
    model.detailedChildren = model?.detailedChildren || []
    model.detailedChildren.push(tempModelBlock)
  }

  setTemporaryModelBlock(modelBlock: Mask | Block) {
    if (modelBlock.id !== 0) return
    this.#modelBlockMap.set(0, modelBlock)
  }

  setTemporaryModelBlocksforCheck(modelBlock: any) {
    this.#modelBlockMap.set(modelBlock.id, modelBlock)
  }

  clearTemporaryModelBlocksforCheck() {
    this.#modelBlockMap.forEach(modelBlock => {
      modelBlock.id < 0 && this.#modelBlockMap.delete(modelBlock.id as number)
    })
  }

  setTemporaryProduct(anchorProduct: AnchorProduct) {
    if (anchorProduct.id !== -1) return
    this.#productMap.set(-1, anchorProduct)
  }

  setProduct(anchorProduct: AnchorProduct) {
    this.#productMap.set(anchorProduct.id, anchorProduct)
  }

  getTemporaryModelBlock(): ModelBlock | undefined {
    return this.#modelBlockMap.get(0)
  }

  deleteTemporaryModelBlock() {
    this.#modelBlockMap.delete(0)
  }

  deleteMask(maskId: number) {
    // first
    this.#modelBlockMap.delete(maskId)
    // second, delete all children of this Mask
    const childIds: number[] = []
    this.#modelBlockMap.forEach(modelBlock => {
      if (modelBlock.parentId === maskId) {
        childIds.push(modelBlock.id as number)
        this.#modelBlockMap.delete(modelBlock.id as number)
      }
    })
    // third, delete all grand children of this Mask
    this.#modelBlockMap.forEach(modelBlock => {
      if (modelBlock.parentId && childIds.includes(modelBlock.parentId)) {
        this.#modelBlockMap.delete(modelBlock.id as number)
      }
    })
  }

  deleteBlock(blockId: number) {
    // first
    this.#modelBlockMap.delete(blockId)
    // second, delete all children of this block
    this.#modelBlockMap.forEach((modelBlock: ModelBlock) => {
      if (modelBlock.parentId === blockId) {
        this.#modelBlockMap.delete(modelBlock.id as number)
      }
      if (modelBlock.detailedChildren) {
        const index = modelBlock.detailedChildren.findIndex(item => item.id === blockId)
        index !== -1 && modelBlock.detailedChildren.splice(index, 1)
      }
    })
  }

  deleteChildBlock(blockId: number) {
    this.#modelBlockMap.delete(blockId)
    // second, delete all children of this block
    this.#modelBlockMap.forEach((modelBlock: ModelBlock) => {
      if (modelBlock.parentId === blockId) {
        this.#modelBlockMap.delete(modelBlock.id as number)
      }
      if (modelBlock.detailedChildren) {
        const index = modelBlock.detailedChildren.findIndex(item => item.id === blockId)
        index !== -1 && modelBlock.detailedChildren.splice(index, 1)
      }
    })
  }

  getModelBlockType(id: number): ModelBlockType {
    const ancestorPath = this.getAncestorPathForAModelBlock(id)
    switch (ancestorPath.length) {
      case 4:
        return ModelBlockType.childBlocks
      case 3:
        return ModelBlockType.blocks
      default:
        return ModelBlockType.masks
    }
  }

  /**
   * This returns a reference to the model object with a specific id
   * @param id {number}
   * @returns {Model}
   */
  getModel(id: number): Model {
    return this.#modelMap.get(id)!
  }

  getProduct(id: number): AnchorProduct {
    return this.#productMap.get(id)!
  }

  /**
   * This returns a complete model object with a specific id
   * This function mainly used for write json to disk
   * Do not modify the returned model or its model blocks, which will cause the data source change.
   * @param id {number}
   * @returns {Model}
   */
  getModelAndItsModelBlocks(modelId: number): Model {
    const model = this.#modelMap.get(modelId)!
    const allModelBlocks = [] as any[]
    this.#modelBlockMap.forEach(item => {
      if (item.modelId === modelId) {
        const modelBlock = omit(['detailedParent', 'detailedChildren'], item)
        allModelBlocks.push(modelBlock)
      }
    })
    return {
      ...model,
      detailedChildren: allModelBlocks.sort((a, b) => a.id - b.id)
    }
  }

  getAllModelsWithTheirModelBlocks(): Model[] {
    return Array.from(this.#modelMap.keys()).map(modelId => {
      return this.getModelAndItsModelBlocks(modelId)
    })
  }

  /**
   * This returns a deep clone of model with a specific id
   * @param id {number}
   * @returns SimplifiedModel which do not have detailedChildren field
   */
  getSimplifiedModelForView(id: number): SimplifiedModel {
    // use object destructor here to break reactivity effect
    // if (!id) return ''
    const model = this.#modelMap.get(id)!
    return {
      id: model.id,
      name: model.name,
      rootBlockId: model.rootBlockId,
      description: model.description,
      tags: [...model.tags!],
      isDateCenter: model.isDateCenter,
      dateAlignType: model.dateAlignType,
      workspaceId: model.workspaceId,
      codeIndexes: model.codeIndexes
    }
  }

  /**
   * This returns a reference to the complete model block object with a specific id
   * @param id {number}
   * @returns {ModelBlock}
   */
  getCompleteModelBlock(id: number): ModelBlock {
    return this.#modelBlockMap.get(id)!
  }

  getCompleteModel(id: number): Model {
    return this.#modelMap.get(id)!
  }

  /**
   * This returns a deep clone of model block with a specific id
   * And this model block's variables, series, links and methods are arrays not objects
   * @param id {number}
   * @returns SimplifiedModel which do not have detailedChildren field
   */
  getSimplifiedModelBlockForView(id: number): SimplifiedModelBlock {
    const modelBlock = this.#modelBlockMap.get(id)!
    const variables = Object.values(modelBlock?.variables).map(item => ({
      id: item.id,
      name: item.name,
      type: PropertyType.variables,
      valueType: item.type,
      modifiedAt: item.modifiedAt || null,
      creator: item.creator ? item.creator : '-',
      classify: item.classify ? item.classify : '-',
      source: item.source || null
    }))
    const series = Object.values(modelBlock.series).map(item => ({
      id: item.id,
      name: item.name,
      type: PropertyType.series,
      modifiedAt: item.modifiedAt || null,
      creator: item.creator ? item.creator : '-',
      classify: item.classify ? item.classify : '-',
      source: item.source || null
    }))
    const links = Object.values(modelBlock.links).map(item => ({
      id: item.id,
      name: item.name,
      type: PropertyType.links,
      modifiedAt: item.modifiedAt || null,
      creator: item.creator ? item.creator : '-',
      classify: item.classify ? item.classify : '-',
      source: item.source || null
    }))
    const methods = Object.values(modelBlock.methods).map(item => ({
      id: item.id,
      name: item.name,
      type: PropertyType.methods,
      modifiedAt: item.modifiedAt || null,
      creator: item.creator ? item.creator : '-',
      classify: item.classify ? item.classify : '-',
      source: item.source || null
    }))
    return {
      ...modelBlock,
      variables,
      series,
      links,
      methods,
      tags: [...modelBlock.tags]
    }
  }

  getSourceLabel(type: SeriesSource | VariableSource | LinkSource | MethodSource): string {
    if (type === 'calculated') {
      return '公式'
    }
    if (type === 'parent') {
      return '父级'
    }
    if (type === 'toDefine') {
      return '空白'
    }
    if (type === 'default') {
      return '默认'
    }
    if (type === 'transmit') {
      return '传递'
    }
    if (type === 'data') {
      return '数据'
    }
    if (type === 'assumption') {
      return '假设'
    }
    if (type === 'codeIndex' || type === 'codeIndexFormula') {
      return '索引'
    }
    return type
  }

  getProperty(propertyId: string, propertyType: PropertyType, modelBlockId: number): Property {
    // use clone here to break reactivity effect
    return clone(this.#modelBlockMap.get(modelBlockId)![propertyType][propertyId])
  }

  getDescendent(modelBlockId: number): ModelBlock[] {
    const modelBlock = this.#modelBlockMap.get(modelBlockId)
    if (!modelBlock) return []
    const descendent = [] as ModelBlock[]
    modelBlock.detailedChildren?.forEach(block => {
      descendent.push(block)
      block.detailedChildren.forEach(childBlock => {
        descendent.push(childBlock)
      })
    })
    return descendent
  }

  /**
   *
   * @param {PropertyType} propertyType: variables, series, links or methods
   * @returns the property map object of a modelBlock, such as modelBlock.variables
   */
  getAllClonedPropertiesOfType(propertyType: PropertyType, modelBlockId: number): Record<string, Property> {
    // use object destructor here to break reactivity effect
    return clone(this.#modelBlockMap.get(modelBlockId)![propertyType])
  }

  /**
   *
   * @param modelBlockId
   * @returns array of ancestor's id, in order of [model.id, mask.id, block.id, childBlock.id]
   */
  getAncestorPathForAModelBlock(modelBlockId: number): number[] {
    const ids = []
    try {
      const thisModelBlock: ModelBlock | null = this.#modelBlockMap.get(modelBlockId)!
      if (thisModelBlock) {
        let currentModelBlock: ModelBlock | null = thisModelBlock
        while (currentModelBlock) {
          ids.push(currentModelBlock.id)
          if (currentModelBlock.parentId) {
            currentModelBlock = this.#modelBlockMap.get(currentModelBlock.parentId)!
          } else {
            currentModelBlock = null
          }
        }
        ids.push(thisModelBlock!.modelId)
      }
    } catch (err) {
      console.log(err)
    }
    return ids.reverse() as number[]
  }

  getMaskOfAModelBlock(modelBlockId: number): Mask {
    const ancestorIds = this.getAncestorPathForAModelBlock(modelBlockId)
    let ancestorId = ancestorIds[1]
    if (typeof ancestorId === 'string') {
      const { id, type } = getModelNavigationNodeIdAndType(ancestorId)
      ancestorId = id
    }
    return this.#modelBlockMap.get(ancestorId) as Mask
  }

  getAllModels(): Model[] {
    return Array.from(this.#modelMap.values())
  }

  getOriginalAllModels(): Model[] {
    return Array.from(this.#originalModelMap.values())
  }

  getAllBlocks(): ModelBlock[] {
    return Array.from(this.#modelBlockMap.values())
  }

  getAllModelBlocksForAModel(modelId: number): ModelBlock[] {
    const modelBlocks = [] as ModelBlock[]
    this.#modelBlockMap.forEach(block => {
      if (block.modelId === modelId) {
        modelBlocks.push(block)
      }
    })
    return modelBlocks
  }

  getAllModelBlocksForAModelWithoutDetailChildern(modelId: number): ModelBlock[] {
    const modelBlocks = [] as ModelBlock[]
    this.#modelBlockMap.forEach(block => {
      if (block.modelId === modelId) {
        const temp = this.deepClone(block)
        temp.detailedChildren = []
        modelBlocks.push(temp)
      }
    })
    return modelBlocks
  }

  deepClone(target: any): any {
    let result: any
    if (typeof target === 'object') {
      if (target === null) {
        result = target
      } else if (Array.isArray(target)) {
        result = []
        target.forEach(item => result.push(this.deepClone(item)))
      } else if (target instanceof Date) {
        result = new Date(target)
      } else if (target instanceof RegExp) {
        result = new RegExp(target)
      } else {
        if (wm.has(target)) {
          result = wm.get(target)
        } else {
          result = {}
          wm.set(target, result)
          for (let prop in target) {
            result[prop] = this.deepClone(target[prop])
          }
        }
      }
    } else {
      result = target
    }
    return result
  }

  getAllProductsForAModel(modelId: number): AnchorProductInterface[] {
    const products = [] as AnchorProductInterface[]
    this.#productMap.forEach(product => {
      product.modelId === modelId && products.push(product)
    })
    return products
  }

  getAllSimplifiedModelBlocksForAModel(modelId: number): SimplifiedModelBlock[] {
    const modelBlocks = [] as SimplifiedModelBlock[]
    this.#modelBlockMap.forEach(block => {
      block.modelId === modelId && modelBlocks.push(this.getSimplifiedModelBlockForView(block.id as number))
    })
    return modelBlocks
  }

  validateNewModelName(rule: any, modelId: number, newName: string, callback: (...args: any[]) => void) {
    if (this.checkNewModelName(modelId, newName)) {
      callback()
    }
    callback(new Error('与其他模型重名'))
    return
  }

  checkNewModelName(modelId: number, newName: string): boolean {
    const iterator = this.#modelMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      if (value.name === newName && value.id !== modelId) {
        return false
      }
      const newResult = iterator.next()
      value = newResult.value
      done = newResult.done
    }
    return true
  }

  validateNewModelBlockName(rule: any, modelBlockId: number, newName: string, callback: (...args: any[]) => void, modelId?:number) {
    if (this.checkNewModelBlockName(modelBlockId, newName, modelId)) {
      callback()
    }
    callback(new Error('与同模型的其他Mask/Block重名'))
  }

  checkNewModelBlockName(modelBlockId: number, newName: string, modelId?:number): boolean {
    const iterator = this.#modelBlockMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      const modelBlock = this.#modelBlockMap.get(modelBlockId)
      if (modelBlock) {
        const modelId = modelBlock?.modelId
        if (value.name === newName && value.modelId === modelId && value.id !== modelBlockId) {
          return false
        }
      } else {
        if (value.name === newName && value.modelId === modelId) {
          return false
        }
      }

      const newResult = iterator.next()
      value = newResult.value
      done = newResult.done
    }
    return true
  }

  validateNewPropertyName(rule: any, propertyId: string, modelBlockId: number, newName: string, callback: (...args: any[]) => void) {
    const checkResult = this.checkNewPropertyName(propertyId, modelBlockId, newName)
    if (checkResult > 0) {
      callback(new Error('与其他变量/序列/链接/方法重名'))
    }
    callback()
  }

  checkNewPropertyName(propertyId: string, modelBlockId: number, newName: string): number {
    const modelBlock = this.#modelBlockMap.get(modelBlockId)!
    try {
      Object.values(modelBlock.variables).forEach(variable => {
        if (variable.name === newName && variable.id !== propertyId) {
          throw new Error('property duplicate')
        }
      })
      Object.values(modelBlock.series).forEach(serie => {
        if (serie.name === newName && serie.id !== propertyId) {
          throw new Error('property duplicate')
        }
      })
      Object.values(modelBlock.links).forEach(link => {
        if (link.name === newName && link.id !== propertyId) {
          throw new Error('property duplicate')
        }
      })
      Object.values(modelBlock.methods).forEach(method => {
        if (method.name === newName && method.id !== propertyId) {
          throw new Error('property duplicate')
        }
      })
    } catch (e) {
      return 1
    }
    return 0
  }

  validateBlockBelongsToModel(blockId: number, modelId: number): boolean {
    const modelBlock = this.#modelBlockMap.get(blockId)!
    return !!modelBlock && modelBlock.modelId === modelId
  }

  validateBlockInheritedFromBlock(blockId: number, ancestorBlockId: number): boolean {
    const modelBlock = this.#modelBlockMap.get(blockId)!
    if (!modelBlock.parentId) return false
    const parentBlock = this.#modelBlockMap.get(modelBlock.parentId)!
    if (parentBlock.id === ancestorBlockId) return true
    if (!parentBlock.parentId) return false
    const mask = this.#modelBlockMap.get(parentBlock.parentId)!
    if (mask.id === ancestorBlockId) return true
    return false
  }

  getBreadcrumb(modelBlockId: number, selectedProperty: Property | null, formulaItemKey: string): string[] {
    const breadCrumb: string[] = []
    try {
      breadCrumb.unshift(formulaItemKey)
      if (selectedProperty) {
        breadCrumb.unshift(selectedProperty.name)
      }
      const modelBlock = this.#modelBlockMap.get(modelBlockId)!
      breadCrumb.unshift(modelBlock.name)
      // add each ancestor's name
      let parent: ModelBlock | undefined
      let currentModelNode = modelBlock
      if (currentModelNode.parentId) {
        parent = this.#modelBlockMap.get(currentModelNode.parentId)
      }
      while (parent) {
        breadCrumb.unshift(parent.name)
        currentModelNode = parent
        if (parent.parentId) {
          parent = this.#modelBlockMap.get(parent.parentId)
        } else {
          parent = undefined
        }
      }
      // add model name
      const currentModel = this.#modelMap.get(currentModelNode.modelId!)!
      breadCrumb.unshift(currentModel.name)
    } catch { }
    return breadCrumb
  }

  generateCopyModelName(modelID: number, modelName: string): string {
    let newModelBlockName = modelName
    const numberPostfix = parseStringPostfixNumber(modelName)
    const nameLen = modelName.length
    let postfixNumber = 1
    let namePrefix = ''
    if (nameLen === numberPostfix) {
      postfixNumber = 1
      namePrefix = modelName
    } else {
      postfixNumber = parseInt(modelName.substring(numberPostfix, nameLen)) + 1
      namePrefix = modelName.substring(0, numberPostfix)
    }
    newModelBlockName = namePrefix + postfixNumber.toString()
    while (!this.checkNewModelName(modelID, newModelBlockName)) {
      ++postfixNumber
      newModelBlockName = namePrefix + postfixNumber.toString()
    }
    return newModelBlockName
  }

  generateCopyBlockModelName(modelBlockID: number, blockModelName: string): string {
    let newBlockModelName = blockModelName
    const numberPostfix = parseStringPostfixNumber(blockModelName)
    const nameLen = blockModelName.length
    let postfixNumber = 1
    let namePrefix = ''
    if (nameLen === numberPostfix) {
      postfixNumber = 1
      namePrefix = blockModelName
    } else {
      postfixNumber = parseInt(blockModelName.substring(numberPostfix, nameLen)) + 1
      namePrefix = blockModelName.substring(0, numberPostfix)
    }
    newBlockModelName = namePrefix + postfixNumber.toString()
    while (!this.checkNewModelBlockName(modelBlockID, newBlockModelName)) {
      ++postfixNumber
      newBlockModelName = namePrefix + postfixNumber.toString()
    }
    return newBlockModelName
  }

  generateCopyPropertyName(propertyId: string, modelBlockID: number, propertyName: string): string {
    let newPropertyName = propertyName
    if (this.checkNewPropertyName(propertyId, modelBlockID, newPropertyName) === 0) {
      return newPropertyName
    }
    const numberPostfix = parseStringPostfixNumber(propertyName)

    const nameLen = propertyName.length
    let postfixNumber = 1
    let namePrefix = ''
    if (nameLen === numberPostfix) {
      postfixNumber = 1
      namePrefix = propertyName
    } else {
      postfixNumber = parseInt(propertyName.substring(numberPostfix, nameLen)) + 1
      namePrefix = propertyName.substring(0, numberPostfix)
    }
    newPropertyName = namePrefix + postfixNumber.toString()
    while (this.checkNewPropertyName(propertyId, modelBlockID, newPropertyName) > 0) {
      ++postfixNumber
      newPropertyName = namePrefix + postfixNumber.toString()
    }

    return newPropertyName
  }

  getDataMappingItemsForAModel(modelId: number): DataMappingItem[] {
    return this.getAllModelBlocksForAModel(modelId).reduce((dataMappingItems, modelBlock) => {
      if (modelBlock.copyType !== CopyTypeBlock.data) {
        Object.values(modelBlock.variables).forEach((variable: Variable) => {
          if (variable.id !== '0' && variable.isDefining && (variable.source === VariableSource.data)) { // VariableSource.data
            dataMappingItems.push({
              block: modelBlock.name,
              blockId: modelBlock.id,
              id: variable.id,
              name: variable.name,
              type: variable.type,
              required: true
            })
          }
        })
      }
      return dataMappingItems
    }, [] as DataMappingItem[])
  }

  getDataMappingItemsForABlock(blockId: number) {
    const modelBlock = this.#modelBlockMap.get(blockId)
    if (!modelBlock) return []
    const dataMappingItems: DataMappingItem[] = []
    Object.values(modelBlock.variables).forEach((variable: Variable) => {
      if (variable.id !== '0' && variable.isDefining && (variable.source === VariableSource.data)) { // VariableSource.data
        dataMappingItems.push({
          block: modelBlock.name,
          blockId: modelBlock.id,
          id: variable.id,
          name: variable.name,
          type: variable.type,
          required: true
        })
      }
    })
    return dataMappingItems
  }

  formulaChanged(newProperty: Property, oldProperty: Property): boolean {
    const propertyKeys = Object.keys(newProperty)
    const formulaOnlyKeys = [
      'calcFormula',
      'copyFormula',
      // 'modifiedAt',
      // 'valueInput',
      // 'creator',
      // 'classify',
      // 'discription'
      'copySizeFunctionLines',
      'initializeFormula',
      'finalizeFormula',
      'runAfterRebaseFormula',
      'rebaseBaseFunctionLines'
    ]
    let valueChanged = false
    try {
      propertyKeys.forEach(k => {
        if (newProperty[k] !== oldProperty[k]) {
          if (formulaOnlyKeys.findIndex(item => item === k) > -1) {
            valueChanged = true
            throw new Error('formula changed')
          }
        }
      })
    } catch (e) {
      return valueChanged
    }
    return valueChanged
  }

  headerChanged(newProperty: Property, oldProperty: Property): boolean {
    const propertyKeys = Object.keys(newProperty)
    const formulaOnlyKeys = [
      'calcFormula',
      'copyFormula',
      'modifiedAt',
      'valueInput',
      'creator',
      'classify',
      'discription',
      'target',
      'rebaseType',
      'allowManualResize',
      'copySizeFunctionLines',
      'initializeFormula',
      'finalizeFormula',
      'runAfterRebaseFormula',
      'rebaseBaseFunctionLines'
    ]
    let valueChanged = false
    try {
      propertyKeys.forEach(k => {
        if (newProperty[k] !== oldProperty[k]) {
          if (formulaOnlyKeys.findIndex(item => item === k) === -1) {
            valueChanged = true
            throw new Error('header changed')
          }
        }
      })
    } catch (e) {
      return valueChanged
    }
    if (getPropertyType(newProperty) === PropertyType.links) {
      if (newProperty.target.id !== oldProperty.target.id) {
        return true
      }
    }
    return valueChanged
  }

  generateBlockFormulaItem(blockName: string, blockId: number, key: string, content: string): FormulaTabItem | string {
    const breadcrumb = this.getBreadcrumb(blockId, null, key)
    return {
      name: blockName + '.' + key,
      content,
      key,
      id: this.getUniqueIdentificationFormula({
        modelId: this.getModelIdFormula(blockId),
        blockId,
        propertyId: '',
        key
      }),
      blockName: blockName,
      modelId: this.getModelIdFormula(blockId),
      blockId: blockId,
      propertyType: '',
      propertyId: '',
      unsaved: false,
      openTime: new Date().getTime(),
      readOnly: false,
      hasCalcFormula: true,
      breadcrumb: breadcrumb.length && breadcrumb.length !== 1 ? breadcrumb : [blockName],
      modifiedAt: new Date().getTime(),
      isCodeIndex: false
    }
  }

  getTargetMaskForLinkChain(linkChain: string[]): SimplifiedModelBlock | undefined {
    if (!linkChain || linkChain.length <= 0) return undefined
    const targetLinkInfo = linkChain[linkChain.length - 1]
    const targetMaskId = parseInt(targetLinkInfo.split('->')[1])
    return this.getSimplifiedModelBlockForView(targetMaskId)
  }

  getFormulaItemNameKeyAndContent(currentProperty: Property, formulas: string | undefined, currentModelNode: SimplifiedModel | SimplifiedModelBlock | undefined, formulasIndex: number) {
    let source
    let key = currentProperty?.key || 'calcFormula'
    let name = currentProperty!.name + '.' + key + ' (' + currentModelNode!.name + ')'
    let content = currentProperty[key]
    const type = getPropertyType(currentProperty)
    switch (type) {
      case PropertyType.links:
        source = LinkSource.codeIndex
        break
      case PropertyType.methods:
        source = MethodSource.codeIndex
        break
      case PropertyType.variables:
        source = VariableSource.codeIndex
        break
      default:
        source = SeriesSource.codeIndex
    }
    if (currentProperty.source === source) {
      key = 'productFormulas'
      name = currentProperty?.name + '.' + key + ` / ${formulasIndex + 1}` + ' (' + currentModelNode!.name + ')'
      content = formulas || ''
    }

    if (currentProperty.source === 'codeIndexFormula') {
      content = currentProperty.calcFormula
    }
    return {
      name,
      key,
      content
    }
  }

  getFormulaItemFormulasIndex(openedFormulaItems: FormulaTabItem[], currentProperty: Property): number {
    const oldFormulaItems = openedFormulaItems.find((formulaItems: FormulaTabItem) => formulaItems?.propertyId === currentProperty?.id)
    return oldFormulaItems?.formulasIndex || 0
  }

  getProductFormulas(currentProperty: Property, oldProperty: Property | any, formulasIndex: number) {
    const productFormulas = oldProperty.productFormulas
    productFormulas[formulasIndex] = currentProperty.productFormulas[formulasIndex]
    productFormulas[formulasIndex].unsaved = false
    return productFormulas
  }

  getModelBlockByMasterId(modelId: number): number[] {
    return Array.from(this.#modelBlockMap.values())
      .filter(block => block.productId === modelId)
      .map(block => block.id)
  }

  getUniqueIdentificationFormula(formula: Partial<FormulaTabItem>): string {
    return formula.modelId! + formula.propertyId! + formula.blockId + formula.key
  }

  getModelIdFormula(id: number): number {
    const block = this.#modelBlockMap.get(id)!
    if (block.modelId) return block.modelId
    block.parentId && this.getModelIdFormula(block.parentId)
    return id
  }
}

const defaultModelsDataSource = new ModelsDataSource()

export default defaultModelsDataSource
