import { ProductFormula } from '../product/products'
import { CopyType, SeriesSource } from './helpers'

export default interface Series {
  id: string
  override: boolean
  name: string
  description: string
  isDirect: boolean
  isDefining: boolean
  valueInput: number
  copyType: CopyType
  copySize: number
  copyFormula: string
  isAutoSum: boolean
  allowManualResize: boolean
  autoSumLevel: number
  source: SeriesSource
  calcFormula: string
  rebaseType: number
  returnPeerModelValueBfRebase: boolean
  modifiedAt: number | undefined
  creator: string | undefined
  slidingWindow: boolean
  slidingWindowChunks: number
  classify: string | undefined
  productFormulas: ProductFormula[],
  currentIndexExpress: string
}

export interface dSeries extends Series {
  original: string[]
}

export function createSeries(id: string, creator?: string): Series {
  return {
    id,
    override: false,
    name: '',
    description: '',
    isDirect: true,
    isDefining: true,
    valueInput: 0,
    copyType: CopyType.no,
    copySize: 1,
    copyFormula: 'return 0;\n',
    isAutoSum: false,
    allowManualResize: false,
    autoSumLevel: 0,
    source: SeriesSource.calculated,
    calcFormula: 'return 0;\n',
    rebaseType: 1,
    returnPeerModelValueBfRebase: true,
    modifiedAt: new Date().getTime(),
    creator: creator,
    slidingWindow: false,
    slidingWindowChunks: 1,
    classify: '',
    productFormulas: [],
    currentIndexExpress: ''
  }
}
export function createSeriesDiaLog(form: any, creator?: string): Series {
  return {
    id: '0',
    override: form.override,
    name: form.name,
    description: form.description,
    isDirect: true,
    isDefining: form.isDefining,
    valueInput: form.valueInput,
    copyType: form.copyType,
    copySize: 1,
    copyFormula: 'return 0;\n',
    isAutoSum: form.isAutoSum,
    allowManualResize: false,
    autoSumLevel: form.autoSumLevel,
    source: form.source,
    calcFormula: 'return 0;\n',
    rebaseType: 1,
    returnPeerModelValueBfRebase: form.returnPeerModelValueBfRebase,
    modifiedAt: new Date().getTime(),
    creator: creator,
    slidingWindow: false,
    slidingWindowChunks: 1,
    classify: form.classify,
    productFormulas: [],
    currentIndexExpress: ''
  }
}
