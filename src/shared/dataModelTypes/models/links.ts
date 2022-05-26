import { ProductFormula } from '../product/products'
import { LinkSource, LinkTargetType, TransmitData } from './helpers'
export interface LinkTarget {
  id: number
  type: LinkTargetType
  blockName: string
  maskName: string
}
export default interface Link {
  id: string
  override: boolean
  name: string
  description: string
  isDirect: boolean
  isDefining: boolean
  matchCopy: boolean
  valueInput: number
  transmit?: TransmitData[]
  source: LinkSource
  target: LinkTarget | undefined
  calcFormula: string
  modifiedAt: number | undefined
  creator: string | undefined
  classify: string | undefined
  productFormulas: ProductFormula[]
  currentIndexExpress: string
}

export interface dLink extends Link {
  original: string[]
}

export function createLink(id: string, creator?: string): Link {
  return {
    id,
    override: false,
    name: '',
    description: '',
    isDirect: true,
    isDefining: true,
    matchCopy: false,
    valueInput: 0,
    transmit: [],
    source: LinkSource.default,
    target: undefined,
    calcFormula: 'return linkBlock([blockName])(_setClusterValue([targetVariable], [value]));',
    modifiedAt: new Date().getTime(),
    creator: creator,
    classify: '',
    productFormulas: [],
    currentIndexExpress: ''
  }
}
export function createLinkDialog(form: any, creator?: string): Link {
  return {
    id: '0',
    override: form.override,
    name: form.name,
    description: form.description,
    isDirect: true,
    isDefining: true,
    matchCopy: form.matchCopy,
    valueInput: 0,
    transmit: [],
    source: form.source,
    target: form.target,
    calcFormula: 'return linkBlock([blockName])(_setClusterValue([targetVariable], [value]));',
    modifiedAt: new Date().getTime(),
    creator: creator,
    classify: form.classify,
    productFormulas: [],
    currentIndexExpress: ''
  }
}
