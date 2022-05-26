export interface DTNodeConfig {
  value: string // 节点的值，传递文件夹地址 或 唯一标识符(比如id)
  label: string // 节点显示的内容
  isDirectory: boolean // 是否是文件夹
  children: DTNodeConfig[] // 子节点
  isEx?: boolean
}
export interface DTNode {
  id: string,
  value: string
  label: string
  isDirectory: boolean
  isLeaf: boolean
  isFile: boolean
  isSymbolicLink: boolean
  level: number
  expanded: boolean
  children: DTNode[]
}
