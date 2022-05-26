/* eslint-disable no-unused-vars */
import type { ModelBlock } from './models/masks'
import type { Model, ModelNavigationNode } from './models/models'
import type Variable from './models/variables'
import type Series from './models/series'
import type Link from './models/links'
import type Method from './models/methods'
import { AnchorProductInterface, ProductFormula } from './product/products'
import type { PropertyType, VariableType } from './models/helpers'
/**
 * @see https://github.com/vitejs/vite/blob/03acecd797d8393e38c8a78f920c8e0927762018/importMeta.d.ts
 */
declare interface ImportMetaEnv {
  [key: string]: string | boolean | undefined
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
}

/**
 * @see https://github.com/vitejs/vite/blob/03acecd797d8393e38c8a78f920c8e0927762018/importMeta.d.ts
 */
declare interface ImportMeta {
  readonly hot?: {
    readonly data: any

    accept(): void
    accept(cb: (mod: any) => void): void

    acceptDeps(dep: string, cb: (mod: any) => void): void
    acceptDeps(deps: readonly string[], cb: (mods: any[]) => void): void

    terminate(cb: (data: any) => void): void
    decline(): void
    invalidate(): void

    on(event: string, cb: (...args: any[]) => void): void
  }

  readonly env: ImportMetaEnv
}

export interface DataInputFile {
  id: number
  modelId: number
  blockId: number
  name: string
  size: string
  relativePath: string
  absolutePath: string
  path: string
  owner: string
  createdAt: string
  updatedAt: string
  blockKey: string
  blockVal: string
  field?: string
  type?: string
  isRelative: boolean
  isExistsAbsolutePath?: boolean
  isExistsRelativePath?: boolean
}

export interface DataInputMetaItem {
  path: string
  name: string
  fields: string[]
  values: string[]
}

export interface DataMappingItem {
  block: string
  blockId: string | number
  id: string
  name: string
  type: string
  required: boolean
}
export interface DirectoryFileDescriptor {
  isBlockDevice: boolean,
  isCharacterDevice: boolean,
  isDirectory: boolean,
  isFIFO: boolean,
  isFile: boolean,
  isSocket: boolean,
  isSymbolicLink: boolean,
  name: string,
  absolutePath: string,
  size: string,
  createdAt: string,
  updatedAt: string
}
export interface Workspace {
  /**
   * @field {number} id - the db id column value of the workspace
   */
  id: number
  /**
   * @field {string} name - the db name column value of the workspace
   */
  name: string
  /**
   * @field {string} fileName - the file name of the workspace file in current file system
   */
  fileName: string
  /**
   * @field {string} dirPath - the directory path of the workspace file in current file system
   */
  dirPath: string
}

export { ModelBlock, default as Mask } from './models/masks'
export { default as Block } from './models/blocks'
export { Model, ModelNavigationNode, ModelNavigationTree } from './models/models'
export { default as Variable } from './models/variables'
export { default as Series } from './models/series'
export { default as Link } from './models/links'
export { default as Method } from './models/methods'

export type Property = (Variable | Series | Link | Method) & Record<string, any>

export type SimplifiedModel = Omit<Model, 'detailedChildren' | 'anchorProducts'>

export interface SimplifiedProperty {
  id: string
  name: string
  type: PropertyType
  valueType?: VariableType
  modifiedAt?: number | null
  creator?: string | null
  classify?: string | null
  key?: string
  blockId?: number
  original?: string[]
  formulasIndex?: number
}

export type SimplifiedModelBlock = Omit<ModelBlock, 'detailedChildren' | 'variables' | 'series' | 'links' | 'methods'> & {
  variables: SimplifiedProperty[]
  series: SimplifiedProperty[]
  links: SimplifiedProperty[]
  methods: SimplifiedProperty[]
  parentNode?: ModelNavigationNode
}
// this is the type used by imported model json and exported model json
// which is different than type used inside app logic
export type ModelBlockJSON = Omit<ModelBlock, 'updatedAt' | 'variables' | 'series' | 'links' | 'methods'
> & {
  variables: Variable[]
  series: Series[]
  links: Link[]
  methods: Method[]
}

export interface ModelJSON {
  id?: string | number
  name?: string
  description?: string
  tags?: string[]
  version?: string
  rootBlockId: number | string | null
  blocks: ModelBlockJSON[]
  products: AnchorProductInterface[]
  workspaceId?: number
  codeIndexes?: []
}
export interface ModelConfigJSON {
  id?: string | number
  name?: string
  version?: string
  rootBlockId: number | string | null
}
export interface FormulaTabItem {
  name: string // unique value for el-tabs to identify each el-tab-pane
  content: string
  key: string // the field name of this formula
  id: string
  blockName: string
  modelName?: string
  blockId: number
  modelId: number
  propertyType: string
  propertyId: string
  unsaved: boolean
  readOnly: boolean
  hasCalcFormula: boolean
  breadcrumb: string[]
  openTime: number
  modifiedAt?: number | null
  creator?: string | null
  classify?: string | null
  original?: string[]
  abandonIf?: string
  chooseIf?: string
  formulasIndex?: number
  productFormulas?: ProductFormula[],
  isCodeIndex: boolean
}

export interface DBConfigs {
  sqliteFileName: string
  migrationFilePath: string
  seedFilePath: string
}
export type CsvFileBody = {
  name: string
  path: string
  columns: string[]
  rows: string[]
}

export type NavigationNode = ModelNavigationNode
export type NavigationTree = NavigationNode[]

export interface LinkNode {
  id: string
  name: string
  maskId: number
  children: LinkNode[]
}
