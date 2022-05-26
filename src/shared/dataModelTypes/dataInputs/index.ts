export const dataInputDelimiter = '-'
export const dataInputHeaderDelimiter = 'c'
export const ArrayToString = ','
export const dataInputBlockIDDelimiter = '|'
export const tableColumnWidth:number = 150
export const dateLinkSymbol = '/'
export interface ColumnData {
  required: boolean
  direction: string
  block: string
  name: string
  type: string
}

export interface DataInfo {
  modelId: number
  dataId: number
  dataName: string
}

export interface DataPreview {
  isPreviewOpen: boolean
  columns: string[]
}
