export interface DataLinkFile {
  id: number
  absolutePath: string
  createdAt?: string
  isRelative?: boolean
  name: string
  relativePath?: string
  size: string
  updatedAt: string
}

export interface DataLink {
  id: number
  name: string
  type: string
  file: string[]
  fileList: DataLinkFile[]
}

export interface DataLinkNavigationNode {
  id: number
  name: string
  type: string

}
export interface DataLinkNavigation {
  // id: string
  name: string
  type: string
  file: string[]
  fileList: DataLinkFile[]
}
