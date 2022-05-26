import { ProjectionMode } from '../runs/projections'
export class AppSettings {
  name: string
  userName: string
  calculationStackHeightLimit: number
  errorTraceLength: number

  constructor(userName: string) {
    this.name = 'default'
    this.userName = userName
    this.calculationStackHeightLimit = 768
    this.errorTraceLength = 10
  }
}

export class TaskSettings {
  name: string
  userName: string
  outputFolder: string
  outputPrecision: number
  mode: ProjectionMode
  childFolderSelect: boolean

  constructor(userName: string) {
    this.name = 'default'
    this.userName = userName
    this.outputFolder = 'output'
    this.outputPrecision = 6
    this.mode = ProjectionMode.series
    this.childFolderSelect = true
  }
}

export class RunnerSettings {
  name: string
  userName: string
  multiThreadNumber: number
  slidingWindow: boolean
  rebaseSwitch: boolean // 开关
  rebaseDepth: boolean // 默认起点重置过程
  allowScope: boolean
  modelPointsOutput: boolean
  allowIterationWhenCircularReference: boolean
  allowInnerLoopNumber: boolean
  allowOuterLoopNumber: boolean
  independentInnerLoop: boolean
  independentOuterLoop: boolean
  scopeFrom: number
  scopeTo: number
  innerLoopNumberFrom: number
  innerLoopNumberTo: number
  outerLoopNumberFrom: number
  outerLoopNumberTo: number

  constructor(userName: string) {
    this.name = 'default'
    this.userName = userName
    this.multiThreadNumber = 1
    this.slidingWindow = false
    this.rebaseDepth = false
    this.rebaseSwitch = false
    this.allowIterationWhenCircularReference = false
    this.modelPointsOutput = false
    this.independentInnerLoop = true
    this.independentOuterLoop = true
    this.allowOuterLoopNumber = false
    this.allowScope = false
    this.allowInnerLoopNumber = false
    this.scopeFrom = 0
    this.scopeTo = 1
    this.innerLoopNumberFrom = 0
    this.innerLoopNumberTo = 1
    this.outerLoopNumberFrom = 0
    this.outerLoopNumberTo = 1
  }
}
