export interface MasterType{
  id: number,
  name: string,
  description: string,
  creator: string | undefined,
  updatedAt: number,
  modelId:number,
}

export type MasterNavigationTree = MasterType[]

export interface SimplifiedMaster {
  id: string
  name: string
  description: string
  children?: SimplifiedMaster[]
}

export enum CreaterMasterDefaultIdentification {
  defaultId = 0
}

export class Master {
  id: number
  name: string
  description: string
  creator: string | undefined
  updatedAt: number
  modelId:number
  constructor(master:Partial<MasterType>) {
    this.id = master.id || CreaterMasterDefaultIdentification.defaultId
    this.name = master.name || ''
    this.description = master.description || ''
    this.creator = master.creator || ''
    this.updatedAt = master.updatedAt || 0
    this.modelId = master.modelId || 0
  }
}
