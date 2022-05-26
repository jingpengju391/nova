/* eslint-disable no-unused-vars */
import Block from './blocks'
import Mask from './masks'
import { Property, Variable, Series, Link, Method } from '..'
import { AnchorProduct } from '../product/products'

export enum PropertyType {
  variables = 'variables',
  series = 'series',
  links = 'links',
  methods = 'methods'
}

export enum VariableType {
  integer = 'integer',
  double = 'double',
  string = 'string',
  table = 'table'
}

export enum CopyType {
  no = 'no',
  fixed = 'fixed',
  dynamic = 'dynamic'
}

export enum CopyTypeBlock {
  no = 'no',
  fixed = 'fixed',
  dynamic = 'dynamic',
  data = 'data'
}

export enum RebaseNeededType {
  no = 'no',
  yes = 'yes'
}

export enum VariableSource {
  parent = 'parent',
  default = 'default',
  data = 'data',
  assumption = 'assumption',
  toDefine = 'toDefine',
  calculated = 'calculated',
  codeIndex = 'codeIndex',
  codeIndexFormula = 'codeIndexFormula'
}

export enum SeriesSource {
  parent = 'parent',
  toDefine = 'toDefine',
  calculated = 'calculated',
  codeIndex = 'codeIndex',
  codeIndexFormula = 'codeIndexFormula'
}

export enum LinkSource {
  parent = 'parent',
  toDefine = 'toDefine',
  default = 'default',
  calculated = 'calculated',
  transmit = 'transmit',
  codeIndex = 'codeIndex',
  codeIndexFormula = 'codeIndexFormula'
}

export enum MethodSource {
  parent = 'parent',
  toDefine = 'toDefine',
  calculated = 'calculated',
  codeIndex = 'codeIndex',
  codeIndexFormula = 'codeIndexFormula'
}

export enum LinkTargetType {
  mask = 'mask',
  block = 'block'
}

export enum MethodReturnType {
  long = 'long'
}

export interface Collapses {
  title: string
  icon: string
  value: string
  component?:any
}

export interface TransmitColumn {
  prop?: string
  label?: string
  minWidth?: string
  type?: string
  hideOverflowTooltip?:boolean
}

export interface TransmitData {
  label: string // varibleID
  type: number
  value: string | number// varibleID or constant value
  id: string
}

export interface TransmitType {
  label: string
  value: number
}

export interface TransmitOptions {
  type: TransmitType[]
  label: TransmitData[]
  value: TransmitData[]
}

export function createInheritedProperty(propertyType: PropertyType, propertyID: string,
  ancestor: Mask | Block, anchorProduct?: AnchorProduct): Property {
  let isDefining = false
  const parentProperty: Variable | Series | Link | Method = ancestor[propertyType][propertyID] as Variable | Series | Link
  let source: string | undefined = parentProperty.source
  let calcFormula = parentProperty.calcFormula
  let currentIndexExpress = parentProperty.currentIndexExpress
  if (anchorProduct) {
    if (source === 'codeIndex' || source === 'codeIndexFormula') {
      isDefining = true
      const targetFormula = anchorProduct.getProductFormula(parentProperty.productFormulas)
      calcFormula = targetFormula.formula
      currentIndexExpress = targetFormula.codeIndexExpression
      if (calcFormula.length === 0) {
        // todo if we should reserve parentProperty.calcFormula as default
      }
      source = 'codeIndexFormula'
    } else {
      source = 'parent'
    }
  } else {
    if (source && source === 'toDefine') {
      isDefining = true
      source = 'calculated'
    } else if (source && source !== 'toDefine') {
      isDefining = false
      source = 'parent'
    }
  }

  const newProperty = {
    ...parentProperty,
    productFormulas: [],
    override: false,
    isDirect: false,
    isDefining,
    calcFormula,
    currentIndexExpress
  } as any

  if (source) { newProperty.source = source }

  return newProperty
}
