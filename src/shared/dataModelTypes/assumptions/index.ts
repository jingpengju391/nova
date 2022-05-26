import type { Model } from '../models/models'

export const VariableNaviNodeIdDelimiter = '_'
export const ArrayToString = ','
export const VariableSectionlimiter = '-'
export const CheckedHalflimiter = '^'
export const VariableSectionlimiterHeader = 'sections'
export const tableColumnWidth: number = 170

export interface HTMLElementAny {
  [propName: string]: any
}

export interface fieldTypes {
  id: string
  [propName: string]: string
}

export interface AssumptionVarPage {
  id: number
  name: string
  modelId: number | string
  child: boolean
  status: number
  type? : string
}

export interface AssumptionVariable {
  id?: number | string
  name?: string
  [propName: string]: any
  sort?:number
}

export interface AssumptionSection {
  id?: number
  value?: string
  label?: string
  pageId?: number
  status: boolean
  width?: number
  sort?: number
  [propName: string]: any
}

export interface assumptionBind {
  ids: string[]
  assumptionBind: { pageId: number; variableId?: string | number } | undefined
}

export type SimplifiedModel = Omit<Model, 'detailedChildren'>

export interface AssumptionInfo {
  modelId: number
  pageId: number
  sectionId: number
}

export interface FileTable {
  id: string
  name?: string
  label: string
  isSave: boolean
  curSelect: boolean
  value: string
}
export interface TabsStatus {
  id: string
  name?: string
  type: string
}

export interface SimplifieDrawerData {
  drawer: boolean
  direction: string
}
export interface copySection {
  label?: string
  width?: number
  value?: string
  isEdit?: boolean
  status?: boolean
  $index?: number
  sort?: number
}
