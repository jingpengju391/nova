/* eslint-disable no-unused-vars */
import { AnchorProductInterface } from '../product/products'
import type { ModelBlock } from './masks'
import { CodeIndex } from '../product/indicators'
export interface Model {
  id: number
  name: string
  description?: string
  type?: string
  tags?: string[]
  isDateCenter?: boolean
  dateAlignType?: string
  workspaceId?: number
  rootBlockId: number | null
  detailedChildren: ModelBlock[]
  classifyList?: any
  codeIndexes?: Record<number, CodeIndex>
  // anchorProducts: AnchorProductInterface[]
}

/**
 * A model navigation node mainly used as model layer for tree-like components
 * @property {string} id - is the combination of ModelNavigationNodeType, -, and the original numeric id.
 *             E.g. models-0, modelBlocks-234
 */
export interface ModelNavigationNode {
  id: string
  type?: string
  name: string
  children: ModelNavigationNode[]
  copyType?: string
  parentNode?: ModelNavigationNode
  detailedParentId?: string
  isDateCenter?: boolean
  dateAlignType?: string
  nodeKey?: string
}
export interface IdObject {
  modelId: number
  parentId?: number
}
export interface ModelNavigationNodeAndId extends ModelNavigationNode {
  maskId: number
  node: ModelNavigationNode
}
export interface BlockNavigationNode {
  id: number
  name: string
  children: ModelNavigationNode[]
  parentNode?: ModelNavigationNode
}

export interface SimpleModelNavigationNode {
  id: string
  name: string
  type?: string
  children?: SimpleModelNavigationNode[]
}

export const NaviNodeIdDelimiter = '-'

export enum ModelNavigationNodeType {
  models = 'models',
  modelBlocks = 'modelBlocks'
}
export interface ModelFileNavigationNode {
  id: number
  name: string
  folders: string[]
}
export interface ClassifyList {
  modelId: number,
  name: string,
  remarks: string,
  id: string
}
export interface ClassifyObj {
  modelId: number,
  ClassifyList: ClassifyList[]
}
export type ModelNavigationTree = ModelNavigationNode[]
