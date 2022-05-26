export class ProjectDataSource {
  id: number | string
  name?: string
  chooseDataSource: string[]
  constructor() {
    this.id = 0
    this.chooseDataSource = []
  }
}

export interface Project {
  id: number | string
  name: string
  type: string
  child?: boolean
  status?: number
  parentId?: string | number
  children: Project[] | any[]
}
export interface ProjectNav {
  id: number | string
  name: string
  type: string
  parentId: string | number
  children: ProjectNav[] | []
}

// export interface projectChildren{
//   id: number,
//   projectId: number,
//   status: number,
//   name: string,
//   type: string
// }
