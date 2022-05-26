/* eslint-disable no-unused-vars */
import type { ModelNavigationNode } from '../models/models'

export enum TargetVSItemType {
  variables = 'variables',
  series = 'series'
}
export interface TargetVSItem {
  id: string
  type: TargetVSItemType
  name: string
  periodFrom: number
  periodTo: number
  periodOutputFrom: number
  periodOutputTo: number
  shouldOutput: boolean
}

export interface Target {
  id: number
  name: string
  modelId: number
  linkChain: string[] // each chain has a format of [link.name + '->' + linkedMask.id],
  workspaceId: number
  variablesAndSeries: TargetVSItem[]
}

export function createATarget(): Target {
  return {
    id: 0, // which indicate its a temporary one
    name: '',
    modelId: 0,
    linkChain: [],
    workspaceId: 0,
    variablesAndSeries: []
  }
}

export enum TargetNavigationNodeType {
  models = 'models',
  targets = 'targets'
}

export interface CpuContrast {
  original: number,
  target: number
}

/**
 * A target navigation node mainly used as model layer for target navi tree
 * @property {string} id - is the combination of TargetNavigationNodeType, -, and the original numeric id.
 *             E.g. models-0, targets-234
 */
export type TargetNavigationNode = ModelNavigationNode
