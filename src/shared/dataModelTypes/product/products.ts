import { CodeIndex as IndicatorsCodeIndex, IndexBlock } from './indicators'
import { clone } from '../../functional'
export interface ProductInterface{
  id: string,
  name: string,
  description: string,
  creator: string | undefined,
  updatedAt: number
  openTime?: number
  masterId: number
}
export interface ChoseCodeIndex {
  name: string,
  value: boolean
}

export interface ProductBlock {
  name: string,
  id: number,
  parentId: number | null | undefined
}

export interface ProdCodeMapping {
  [propName: string]: string
}

export interface ProdIdMapping {
  [propName: string]: string
}

export interface ProductMap {
  prodCodeMappings: ProdCodeMapping
  prodIdMappings: ProdIdMapping
}

export interface ProductFormula{
  codeIndexExpression: string,
  formula: string,
  name: string,
  classify: string
}

export interface CodeIndex extends IndicatorsCodeIndex{
  disabled?:boolean
}
export interface SimplifiedProduct {
  id: string
  name: string
  masterId?: number,
  modelId?: string,
  openTime?: number
  children?: SimplifiedProduct[],
  nodeKey?: string
}

export interface ComplexProductFormula extends ProductFormula{
  id:number,
  name:string
}
export interface CodeIndexConstrain {
  codeIndexShouldChoose: CodeIndex[],
  codeIndexShouldAbandon: CodeIndex[]
}

export interface AnchorProductBase {
  id: number,
  modelId: number | undefined,
  name: string,
  description: string,
  tags: string[],
  creator: string | undefined,
  updatedAt: number,
  openTime: number,
  codeIndexForEval: string
  workspaceId: number
}
export interface AnchorProductJson extends AnchorProductBase{
  products: Record<string, ProductInterface>,
  codeIndexes: Record<string, ChoseCodeIndex>,
}

export interface AnchorProductDb extends AnchorProductBase{
  products: string,
  codeIndexes: string,
}

export type MasterNavigationTree = SimplifiedProduct[]
export interface AnchorProductInterface extends AnchorProductJson {
  updateCodeIndexForEval: () => void
  getProductFormula: (formulas: ProductFormula[]) => ProductFormula
  getCodeIndexChooseIf: (codeIndexes: CodeIndex[], codeIndex:CodeIndex) => CodeIndex[]
  getCodeIndexAbandonIf: (codeIndexes:CodeIndex[], codeIndex: CodeIndex) => CodeIndex[]
  defaultCodeIndex: (codeIndexes: CodeIndex[]) => void
  updateCodeIndexName: (id: string, name: string) => void
  deleteCodeIndex: (id: string) => void
  updateCodeIndexValue: (codeIndexes:CodeIndex[], id: number, value: boolean) => CodeIndexConstrain | undefined
}

export enum CreaterMasterDefaultIdentification {
  defaultId = 0
}

export enum CreaterProductDefaultIdentification {
  defaultId = '0'
}

export const codeIndexForEvalRulesymbol = {
  division: ',',
  voluation: '='
}

export class Product {
  id: string
  name: string
  description: string
  creator: string | undefined
  updatedAt: number
  masterId:number
  openTime?:number
  constructor(product: Partial<ProductInterface> = {
    id: CreaterProductDefaultIdentification.defaultId,
    name: '',
    description: '',
    masterId: CreaterMasterDefaultIdentification.defaultId,
    updatedAt: new Date().getTime(),
    openTime: new Date().getTime(),
    creator: undefined
  }) {
    this.id = product.id || CreaterProductDefaultIdentification.defaultId
    this.name = product.name || ''
    this.description = product.description || ''
    this.creator = product.creator
    this.updatedAt = product.updatedAt || new Date().getTime()
    this.openTime = product.openTime || new Date().getTime()
    this.masterId = product.masterId || CreaterMasterDefaultIdentification.defaultId
  }
}

export class AnchorProduct implements AnchorProductInterface {
  id: number
  name: string
  description: string
  creator: string | undefined
  updatedAt: number
  modelId: number | undefined
  codeIndexes: { [key: string]: ChoseCodeIndex }
  products: { [key: string]: ProductInterface }
  openTime: number
  codeIndexForEval: string
  tags: string[]
  workspaceId: number
  constructor(anchorProduct: AnchorProductJson = {
    id: CreaterMasterDefaultIdentification.defaultId,
    name: '',
    description: '',
    creator: '',
    updatedAt: new Date().getTime(),
    codeIndexes: {},
    products: {},
    codeIndexForEval: '',
    openTime: 0,
    modelId: CreaterMasterDefaultIdentification.defaultId,
    tags: [],
    workspaceId: CreaterMasterDefaultIdentification.defaultId
  }) {
    this.id = anchorProduct.id
    this.name = anchorProduct.name
    this.description = anchorProduct.description
    this.creator = anchorProduct.creator
    this.modelId = anchorProduct.modelId || undefined
    this.updatedAt = anchorProduct.updatedAt
    this.openTime = anchorProduct.openTime || 0
    this.products = anchorProduct.products
    this.codeIndexForEval = anchorProduct.codeIndexForEval
    this.codeIndexes = anchorProduct.codeIndexes
    this.tags = anchorProduct.tags
    this.updateCodeIndexForEval()
    this.workspaceId = anchorProduct.workspaceId
  }

  updateCodeIndexForEval() {
    const codeIndexForEvalOfArray = []
    for (let id in this.codeIndexes) {
      const codeIndex = this.codeIndexes[id]
      const codeIndexForEvalStr = codeIndex.name + codeIndexForEvalRulesymbol.voluation + codeIndex.value
      codeIndexForEvalOfArray.push(codeIndexForEvalStr)
    }
    this.codeIndexForEval = codeIndexForEvalOfArray.join(codeIndexForEvalRulesymbol.division)
  }

  getProductFormula(formulas: ProductFormula[]): ProductFormula {
    const defaultResult = { formula: '', codeIndexExpression: '', name: '', classify: '' }
    if (!formulas || formulas.length === 0) return defaultResult
    const targetFormula: ProductFormula[] = formulas.filter((productFormula: ProductFormula) => {
      /* eslint no-eval: "error" */
      try {
        return productFormula.codeIndexExpression && this.codeIndexForEval && evalCodeIndex(this.codeIndexForEval, productFormula.codeIndexExpression) === true
      } catch (e:any) {
        // console.log(e) // todo error handling
        // ElMessage.warning(e.message)
        throw new Error(e)
      }
    })
    if (targetFormula.length > 1) {
      // ElMessage.warning('代码索引不互斥')
      // throw new Error('代码索引不互斥')
      console.log('代码索引不互斥')
    }
    return targetFormula[0] || defaultResult
  }

  getCodeIndexChooseIf(codeIndexes: CodeIndex[]): CodeIndex[] {
    return codeIndexes.filter((codeIndex: CodeIndex) => {
      try {
        return codeIndex.chooseIf && evalCodeIndex(this.codeIndexForEval, codeIndex.chooseIf) === true
      } catch (e:any) {
        console.log(e) // todo error handling
        throw new Error(e)
      }
    })
  }

  getCodeIndexAbandonIf(codeIndexes: CodeIndex[]): CodeIndex[] {
    return codeIndexes.filter((codeIndex: CodeIndex) => {
      try {
        return codeIndex.abandonIf && evalCodeIndex(this.codeIndexForEval, codeIndex.abandonIf) === true
      } catch (e:any) {
        console.log(e) // todo error handling
        throw new Error(e)
      }
    })
  }

  defaultCodeIndex(codeIndexes: CodeIndex[]) {
    this.codeIndexes = {}
    codeIndexes.forEach(codeIndex => {
      this.codeIndexes[codeIndex.id.toString()] = { name: codeIndex.name, value: false }
    })
    this.updateCodeIndexForEval()
  }

  updateCodeIndexName(id: string, name: string) {
    try {
      this.codeIndexes[id.toString()].name = name
      this.updateCodeIndexForEval()
    } catch (e) {
      console.log(e) // todo error handling
    }
  }

  deleteCodeIndex(id: string) {
    delete this.codeIndexes[id.toString()]
    this.updateCodeIndexForEval()
  }

  updateCodeIndexValue(codeIndexes:CodeIndex[], id: number, value: boolean):CodeIndexConstrain | undefined {
    try {
      this.codeIndexes[id.toString()].value = value
      this.updateCodeIndexForEval()
      const codeIndexShouldChoose = this.getCodeIndexChooseIf(codeIndexes)
      const codeIndexShouldAbandon = this.getCodeIndexAbandonIf(codeIndexes)
      // todo should deal with choose/abandon intersection error
      return {
        codeIndexShouldChoose: codeIndexShouldChoose,
        codeIndexShouldAbandon: codeIndexShouldAbandon
      }
    } catch (e) {
      console.log(e) // todo error handling
    }
  }
}
export function evalCodeIndex(args: string, fnStr:string): boolean {
  const { argument, parameter } = ParameterAndArgument(args)
  const Fun = Function
  return new Fun(parameter, 'return ' + (fnStr || true))(...argument)
}

// (parameter) 和 (argument)
function ParameterAndArgument(arg:string) {
  const parameterArr:string[] = []
  const argumentArr:Boolean[] = []
  arg.split(codeIndexForEvalRulesymbol.division).forEach(item => {
    const pa = item.split(codeIndexForEvalRulesymbol.voluation)
    parameterArr.push(pa[0])
    argumentArr.push(JSON.parse(pa[1]))
  })
  return {
    parameter: parameterArr.join(codeIndexForEvalRulesymbol.division),
    argument: argumentArr
  }
}

function CodeIndexChooseIfOrAbandonIf(ruleStr:'chooseIf' | 'abandonIf', codeIndex:CodeIndex, codeIndexes:CodeIndex[], _self: AnchorProduct) {
  const bracketsReg = /\(([^)]*)\)/g
  const matchResult = codeIndex[ruleStr].match(bracketsReg)
  const vars = codeIndex[ruleStr].replace(bracketsReg, '').split(/[&&|| ]/).filter(item => item)
  let i = 0
  let codeIndexForEval = _self.codeIndexForEval

  const codeIndexesClone = clone(_self.codeIndexes)
  const dg = (kDat:any) => {
    const kreg = /[&&|| ()]/
    const arr = kDat.split(kreg).filter((item:any) => item)
    if (evalCodeIndex(codeIndexForEval, kDat) || i > arr.length) return
    codeIndexesClone[arr[i]].value = true
    codeIndexForEval = updateCodeIndexForEval(codeIndexesClone)
    i++
    dg(kDat)
  }
  const dg2 = (kDat:any) => {
    if (evalCodeIndex(codeIndexForEval, codeIndex[ruleStr]) || i > vars.length) return
    codeIndexesClone[kDat].value = true
    updateCodeIndexForEval(codeIndexesClone)
    i++
    dg2(kDat)
  }
  matchResult?.forEach((item:string) => {
    i = 0
    dg(item)
  })
  vars.forEach((item:string) => {
    i = 0
    dg2(item)
  })
  const arrNames = Object.values(codeIndexesClone).filter((item:any) => item.value).map((item:any) => item.name)
  return codeIndexes.filter((item:CodeIndex) => (arrNames.includes(item.name) && [...(matchResult || []), ...vars].includes(item.name)))
}

function updateCodeIndexForEval(codeIndexes:Record<string, ChoseCodeIndex>) {
  const codeIndexForEvalOfArray = []
  for (let id in codeIndexes) {
    const codeIndex = codeIndexes[id]
    const codeIndexForEvalStr = codeIndex.name + codeIndexForEvalRulesymbol.voluation + codeIndex.value
    codeIndexForEvalOfArray.push(codeIndexForEvalStr)
  }
  return codeIndexForEvalOfArray.join(codeIndexForEvalRulesymbol.division)
}

function intersection<T>(arr1: T[], arr2: T[]): T[] {
  return arr1.filter(value => arr2.includes(value))
}
