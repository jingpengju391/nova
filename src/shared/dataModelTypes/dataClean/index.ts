
export interface DataCleanSource {
  id: number,
  name: string,
  ImportTime: number,
  navName: string,
  path: string,
  workspaceId?: number,
  modelId?: number,
  isRelative: boolean,
  headerExists: boolean,
  dataType?: string,
  fields?: string
}
interface DataSources {
  name: string,
  id: number
}
interface Outputs {
  name: string,
  fields: string[] | null
}
export interface DataCleanProject {
  id: number,
  name: string,
  createTime: number,
  dataSources: DataSources[] | [],
  outputs: Outputs[] | [],
  coding: string,
  workspaceId?: number,
  modelId?: number,
}
export interface DataCleanTasks {
  id: number,
  name: string,
  status: boolean,
  submitTime: number,
  completedTime: number,
  submitter: string,
  outputPath: string,
  workspaceId?: number,
  projectId: number
}
