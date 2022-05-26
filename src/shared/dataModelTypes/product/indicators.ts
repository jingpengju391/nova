import { AnchorProductInterface } from './products'

interface CodeBasics {
  id: number
  name: string
  description: string
  classify: string | undefined
  moduleOnly: number
  productOnly: number
  newProductDefault: number
  newBlockDefault: number
  chooseIf: string
  abandonIf: string
  creator: string | undefined
  modelId:number
}

export enum CodeIndexNavigationNodeType {
  models = 'models',
  codeIndex = 'codeIndex'
}

export enum kCodes {
  moduleOnly = 'moduleOnly',
  productOnly = 'productOnly',
  newProductDefault = 'newProductDefault',
  newBlockDefault = 'newBlockDefault'
}

export enum keyContent {
  chooseIf = 'chooseIf',
  abandonIf = 'abandonIf'
}
export interface CodeIndex extends CodeBasics {
  updatedAt: number
}
export interface CodeTransformation extends CodeBasics {
  updatedAt: string
}

export type kCode = kCodes.moduleOnly | kCodes.newBlockDefault | kCodes.newProductDefault | kCodes.productOnly

type IndexBlockMethods = 'addIndex' | 'deleteIndex' | 'updateIndexName'
export interface IndexBlock {
  id: string,
  name: string,
  description: string,
  classify: string | undefined,
  creator: string | undefined,
  updatedAt: number,
  codeIndexes: Record<string, CodeIndex>,
  addIndex: (codeIndex: CodeIndex, anchorProducts?: AnchorProductInterface[]) => void,
  deleteIndex: (codeIndexId: string, anchorProducts?: AnchorProductInterface[]) => void,
  updateIndexName: (codeIndexId: string, newName: string, anchorProducts?: AnchorProductInterface[]) => void
  modelId: number
  workspaceId: number
}

export function createIndicator(id: number, creator?: string): CodeIndex {
  return {
    id: id,
    name: '',
    description: '',
    classify: '',
    moduleOnly: 0,
    productOnly: 1,
    newProductDefault: 0,
    newBlockDefault: 0,
    creator: creator,
    chooseIf: '',
    abandonIf: '',
    updatedAt: new Date().getTime(),
    modelId: 0
  }
}

export class IndexBlockClass implements IndexBlock {
  id: string
  name: string
  description: string
  classify: string | undefined
  creator: string | undefined
  updatedAt: number
  modelId: number
  workspaceId: number
  codeIndexes: { [key: string]: CodeIndex }
  constructor(indexBlock: Omit<IndexBlock, IndexBlockMethods> = {
    id: '',
    name: '',
    description: '',
    classify: '',
    creator: '',
    updatedAt: new Date().getTime(),
    codeIndexes: {},
    modelId: 0,
    workspaceId: 0
  }) {
    this.id = indexBlock.id
    this.name = indexBlock.name
    this.description = indexBlock.description
    this.creator = indexBlock.creator
    this.updatedAt = indexBlock.updatedAt
    this.codeIndexes = indexBlock.codeIndexes
    this.modelId = indexBlock.modelId
    this.workspaceId = indexBlock.workspaceId
  }

  addIndex(codeIndex: CodeIndex, anchorProducts?: AnchorProductInterface[]) {
    this.codeIndexes[codeIndex.id] = codeIndex
    const codeIndexes = Array.from(Object.values(this.codeIndexes))
    if (anchorProducts) {
      anchorProducts.forEach((anchorProduct: AnchorProductInterface) => {
        anchorProduct.updateCodeIndexValue(codeIndexes, codeIndex.id, false)
      })
    }
  }

  deleteIndex(codeIndexId: string, anchorProducts?: AnchorProductInterface[]) {
    delete this.codeIndexes[codeIndexId]
    if (anchorProducts) {
      anchorProducts.forEach((anchorProduct: AnchorProductInterface) => {
        anchorProduct.deleteCodeIndex(codeIndexId)
      })
    }
  }

  updateIndexName(codeIndexId: string, newName: string, anchorProducts?: AnchorProductInterface[]) {
    // @ts-ignore
    this.codeIndexes[codeIndexId].name = newName
    if (anchorProducts) {
      anchorProducts.forEach((anchorProduct: AnchorProductInterface) => {
        anchorProduct.updateCodeIndexName(codeIndexId, newName)
      })
    }
  }
}

export class CodeIndexClass implements CodeIndex {
  id: number
  name: string
  description: string
  classify: string | undefined
  moduleOnly: number
  productOnly: number
  newProductDefault: number
  newBlockDefault: number
  chooseIf: string
  abandonIf: string
  modelId: number
  creator: string | undefined
  updatedAt: number
  constructor(codeIndex: Partial<CodeIndex> = {
    id: 0,
    name: '',
    description: '',
    classify: '',
    moduleOnly: 0,
    productOnly: 1,
    newProductDefault: 0,
    newBlockDefault: 0,
    chooseIf: '',
    abandonIf: '',
    modelId: 0,
    creator: '',
    updatedAt: new Date().getTime()
  }) {
    this.id = codeIndex.id || 0
    this.name = codeIndex.name || ''
    this.description = codeIndex.description || ''
    this.classify = codeIndex.classify || ''
    this.moduleOnly = codeIndex.moduleOnly || 0
    this.productOnly = codeIndex.productOnly || 1
    this.newProductDefault = codeIndex.newProductDefault || 0
    this.newBlockDefault = codeIndex.newBlockDefault || 0
    this.chooseIf = codeIndex.chooseIf || ''
    this.abandonIf = codeIndex.abandonIf || ''
    this.creator = codeIndex.creator
    this.updatedAt = codeIndex.updatedAt || new Date().getTime()
    this.modelId = codeIndex.modelId || 0
  }
}
