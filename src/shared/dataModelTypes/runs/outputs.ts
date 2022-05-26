/* eslint-disable no-unused-vars */
import type { ModelNavigationNode } from '../models/models'

export interface OutputSeriesItem {
  id: string
  name: string,
  type: string
}

export interface Output {
  id: number
  name: string
  modelId: number
  linkChain: string[]
  workspaceId: number
  series: OutputSeriesItem[]
  periodFrom: number
  periodTo: number
  blockCopy: boolean
  blockDepth: boolean
  seriesCopy: boolean
  seriesDepth: boolean
  separateSeriesCopyPage: boolean // 目前无用
  fileSeparateByCopy: boolean
  fileSeparateByNode: boolean
  fileSeparateByDepth: boolean
  outputAllLevels: boolean
  blockCopyMinLevel: number
  blockCopyMaxLevel: number
}

export enum OutputNavigationNodeType {
  models = 'models',
  outputs = 'outputs'
}

export function createAOutput(): Output {
  return {
    id: 0, // which indicate its a temporary one
    name: '',
    modelId: 0,
    linkChain: [],
    workspaceId: 0,
    series: [],
    periodFrom: 0,
    periodTo: 1,
    blockCopy: true,
    blockDepth: true,
    seriesCopy: true,
    seriesDepth: false,
    separateSeriesCopyPage: false,
    fileSeparateByCopy: false,
    fileSeparateByNode: false,
    fileSeparateByDepth: true,
    outputAllLevels: true,
    blockCopyMinLevel: 0,
    blockCopyMaxLevel: 0
  }
}

/**
 * A target navigation node mainly used as model layer for target navi tree
 * @property {string} id - is the combination of TargetNavigationNodeType, -, and the original numeric id.
 *             E.g. models-0, targets-234
 */
export type OutputNavigationNode = ModelNavigationNode
