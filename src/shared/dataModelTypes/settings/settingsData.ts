
export interface softwareData{
  id: number
  heightLimit: number
  length: number
}

export interface taskData{
  id: number
  outputProject:string
  outputPrecision: number
  runWay: string
  projectsOutput: boolean
}

export interface runnerData{
  id: number
  valueThread:number,
  slideWindow: boolean,
  switchBegin: boolean,
  resetProcess: boolean,
  dataRange: boolean,
  modelsOutput: boolean,
  cirCal: boolean,
  firstCircle: boolean,
  secondCircle: boolean,
  indeFirstCircle: boolean,
  indeSecondCircle: boolean
}
