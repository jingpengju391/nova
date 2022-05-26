
import type { ModelNavigationNode } from '../models/models'

export enum ProjectionMode {
  series = 'series',
  parallel = 'parallel',
  mixed = 'mixed'
}

export interface SimplifiedProjection {
  projectionId: number,
  childFolder: string | '',
  taskIds: number[][],
  useCluster: boolean,
  namespace: string,
  processId: string
}

export interface Queue {
  id: number
  name: string
  // modelId: number | undefined
  projectionId: number | undefined
  parentId: number | undefined
  runnerId: number | undefined

  multiThreadNumber: number
  // shareBlockResults: boolean
  // allowStaticBlocks: boolean
  allowScope: boolean
  scopeFrom: number
  scopeTo: number
  allowInnerLoopNumber: boolean
  innerLoopNumberFrom: number
  innerLoopNumberTo: number
  allowOuterLoopNumber: boolean
  outerLoopNumberFrom: number
  outerLoopNumberTo: number
  modelPointsOutput: boolean
  independentInnerLoop: boolean
  independentOuterLoop: boolean
  slidingWindow: boolean
  rebaseDepth: boolean
  rebaseSwitch: boolean
  mode: string
  evaluationTimePoint: string
  allowIterationWhenCircularReference: boolean
  children?: Queue[]
  // inheritChildren?: number[]
  isInherit: boolean
}
export interface QueueListNodeNav {
  id: number
  name: string
  children?: Queue[]
}
export function createBaseRunConfigurationItem() {
  return {
    id: 0,
    name: '',
    // modelId: 0,
    projectionId: 0,
    parentId: 0,
    runnerId: 0,
    multiThreadNumber: 2,
    evaluationTimePoint: formatDate(),
    // shareBlockResults: false,
    // allowStaticBlocks: false,
    mode: ProjectionMode.series,
    allowScope: false,
    scopeFrom: 0,
    scopeTo: 1,
    allowInnerLoopNumber: false,
    innerLoopNumberFrom: 0,
    innerLoopNumberTo: 1,
    allowOuterLoopNumber: false,
    outerLoopNumberFrom: 0,
    outerLoopNumberTo: 1,
    modelPointsOutput: false,
    independentInnerLoop: true,
    independentOuterLoop: true,
    slidingWindow: false,
    rebaseDepth: false,
    rebaseSwitch: false,
    allowIterationWhenCircularReference: false,
    children: [],
    isInherit: true
    // inheritChildren: []
  }
}
export class Projection {
  id: number
  name: string
  workspaceId: number
  mode: ProjectionMode
  // modelId: number
  subFolderOutput: boolean
  // runItemNotOverwritten: boolean
  outputFolder: string
  outputPrecision: number
  description: string

  childFolderSelect: boolean
  runQueueSelections: number[][]
  runnerSelections: number[][]

  // calculationStackHeightLimit: number
  // multiThreadNumber: number
  // errorTraceLength: number
  // shareBlockResults: boolean
  // allowStaticBlocks: boolean
  // allowScope: boolean
  // scopeFrom: number
  // scopeTo: number
  // allowInnerLoopNumber: boolean
  // innerLoopNumberFrom: number
  // innerLoopNumberTo: number
  // allowOuterLoopNumber: boolean
  // outerLoopNumberFrom: number
  // outerLoopNumberTo: number
  // modelPointsOutput: boolean
  // independentInnerLoop: boolean
  // independentOuterLoop: boolean
  // outputPrefix: string
  // slidingWindow: boolean
  // rebaseDepth: boolean
  // rebaseSwitch: boolean
  // allowIterationWhenCircularReference: boolean

  constructor() {
    this.id = 0
    this.name = ''
    this.description = ''
    this.workspaceId = 0
    // this.modelId = 0
    this.mode = ProjectionMode.series
    this.runnerSelections = [[]]

    this.childFolderSelect = true
    this.runQueueSelections = [[]]
    this.subFolderOutput = false
    this.outputPrecision = 6
    this.outputFolder = 'outputs'

    // this.calculationStackHeightLimit = 512
    // this.multiThreadNumber = 1
    // this.errorTraceLength = 10
    // this.shareBlockResults = false
    // this.allowStaticBlocks = false
    // this.allowScope = false
    // this.scopeFrom = 0
    // this.scopeTo = 1
    // this.allowInnerLoopNumber = false
    // this.innerLoopNumberFrom = 0
    // this.innerLoopNumberTo = 1
    // this.allowOuterLoopNumber = false
    // this.outerLoopNumberFrom = 0
    // this.outerLoopNumberTo = 1
    // this.modelPointsOutput = false
    // this.independentInnerLoop = true
    // this.independentOuterLoop = true
    // this.outputPrefix = 'proj'
    // this.slidingWindow = false
    // this.rebaseDepth = false
    // this.rebaseSwitch = false
    // this.allowIterationWhenCircularReference = false
  }
}
function formatDate() {
  const newDate = new Date()
  const Month = (newDate.getMonth() + 1) < 10 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1)
  const day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate()
  console.log((newDate.getFullYear().toString() + '-' + Month + '-' + day))
  return (newDate.getFullYear().toString() + '-' + Month + '-' + day)
}
export enum ProjectionNavigationNodeType {
  models = 'models',
  projections = 'projections'
}
export type ProjectionNavigationNode = ModelNavigationNode
