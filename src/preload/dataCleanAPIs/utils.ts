import { DataCleanSource, DataCleanProject, DataCleanTasks } from '@shared/dataModelTypes/dataClean/index'
import { omit } from '@shared/functional'

export function reformatDataSourceForDB(dataSource: Partial<DataCleanSource>): any {
  const dataSourceForDB = dataSource as any
  return { ...omit(['id'], dataSourceForDB) }
}

export function parseDataSourceFromDBQueryResult(result: any): DataCleanSource {
  return {
    ...result,
    isRelative: !!result.isRelative,
    headerExists: !!result.headerExists
  }
}
export function parseDataSourceFromDBQueryAllResult(results: any[]): any {
  if (!results.length) return []
  let reArrr: any[] = []
  let navNames = [results[0].navName]
  let reIndex = 0
  reArrr.push({ name: results[0].navName, fileList: [], file: [] })
  for (let i: number = 0; i < results.length; i++) {
    results[i].isRelative = !!results[i].isRelative
    results[i].headerExists = !!results[i].headerExists
    results[i].size = results[i].fields
    results[i].absolutePath = results[i].path
    results[i].relativePath = results[i].path
    results[i].updatedAt = results[i].ImportTime
    let flag = false
    let Arrindex = 0
    reIndex++
    for (let j = 0; j < navNames.length; j++) {
      if (results[i].navName === navNames[j] && reIndex !== 0) {
        flag = true
        Arrindex = j
      }
    }
    // navNames.map((item, index) => {

    // })
    if (flag) {
      reArrr[Arrindex].fileList.push(results[i])
      reArrr[Arrindex].file.push(results[i].path)
    } else {
      navNames.push(results[i].navName)
      reArrr.push({ name: results[i].navName, fileList: [results[i]], file: [results[i].path] })
    }
    reIndex++
  }
  return reArrr
}
export function reformatDataCleanProjectForDB(dataCleanProject: Partial<DataCleanProject>): any {
  const dataCleanProjectForDB = dataCleanProject as any
  dataCleanProjectForDB.dataSources = JSON.stringify(dataCleanProjectForDB.dataSources)
  dataCleanProjectForDB.outputs = JSON.stringify(dataCleanProjectForDB.outputs)
  return { ...omit(['id'], dataCleanProjectForDB) }
}
export function updateReformatDataCleanProjectForDB(dataCleanProject: any): any {
  const dataCleanProjectForDB = dataCleanProject as any
  let updateCleanProjectForDB = {} as any

  updateCleanProjectForDB.dataSources = JSON.stringify(dataCleanProjectForDB.children[0].children)
  updateCleanProjectForDB.coding = dataCleanProjectForDB.children[1].value
  updateCleanProjectForDB.outputs = JSON.stringify(dataCleanProjectForDB.children[2].children)
  // updateCleanProjectForDB.name = dataCleanProjectForDB.name
  // console.log(updateCleanProjectForDB)
  return { ...updateCleanProjectForDB }
}
export function parseDataCleanProjectFromDBQueryResult(result: any): DataCleanProject {
  return {
    ...result,
    dataSources: JSON.parse(result.dataSources),
    outputs: JSON.parse(result.outputs)
  }
}
export function reformatDataCleanTaskForDB(dataCleanTask: Partial<DataCleanTasks>): any {
  const dataCleanTaskForDB = dataCleanTask as any
  return { ...omit(['id'], dataCleanTaskForDB) }
}
// export function SUBSTR(str: string, start: number, end: number): string {
//   return str.substr(start, end)
// }
export function len(str: string): number {
  return str.length
}
export function max1(...args: number[]): number {
  return Math.max(...args)
}
