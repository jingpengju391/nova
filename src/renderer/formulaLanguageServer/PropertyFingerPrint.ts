import modelsDataSource from '../store/modules/modelsDataSource'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'

export interface LinkExpression {
  linkName: string
  blockSelectorIdentifiers: string[]
}

export function getLinkExpressionsString(expressions: LinkExpression[]): string {
  return JSON.stringify(expressions)
}

export function decodeLinkExpressionsFromString(s: string): LinkExpression[] {
  return JSON.parse(s)
}

export function generateFullLinkChainWithoutBlockSelector(expressions: LinkExpression[]): string {
  return expressions.map(exp => exp.linkName).join('->') + '->'
}
/**
 * @member {string} propertyId
 * @member {string} propertyName
 * @member {number} blockId: id of block that the property belongs
 * @member {string} linkExpression: NA for not linked property
 */
export default class PropertyFingerPrint {
  propertyId: string
  propertyName: string
  propertyType: string
  blockId: number
  linkExpression: string

  constructor(propertyId: string, propertyName: string, propertyType: string, blockId: number, linkExpression?: string) {
    this.propertyId = propertyId
    this.propertyName = propertyName
    this.propertyType = propertyType
    this.blockId = blockId
    this.linkExpression = linkExpression ?? 'NA'
  }
}

export const PropertyFPDelimiter = '@@'

export function generatePropertyFingerPrintString(fp: PropertyFingerPrint): string {
  // return fp.propertyId + PropertyFPDelimiter + fp.propertyName + PropertyFPDelimiter +
  //   fp.propertyType + PropertyFPDelimiter + fp.blockId + PropertyFPDelimiter + fp.linkExpression
  return fp.propertyId + PropertyFPDelimiter +
    fp.propertyType + PropertyFPDelimiter + fp.blockId + PropertyFPDelimiter + fp.linkExpression
}

export function decodePropertyFingerPrintString(fpString: string): PropertyFingerPrint | undefined {
  // const regexp = /^(?<propertyId>\w+)@@(?<propertyName>\w+)@@(?<propertyType>variables|series|links|methods)@@(?<blockId>\d+)@@(?<linkExpression>.+)$/
  // const match = fpString.match(regexp)!
  // if (match && match.groups && match.groups.propertyId && match.groups.propertyName &&
  //   match.groups.propertyType && match.groups.blockId && match.groups.linkExpression) {
  //   const blockId = parseInt(match.groups.blockId)
  //   return new PropertyFingerPrint(
  //     match.groups.propertyId,
  //     // match.groups.propertyName,
  //     modelsDataSource.getProperty(match.groups.propertyId, match.groups.propertyType as PropertyType, blockId).name,
  //     match.groups.propertyType,
  //     blockId,
  //     match.groups.linkExpression
  //   )
  // }
  const regexp = /^(?<propertyId>(\w|-)+)@@(?<propertyType>variables|series|links|methods)@@(?<blockId>\d+)@@(?<linkExpression>.+)$/
  const match = fpString.match(regexp)!
  if (match && match.groups && match.groups.propertyId &&
    match.groups.propertyType && match.groups.blockId && match.groups.linkExpression) {
    const blockId = parseInt(match.groups.blockId)
    return new PropertyFingerPrint(
      match.groups.propertyId,
      // match.groups.propertyName,
      modelsDataSource.getProperty(match.groups.propertyId, match.groups.propertyType as PropertyType, blockId)?.name,
      match.groups.propertyType,
      blockId,
      match.groups.linkExpression
    )
  }
}

export function decodePropertyFingerPrintStringIdOnly(fpString: string): PropertyFingerPrint | undefined {
  // const regexp = /^(?<propertyId>\w+)@@(?<propertyName>\w+)@@(?<propertyType>variables|series|links|methods)@@(?<blockId>\d+)@@(?<linkExpression>.+)$/
  // const match = fpString.match(regexp)!
  // if (match && match.groups && match.groups.propertyId && match.groups.propertyName &&
  //   match.groups.propertyType && match.groups.blockId && match.groups.linkExpression) {
  //   const blockId = parseInt(match.groups.blockId)
  //   return new PropertyFingerPrint(
  //     match.groups.propertyId,
  //     // match.groups.propertyName,
  //     modelsDataSource.getProperty(match.groups.propertyId, match.groups.propertyType as PropertyType, blockId).name,
  //     match.groups.propertyType,
  //     blockId,
  //     match.groups.linkExpression
  //   )
  // }
  const regexp = /^(?<propertyId>(\w|-)+)@@(?<propertyType>variables|series|links|methods)@@(?<blockId>\d+)@@(?<linkExpression>.+)$/
  const match = fpString.match(regexp)!
  if (match && match.groups && match.groups.propertyId &&
    match.groups.propertyType && match.groups.blockId && match.groups.linkExpression) {
    const blockId = parseInt(match.groups.blockId)
    return new PropertyFingerPrint(
      match.groups.propertyId,
      // match.groups.propertyName,
      'NA',
      match.groups.propertyType,
      blockId,
      match.groups.linkExpression
    )
  }
}
