export interface wsParams {
  from: string,
  to: string,
  args: Array<Array<number>>,
  jobId: number,
  idx: number,
  pid: number,
  path: string,
  sid: string,
  cnt: number,
  worker: string,
  cpuUsage: number,
  memUsage: number,
  type: string,
  targetPath: string,
  dstList: Array<string>,
  targetWorker: string,
  sourcePath: string,
  srcList: Array<string>,
  sourceWorker: string,
  command: string,
  params: object,
  success: boolean,
  process: object,
  csvName: string,
  cmdStr: string,
  err: string,
  workerId: string,
  jsonPath: string,
  projectionDirPath: string,
  compileTempOutputPath: string,
  dstJson: string,
  dstProjection: string,
}

export interface pathInfo {
  absolute: Array<string>,
  relative: Array<string>
}

export interface workerStatus {
  workerId: string,
  status: string // running error done
}

export interface jobScheme {
  type?: string,
  name?: string,
  command: Array<string>,
  status?: string,
  args?: Array<Array<number>>;
  subStatus?: Array<workerStatus>;
  projectionDirPath?: string,
  compileTempOutputPath?: string,
  cppOutputsPath?: string,
  jsonPath?: string,
  index?: Array<number>,
  runnerName?: string,
  modelName?: string,
}

export interface taskConfig {
  namespace: string | undefined,
  processId: string,
  apiVersion: string,
  userSpace: string,
}

export interface cmdRet {
  success: boolean,
  message?: string,
  taskId?: number,
  isStopped?: boolean,
  workerLen?: number,
}
