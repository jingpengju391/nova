export interface SimplifiedDutton {
  value: number
  label: string
  type?: string
  icon?: string
  size?: string,
  drawer?: boolean
}

export interface navigationTree {
  id: string | number
  name: string
  [propName: string]: any
}

export interface modelFile {
  id?: string | number
  name: string
  modelId?: number
  status?: number,
  [propName: string]: any
}

export interface FileAy {
  id?: string | number
  name?: string
  modelId?: number
  status?: number,
  [propName: string]: any
}

export interface HTMLElementFilter {
  filter: any
}

export interface sectionData {
  label: string
  minWidth?: string
  value: number
}

export interface FileTable {
  id: string
  name?: string
  label: string
  isSave: boolean
  curSelect: boolean
  value: string
}
export interface SimplifieDrawer {
  drawer: boolean
  direction: string
}
export interface MenuItems {
  title: string;
  shortCut: string;
  onClick: () => void;
}
