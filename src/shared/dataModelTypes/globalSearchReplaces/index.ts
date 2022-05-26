export interface SearchFile {
  searchValue: string
}

export interface BlockFile {
  id: string
  name: string
}

export interface IsHTML {
  text: string
  isHtml: boolean
}

export interface VariableFile {
  calcFormula: string
  convertTo: string
  copyFormula: string
  copySize: number
  copyType: string
  description: string
  id: string
  isDefining: boolean
  isDirect: boolean
  linkage: string
  name: string
  override: boolean
  rebaseType: number
  source: string
  type: string
  valueInput: string
  block?: BlockFile
  calcFormulaHighlight?: string
}
export interface ReplaceData {
  content: string
  key: string
  blockId: number
  unsaved: boolean
  propertyType: string
  propertyId: string
}

export enum SearchModeType {
  model = 'model',
  modeBlock = 'modeBlock',
  codeIndex = 'codeIndex'
}
