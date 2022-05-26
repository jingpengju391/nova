import { ProductFormula } from '../product/products'
import { MethodReturnType } from './helpers'

export interface MethodArgument {
  name: string
  type: string
}

export enum MethodSource {
  parent = 'parent',
  codeIndex = 'codeIndex',
  calculated = 'calculated'
}

export default interface Method {
  id: string
  override: boolean
  name: string
  description: string
  isDirect: boolean
  isDefining: boolean
  returnType: MethodReturnType
  // parameter: MethodArgument[]
  parameter: string
  calcFormula: string
  modifiedAt: number | undefined
  creator: string | undefined
  classify: string | undefined
  currentIndexExpress: string,
  productFormulas: ProductFormula[],
  source: MethodSource
}

export interface dMethod extends Method {
  original: string[]
}

export function createMethod(id: string, creator?: string): Method {
  return {
    id: id,
    override: false,
    name: '',
    description: '',
    isDirect: true,
    isDefining: true,
    returnType: MethodReturnType.long,
    parameter: 'long&a,long&b',
    calcFormula: 'return a + b;',
    modifiedAt: new Date().getTime(),
    creator: creator,
    classify: '',
    currentIndexExpress: '',
    productFormulas: [],
    source: MethodSource.calculated
  }
}
export function createMethodDialog(form: any, creator?: string): Method {
  return {
    id: '0',
    override: form.override,
    name: form.name,
    description: form.description,
    isDirect: true,
    isDefining: true,
    returnType: form.returnType,
    parameter: form.parameter,
    calcFormula: 'return a + b;',
    modifiedAt: new Date().getTime(),
    creator: creator,
    classify: form.classify,
    currentIndexExpress: '',
    productFormulas: [],
    source: form.source
  }
}
