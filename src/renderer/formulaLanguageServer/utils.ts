import type { LinkTarget } from '@shared/dataModelTypes/models/links'
import type { Model, ModelBlock, Property } from '@shared/dataModelTypes'
import { getPropertyType } from '@/utils'

export interface PropertyDependency {
  // all string are PropertyFingerPrintString
  referredProperties: Set<string>
  referringProperties: Set<string>
}
export interface WorkerMessage {
  action: string
  payload: any
}

// helper type for formula parsing
export interface PropertyForPropertyNameMap {
  id: string
  type: string
  target?: LinkTarget
}

export interface PropertyForFormulaParsing {
  id: string
  name: string
  type: string
  calcFormula: string
  modelBlockId: number
  modelBlockName: string
}

export const ACTION_ADD_PROPERTY_FOR_PARSING = 'AddPropertyForParsing'
export const ACTION_UPDATE_SYMBOL_MAP = 'UpdateSymbolMap'

export function isInstanceOfWorkerMessage(object: any): object is WorkerMessage {
  return typeof object.action === 'string' && 'payload' in object
}

export function getPropertiesForParse(property: Property, modelBlock: ModelBlock) :PropertyForFormulaParsing {
  return {
    id: property === undefined ? '' : property.id,
    name: property === undefined ? '' : property.name,
    type: getPropertyType(property === undefined ? {} as Property : property),
    calcFormula: property === undefined ? '' : property.calcFormula,
    modelBlockId: modelBlock.id as number,
    modelBlockName: modelBlock.name
  }
}

export function getAllPropertiesForFormulaParsingFromAModel(model: Model):
  PropertyForFormulaParsing[] {
  // took 0.1ms in worst case
  return model.detailedChildren.flatMap(modelBlock => {
    const allProperties = (Object.values(modelBlock.variables) as Property[])
      .concat(Object.values(modelBlock.series) as Property[])
      .concat(Object.values(modelBlock.methods) as Property[])
      .concat(Object.values(modelBlock.links) as Property[])
      .filter(property =>
        property.source === 'calculated' && property.calcFormula.trim()
      )
    return allProperties.map(property => getPropertiesForParse(property, modelBlock))
  })
}

export function generatePropertyNameMapForAModel(model: Model): Map<number, Map<string, PropertyForPropertyNameMap>> {
  const propertyNameMap = new Map<number, Map<string, PropertyForPropertyNameMap>>()
  model.detailedChildren.forEach(modelBlock => {
    propertyNameMap.set(modelBlock.id as number, new Map())
    const allProperties = (Object.values(modelBlock.variables) as Property[])
      .concat(Object.values(modelBlock.series) as Property[])
      .concat(Object.values(modelBlock.methods) as Property[])
      .concat(Object.values(modelBlock.links) as Property[])
    allProperties.forEach(property => {
      propertyNameMap.get(modelBlock.id as number)!.set(property.name, {
        id: property.id,
        type: getPropertyType(property),
        target: property.target
      })
    })
  })
  return propertyNameMap
}
