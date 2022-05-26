import { Model, ModelBlock, Property } from '@shared/dataModelTypes'
import { generateFormattedTimeString } from '@shared/commonUtils'
import LanguageServerWorker from './worker?worker'
import {
  PropertyDependency, isInstanceOfWorkerMessage,
  ACTION_ADD_PROPERTY_FOR_PARSING, ACTION_UPDATE_SYMBOL_MAP,
  PropertyForFormulaParsing, PropertyForPropertyNameMap, getAllPropertiesForFormulaParsingFromAModel,
  generatePropertyNameMapForAModel, getPropertiesForParse
} from './utils'
import { ElNotification } from 'element-plus'
import { ITerminable, terminate } from '@shared/terminable'
import PropertyFingerPrint, { decodePropertyFingerPrintStringIdOnly, generatePropertyFingerPrintString } from './PropertyFingerPrint'

class LanguageServerNodeWorker extends Worker implements ITerminable {
}

class LanguageServerNode {
  id: number
  worker: LanguageServerNodeWorker
  currentParsingModelId: number
  profiling: { startTime: number, endTime: number }

  constructor(id: number) {
    this.id = id
    this.worker = new LanguageServerWorker()
    this.currentParsingModelId = 0
    this.profiling = { startTime: 0, endTime: 0 }
  }

  terminate() {
    this.worker.terminate()
  }

  startProfiling() {
    this.profiling.startTime = performance.now()
  }

  terminateProfiling() {
    this.profiling.endTime = performance.now()
  }

  get duration(): string {
    const milliSeconds = this.profiling.endTime - this.profiling.startTime
    return generateFormattedTimeString(milliSeconds)
  }
}

export class LanguageServer implements ITerminable {
  // map key is modelId
  #modelAndSymbolMap: Map<number, Map<string, PropertyDependency>>

  #nodePool: LanguageServerNode[]
  #updateNode: LanguageServerNode
  #completedNodeCount: number
  #maxNodeCounts: number
  #propertiesTotalLength: number

  #currentParsingModel: Model | undefined
  #modelsToParse: Model[]
  #modelsToUpdate: Model[]
  /** contains only properties for current parsing model */
  #propertiesToParse: PropertyForFormulaParsing[]
  #propertiesToUpdate: PropertyForFormulaParsing[][]
  /** three data structures to help find symbols for current parsing model */
  // #blockNameIdMap: Map<string, number>
  // remove blockNameIdMap
  /** key is the id of parent, value is the ids of its children */
  #parentChildIdMap: Map<number, number[]>
  /** first key of string is the  block name, second key of string is the property name */
  #propertyNameMap: Map<number, Map<string, PropertyForPropertyNameMap>>

  #profiling: { startTime: number, endTime: number }
  #nodeWorking: boolean

  constructor() {
    this.#modelAndSymbolMap = new Map()
    this.#nodePool = []
    this.#completedNodeCount = 0
    this.#propertiesTotalLength = 0
    this.#modelsToParse = []
    this.#modelsToUpdate = []

    this.#propertiesToParse = []
    this.#propertiesToUpdate = []
    // this.#blockNameIdMap = new Map()
    // remove blockNameIdMap
    this.#parentChildIdMap = new Map()
    this.#propertyNameMap = new Map()
    this.#profiling = { startTime: 0, endTime: 0 }

    // TODO: need a more reliable way to get the available worker count
    this.#maxNodeCounts = navigator?.hardwareConcurrency ? navigator.hardwareConcurrency - 2 : 2
    // this.#maxNodeCounts = 1
    for (let i = 0; i < this.#maxNodeCounts; i++) {
      const node = new LanguageServerNode(i)
      node.worker.onmessage = event => {
        this.#receiveWorkerMessage(node, event)
      }
      this.#nodePool.push(node)
    }
    const updateNode = new LanguageServerNode(this.#maxNodeCounts)
    updateNode.worker.onmessage = event => {
      this.#receiveUpdateWorkerMessage(updateNode, event)
    }
    this.#updateNode = updateNode
    this.#nodeWorking = false
  }

  /**
   *
   * @param models: model.detailedChildren must have all its modelBlocks
   */
  addModelsForParsing(models: Model[]) {
    if (models.length <= 0) return
    this.#nodeWorking = true
    this.#modelsToParse = models.reverse()
    const model = this.#modelsToParse.pop()!
    this.#startParsingModel(model)
  }

  addModelForParsing(model: Model) {
    if (this.#nodeWorking) {
      this.#modelsToParse.push(model)
    } else {
      this.#nodeWorking = true
      for (let i = 0; i < this.#maxNodeCounts; i++) {
        const node = new LanguageServerNode(i)
        node.worker.onmessage = event => {
          this.#receiveWorkerMessage(node, event)
        }
        this.#nodePool.push(node)
      }
      this.#startParsingModel(model)
    }
  }

  updateCodeForParsing(model: Model, fp: string, updatedProperty: Property, updatedBlock: ModelBlock) {
    this.#modelsToUpdate.unshift(model)
    const perpertiesToUpdate = this.getPropertyToUpdateWhenChodeChange(model.id as number, fp, updatedProperty, updatedBlock)
    this.#propertiesToUpdate.unshift(perpertiesToUpdate)
    if (!this.#nodeWorking) {
      this.#startUpdateModel(this.#modelsToUpdate.pop()!)
    }
  }

  /**
   *
   * Get all properties whose calcFormulas use the property which is identified by @param fp
   * @returns
   */
  getReferredProperties(modelId: number, fp: string): string[] {
    const symbolMap = this.#modelAndSymbolMap.get(modelId)!
    if (symbolMap === undefined) return []
    return [...symbolMap.get(fp)?.referredProperties ?? []]
  }

  /**
   *
   * Get all properties that used inside the calcFormula of the property which is identified by @param fp
   * @returns
   */
  getReferringProperties(modelId: number, fp: string): string[] {
    const symbolMap = this.#modelAndSymbolMap.get(modelId)!
    if (symbolMap === undefined) return []
    return [...symbolMap.get(fp)?.referringProperties ?? []]
  }

  /**
   *
   * Get all properties whose need update which is identified by @param modelId, @param fp, @param updatedProperty, @param updatedBlock
   * @returns
   */
  getPropertyToUpdateWhenChodeChange(modelId: number, fp: string, updatedProperty: Property, updatedBlock: ModelBlock): PropertyForFormulaParsing[] {
    const symbolMap = this.#modelAndSymbolMap.get(modelId)!
    if (!symbolMap) return []
    const propertyDep = symbolMap.get(fp)
    const perpertiesToUpdate: PropertyForFormulaParsing[] = []
    if (propertyDep) {
      const refferringProperties = propertyDep.referringProperties

      refferringProperties.forEach((refferringProperty: string) => {
        const referringPropertyFP = decodePropertyFingerPrintStringIdOnly(refferringProperty)
        const deleteRefferedProperty = (blockId: number) => {
          const newPropertyFPStringWithoutLinkInfo = generatePropertyFingerPrintString(new PropertyFingerPrint(
            referringPropertyFP?.propertyId as string, referringPropertyFP?.propertyName as string, referringPropertyFP?.propertyType as string, blockId
          ))
          let currentDep: PropertyDependency | undefined = symbolMap.get(newPropertyFPStringWithoutLinkInfo)
          if (currentDep) {
            currentDep.referredProperties.delete(fp)
            // const block = modelsDataSource.getCompleteModelBlock(blockId)
            // const propertyType = referringPropertyFP?.propertyType as PropertyType
            // const depProperty = block[propertyType][referringPropertyFP?.propertyId as string]
            // perpertiesToUpdate.push(getPropertiesForParse(depProperty, block))
          }
        }
        deleteRefferedProperty(referringPropertyFP?.blockId as number)
        const linkExpressionString = referringPropertyFP?.linkExpression === 'NA' ? undefined : referringPropertyFP?.linkExpression
        if (linkExpressionString) {
          const blockIds = this.#parentChildIdMap.get(referringPropertyFP?.blockId as number)
          blockIds?.forEach(blockId => {
            deleteRefferedProperty(blockId)
            const childBlockIds = this.#parentChildIdMap.get(blockId)
            childBlockIds?.forEach(childBlockId => deleteRefferedProperty(childBlockId))
          })
        }
      })
      refferringProperties.clear()
    }
    perpertiesToUpdate.push(getPropertiesForParse(updatedProperty, updatedBlock))
    return perpertiesToUpdate
  }
  /**
   *
   * Get all properties who's deleted which is identified by @param modelId, @param fp, @param propertyId
   * @returns
   */

  getPropertyToUpdateWhenDeleted(modelId: number, fp: string) {
    const symbolMap = this.#modelAndSymbolMap.get(modelId)!
    const propertyDep = symbolMap.get(fp)
    if (propertyDep) {
      const refferringProperties = propertyDep.referringProperties
      const refferredProperties = propertyDep.referredProperties
      refferringProperties.forEach((refferringProperty: string) => {
        const referringPropertyFP = decodePropertyFingerPrintStringIdOnly(refferringProperty)
        const deleteRefferedProperty = (blockId: number) => {
          const newPropertyFPStringWithoutLinkInfo = generatePropertyFingerPrintString(new PropertyFingerPrint(
            referringPropertyFP?.propertyId as string, referringPropertyFP?.propertyName as string, referringPropertyFP?.propertyType as string, blockId
          ))
          let currentDep: PropertyDependency | undefined = symbolMap.get(newPropertyFPStringWithoutLinkInfo)
          if (currentDep) {
            currentDep.referredProperties.delete(fp)
          }
        }
        deleteRefferedProperty(referringPropertyFP?.blockId as number)
        const linkExpressionString = referringPropertyFP?.linkExpression === 'NA' ? undefined : referringPropertyFP?.linkExpression
        if (linkExpressionString) {
          const blockIds = this.#parentChildIdMap.get(referringPropertyFP?.blockId as number)
          blockIds?.forEach(blockId => {
            deleteRefferedProperty(blockId)
            const childBlockIds = this.#parentChildIdMap.get(blockId)
            childBlockIds?.forEach(childBlockId => deleteRefferedProperty(childBlockId))
          })
        }
      })
      const thisProperty = decodePropertyFingerPrintStringIdOnly(fp)
      refferredProperties.forEach((refferredProperty: string) => {
        const refferredPropertyFP = decodePropertyFingerPrintStringIdOnly(refferredProperty)
        const deleteRefferringProperty = (blockId: number) => {
          const newPropertyFPStringWithoutLinkInfo = generatePropertyFingerPrintString(new PropertyFingerPrint(
            refferredPropertyFP?.propertyId as string, refferredPropertyFP?.propertyName as string, refferredPropertyFP?.propertyType as string, blockId
          ))
          let currentDep: PropertyDependency | undefined = symbolMap.get(newPropertyFPStringWithoutLinkInfo)
          if (currentDep) {
            const refferringToDelete: string[] = []
            currentDep.referringProperties.forEach((refferringProperty: string) => {
              const referringPropertyFP = decodePropertyFingerPrintStringIdOnly(refferringProperty)
              if (referringPropertyFP?.propertyId === thisProperty?.propertyId && referringPropertyFP?.blockId === thisProperty?.blockId) {
                refferringToDelete.push(refferringProperty)
              }
            })
            refferringToDelete.forEach((item) => {
              currentDep?.referringProperties.delete(item)
            })
          }
        }
        deleteRefferringProperty(refferredPropertyFP?.blockId as number)
        const linkExpressionString = refferredPropertyFP?.linkExpression === 'NA' ? undefined : refferredPropertyFP?.linkExpression
        if (linkExpressionString) {
          const blockIds = this.#parentChildIdMap.get(refferredPropertyFP?.blockId as number)
          blockIds?.forEach(blockId => {
            deleteRefferringProperty(blockId)
            const childBlockIds = this.#parentChildIdMap.get(blockId)
            childBlockIds?.forEach(childBlockId => deleteRefferringProperty(childBlockId))
          })
        }
      })
      symbolMap.delete(fp)
    }
    this.#currentParsingModel = undefined
  }

  getPropertyToUpdateWhenRenamed(modelId: number, fp: string) {
    this.#currentParsingModel = undefined
  }
  /**
   *
   * Get all properties whose need update which is identified by @param newProperty, @param modelBlock
   * @returns
   */

  getPropertyToUpdateWhenAddProperty(newProperty: Property, modelBlock: ModelBlock): PropertyForFormulaParsing[] {
    return [getPropertiesForParse(newProperty, modelBlock)]
  }

  PropertyToUpdateWhenAddProperty(model: Model) {
    this.#startUpdateModel(model)
  }

  terminate() {
    terminate(this.#nodePool)
    this.#nodePool = []
  }

  #startProfiling() {
    this.#profiling.startTime = performance.now()
  }

  #terminateProfiling() {
    this.#profiling.endTime = performance.now()
  }

  #getProfiling(): string {
    const milliSeconds = this.#profiling.endTime - this.#profiling.startTime
    return generateFormattedTimeString(milliSeconds)
  }

  #startParsingModel(model: Model) {
    this.#startProfiling()
    this.#currentParsingModel = model
    this.#findSymbolsForModel(model)
    const idleWorkersCount = this.#nodePool.length
    const propertyPerWorker = this.#propertiesTotalLength / this.#maxNodeCounts
    for (let i = 0; i < idleWorkersCount; i++) {
      const node = this.#nodePool.pop()!
      const properties = []
      while (properties.length < propertyPerWorker) {
        const property = this.#propertiesToParse.pop()
        if (!property) break
        properties.push(property)
      }
      // if (properties.length === 0) break
      node.currentParsingModelId = model.id as number
      node.worker.postMessage({
        action: ACTION_ADD_PROPERTY_FOR_PARSING,
        payload: {
          properties: properties,
          // blockNameIdMap: this.#blockNameIdMap,
          // remove blockNameIdMap
          parentChildIdMap: this.#parentChildIdMap,
          propertyNameMap: this.#propertyNameMap
        }
      })
    }
  }

  #startUpdateModel(model: Model) {
    // if (this.#currentParsingModel === undefined || this.#currentParsingModel?.id !== model.id) {
    this.#currentParsingModel = model
    this.#updateSymbolsForModel(model)
    // }
    const propertiesToParse = this.#propertiesToUpdate.pop()
    this.#propertiesToParse = propertiesToParse === undefined ? [] : propertiesToParse
    this.#propertiesTotalLength = this.#propertiesToParse.length
    const node = this.#updateNode
    const properties = []
    while (this.#propertiesToParse.length) {
      const property = this.#propertiesToParse.pop()
      if (!property) break
      properties.push(property)
    }
    if (properties.length === 0) return
    node.currentParsingModelId = model.id as number
    node.worker.postMessage({
      action: ACTION_ADD_PROPERTY_FOR_PARSING,
      payload: {
        properties: properties,
        // blockNameIdMap: this.#blockNameIdMap,
        // remove blockNameIdMap
        parentChildIdMap: this.#parentChildIdMap,
        propertyNameMap: this.#propertyNameMap
      }
    })
  }

  #handleParsingCompleted() {
    setTimeout(() => {
      this.#completedNodeCount = 0
      terminate(this.#nodePool)
      this.#nodePool.length = 0
    }, 1000)
  }

  #findSymbolsForModel(model: Model) {
    this.#modelAndSymbolMap.set(model.id as number, new Map())
    this.#clearSymbolFindingHelpers()
    this.#propertiesToParse = getAllPropertiesForFormulaParsingFromAModel(model)
    this.#propertiesTotalLength = this.#propertiesToParse.length
    this.#propertyNameMap = generatePropertyNameMapForAModel(model)
    model.detailedChildren.forEach(modelBlock => {
      // this.#blockNameIdMap.set(modelBlock.name, modelBlock.id as number)
      // remove blockNameIdMap
      this.#parentChildIdMap.set(modelBlock.id as number, [])
      if (modelBlock.parentId) {
        this.#parentChildIdMap.get(modelBlock.parentId)!.push(modelBlock.id as number)
      }
    })
  }

  #updateSymbolsForModel(model: Model) {
    if (!this.#modelAndSymbolMap.has(model.id as number)) {
      this.#modelAndSymbolMap.set(model.id as number, new Map())
    }
    this.#clearSymbolFindingHelpers()
    this.#propertyNameMap = generatePropertyNameMapForAModel(model)
    model.detailedChildren.forEach(modelBlock => {
      // this.#blockNameIdMap.set(modelBlock.name, modelBlock.id as number)
      // remove blockNameIdMap
      this.#parentChildIdMap.set(modelBlock.id as number, [])
      if (modelBlock.parentId && modelBlock.parentId !== null) {
        const parentModelBlock = this.#parentChildIdMap.get(modelBlock.parentId)
        parentModelBlock && parentModelBlock.push(modelBlock.id as number)
      }
    })
  }

  #clearSymbolFindingHelpers() {
    this.#propertiesToParse = []
    // this.#blockNameIdMap.clear()
    // remove blockNameIdMap
    this.#parentChildIdMap.clear()
    this.#propertyNameMap.clear()
  }

  #receiveWorkerMessage(node: LanguageServerNode, event: MessageEvent<any>) {
    if (isInstanceOfWorkerMessage(event.data)) {
      const newPropertiesToParse = []
      const propertyPerWorker = this.#propertiesTotalLength / this.#maxNodeCounts
      switch (event.data.action) {
        case ACTION_UPDATE_SYMBOL_MAP:
          this.#mergeSymbolMapForModel(node.currentParsingModelId, event.data.payload)
          while (newPropertiesToParse.length < propertyPerWorker) {
            // eslint-disable-next-line no-case-declarations
            const newPropertyToParse = this.#propertiesToParse.pop()
            if (!newPropertyToParse) break
            newPropertiesToParse.push(newPropertyToParse)
          }
          if (newPropertiesToParse.length) {
            if (node.currentParsingModelId === this.#currentParsingModel!.id) {
              node.worker.postMessage({
                action: ACTION_ADD_PROPERTY_FOR_PARSING,
                payload: {
                  properties: newPropertiesToParse
                }
              })
            } else {
              node.currentParsingModelId = this.#currentParsingModel!.id as number
              node.worker.postMessage({
                action: ACTION_ADD_PROPERTY_FOR_PARSING,
                payload: {
                  properties: newPropertiesToParse,
                  // blockNameIdMap: this.#blockNameIdMap,
                  // remove blockNameIdMap
                  parentChildIdMap: this.#parentChildIdMap,
                  propertyNameMap: this.#propertyNameMap
                }
              })
            }
          } else {
            this.#nodePool.push(node)
            this.#completedNodeCount++
            if (this.#completedNodeCount === this.#maxNodeCounts) {
              this.#completedNodeCount = this.#completedNodeCount - this.#maxNodeCounts
              this.#terminateProfiling()
              ElNotification({
                title: '依赖关系解析完毕',
                message: `${this.#currentParsingModel!.name} parsing completed in ${this.#getProfiling()}.`,
                type: 'info'
              })
              const model = this.#modelsToParse.pop()
              if (model) {
                this.#startParsingModel(model)
              } else if (this.#modelsToUpdate.length) {
                this.#handleParsingCompleted()
                const modelUpdate = this.#modelsToUpdate.pop()
                if (modelUpdate) this.#startUpdateModel(modelUpdate)
              } else {
                this.#handleParsingCompleted()
                this.#nodeWorking = false
              }
            }
          }
          break
        default:
      }
    }
  }

  #receiveUpdateWorkerMessage(node: LanguageServerNode, event: MessageEvent<any>) {
    if (isInstanceOfWorkerMessage(event.data)) {
      const newPropertiesToParse: PropertyForFormulaParsing[] = []
      switch (event.data.action) {
        case ACTION_UPDATE_SYMBOL_MAP:
          this.#mergeSymbolMapForModel(node.currentParsingModelId, event.data.payload)
          while (this.#propertiesToParse.length) {
            // eslint-disable-next-line no-case-declarations
            const newPropertyToParse = this.#propertiesToParse.pop()
            if (!newPropertyToParse) break
            newPropertiesToParse.push(newPropertyToParse)
          }
          if (newPropertiesToParse.length) {
            if (node.currentParsingModelId === this.#currentParsingModel!.id) {
              node.worker.postMessage({
                action: ACTION_ADD_PROPERTY_FOR_PARSING,
                payload: {
                  properties: newPropertiesToParse
                }
              })
            } else {
              node.currentParsingModelId = this.#currentParsingModel!.id as number
              node.worker.postMessage({
                action: ACTION_ADD_PROPERTY_FOR_PARSING,
                payload: {
                  properties: newPropertiesToParse,
                  // blockNameIdMap: this.#blockNameIdMap,
                  // remove blockNameIdMap
                  parentChildIdMap: this.#parentChildIdMap,
                  propertyNameMap: this.#propertyNameMap
                }
              })
            }
          } else {
            const model = this.#modelsToUpdate.pop()
            if (model) {
              this.#startUpdateModel(model)
            } else {
              this.#nodeWorking = false
            }
          }
          break
        default:
      }
    }
  }

  #mergeSymbolMapForModel(modelId: number, symbolMapToMerge: Map<string, PropertyDependency>) {
    const symbolMap = this.#modelAndSymbolMap.get(modelId)!
    symbolMapToMerge.forEach((propertyDependency, fpString) => {
      const existingPropertyDependency = symbolMap.get(fpString)
      if (!existingPropertyDependency) {
        symbolMap.set(fpString, propertyDependency)
      } else {
        propertyDependency.referredProperties.forEach(referredProperty => {
          existingPropertyDependency.referredProperties.add(referredProperty)
        })
        propertyDependency.referringProperties.forEach(referringProperty => {
          existingPropertyDependency.referringProperties.add(referringProperty)
        })
      }
    })
  }
}

const defaultLanguageServer = new LanguageServer()

export default defaultLanguageServer
