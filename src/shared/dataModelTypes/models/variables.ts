import { ProductFormula } from '../product/products'
import { VariableType, CopyType, VariableSource } from './helpers'
export default interface Variable {
  id: string
  override: boolean
  name: string
  description: string
  isDirect: boolean
  isDefining: boolean
  allowManualResize: boolean
  type: VariableType
  valueType: VariableType | undefined
  valueInput: string
  copyType: CopyType
  copySize: number
  copyFormula: string
  source: VariableSource
  calcFormula: string
  rebaseType: number
  assumptionBind: { pageID: number; variableID?: string | number } | undefined
  modifiedAt: number | undefined
  creator: string | undefined
  classify: string | undefined
  productFormulas: ProductFormula[],
  currentIndexExpress: string
}

export interface dVariable extends Variable {
  original: string[]
}

export function createVariable(id: string, creator?: string): Variable {
  return {
    id,
    override: false,
    name: '',
    description: '',
    isDirect: true,
    isDefining: true,
    allowManualResize: false,
    type: VariableType.integer,
    valueType: undefined,
    valueInput: '',
    copyType: CopyType.no,
    copySize: 1,
    copyFormula: 'return 0;\n',
    source: VariableSource.default,
    calcFormula: 'return 0;\n',
    assumptionBind: undefined,
    rebaseType: 0,
    modifiedAt: new Date().getTime(),
    creator: creator,
    classify: '',
    productFormulas: [],
    currentIndexExpress: ''
  }
}
export function createVariableDialog(form: any, creator?: string): Variable {
  return {
    id: '0',
    override: form.override,
    name: form.name,
    description: form.description,
    isDirect: true,
    isDefining: form.isDefining,
    allowManualResize: false,
    type: form.type,
    valueType: undefined,
    valueInput: form.valueInput,
    copyType: form.copyType,
    copySize: 1,
    copyFormula: 'return 0;',
    source: form.source,
    calcFormula: form.type === VariableType.integer || form.type === VariableType.double ? 'return 0;' : 'return "";',
    assumptionBind: undefined,
    rebaseType: form.rebaseType,
    modifiedAt: new Date().getTime(),
    creator: creator,
    classify: form.classify,
    productFormulas: [],
    currentIndexExpress: ''
  }
}
