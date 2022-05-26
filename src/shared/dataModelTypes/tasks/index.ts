export interface taskMonit {
  id: number,
  taskName: string,
  outputAddress: string,
  status: number | '',
  submitTime: number | '',
  completedTime: number | '',
  submitter: string,
  modelName: string | ''
  projectionId: number | ''
  modelId: number | ''
  outputChildAddress: string | ''
  pid: number | undefined
  processId: string | undefined
}
export enum ProcessType {
  compile = 'compile',
  modelRun = 'modelRun'
}
export interface ProcessItem {

  projectionDirPath: string,
  modelName: string,
  taskId: number | undefined,
  processType: ProcessType,
  runned: boolean,
  killed: boolean,
  finished: boolean,
  threadNumber: number,
  pid?: number
}

export interface ModelProcessItem extends ProcessItem {
  runnerName: string,
  runnerLocalId: number[],
  csvPath: string,
  outputFolder?: string,
  compileTempOutputPath: string,
  scope?: number[],
}
export interface CompileProcessItem extends ProcessItem {
  compilePath?: string,
  compileTempOutputPath: string,
}

export interface ClusterProcessItem extends Partial<ProcessItem> {
  index?: Array<number>,
  csvPath?: string, // input data relative path
  command?: string,
  runnerName?: string,
  jsonPath?: string, // projection setting path
  compileTempOutputPath?: string,
  outputFolder?: string,
  scope?: number[]
  novaTaskId?: number,
}

export interface ProcessQueue {
  compileProcess: CompileProcessItem[][],
  modelProcess: ModelProcessItem[][],
  currentWindow: any, // user end, send message to user through this
  processId: string,
  projectionId: number, // for cluster name
  useCluster: boolean,
  isClusterTaskSent: boolean,
  namespace: string,
  userSpace: string,
}

export interface PrintLines {
  line:string
  taskId:number|undefined
}

export interface Task {
  taskId:string,
  label: string
}
