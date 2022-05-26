
import { createReadStream, createWriteStream } from 'fs'
import { createFileSync } from 'fs-extra'

import path, { resolve } from 'path'
import DBClient from '../../service/db/dbClient'
import { DataCleanSource, DataCleanProject, DataCleanTasks } from '@shared/dataModelTypes/dataClean/index'
// import csvParser from 'csv-parser'
import { Duplex, Writable } from 'stream'
import {
  parseDataSourceFromDBQueryResult, parseDataSourceFromDBQueryAllResult,
  parseDataCleanProjectFromDBQueryResult, reformatDataCleanProjectForDB,
  len, max1, updateReformatDataCleanProjectForDB, reformatDataCleanTaskForDB
} from './utils'
import { isNumber } from 'lodash'
// import Ajv from 'ajv'
const csvParser = require('csv-parser')
// const path = require('path')
//  const fs = require('fs')

// let OutputFile: any = {}
class AsyncEval {
  code: string
  returnVars: any[]
  name: string
  path: string
  defaultName: string
  defaultPath: string
  outputFile: Function
  setOutput: Function
  resetOutput: Function
  constructor(code: string, returnVars: any[], defaultName?: string, defaultPath?: string) {
    this.code = code
    this.returnVars = returnVars
    this.name = ''
    this.path = ''
    this.defaultName = defaultName || ''
    this.defaultPath = defaultPath || ''
    this.setOutput = (name: string, path: string) => {
      this.name = name
      this.path = path
      // 需要加上throw
      throw new Error('error')
    }
    this.resetOutput = () => {
      this.name = this.defaultName
      this.path = this.defaultPath
    } // 放在this.code的前面执行
    this.outputFile = () => {
      return {
        name: this.name,
        path: this.path
      }
    }
  }

  // eslint-disable-next-line lines-between-class-members
  RunEval(chunk: any) {
    // eslint-disable-next-line no-new-func
    return new Function('OutPut', 'resetOutput', 'Source', this.code + '\r\n  ' + '\r\n return{...Source,...{' + this.returnVars + '}} ')(this.setOutput, this.resetOutput, chunk)
    // try catch
  }
}
// let outputFiles: any[] = []
// let outBasePath = ''
let dataCleanAPIs = {
  userSpace: '',

  async runDataClean(dataCleanProject: any): Promise<any> {
    const projectInfo: any = await DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects')
      .where('id', dataCleanProject.selectedProjection)
      .select('*')
      .orderBy('id').then(results => {
        return Promise.all(results.map(result => {
          return parseDataCleanProjectFromDBQueryResult(result)
        }))
      })
    // let dataIndex = 0
    writeAllData(dataCleanProject, projectInfo)
    return true
  },
  db: {
    checkDataNavigationNameExists(navName: string): Promise<boolean> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source')
        .where('navName', navName).then(results => {
          if (results.length) { return true } else { return false }
        })
    },
    async insertDataCleanSource(dataSource: any, workspaceId: number): Promise<number[]> {
      //  const [id] = await DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source').insert(reformatDataSourceForDB(dataSource))
      const params = JSON.parse(JSON.stringify(dataSource.fileList))
      const ids: number[] = []
      return await DBClient.getInstance(dataCleanAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          const id: number[] = await trx('data_clean_source').insert({
            name: item.name + '.csv',
            path: item.isRelative ? item.relativePath : item.absolutePath,
            navName: dataSource.name,
            workspaceId: workspaceId,
            modelId: 0,
            ImportTime: item.updatedAt,
            dataType: 'csv',
            isRelative: item.isRelative,
            fields: item.size,
            headerExists: true
          })
          ids.push(...id)
        }
        return ids
      })

      // return id
    },
    async insertDataCleanSourceImpot(params: any[], workspaceId: number): Promise<number[]> {
      //  const [id] = await DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source').insert(reformatDataSourceForDB(dataSource))
      // const params = JSON.parse(JSON.stringify(dataSource.fileList))
      const ids: number[] = []
      return await DBClient.getInstance(dataCleanAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          const id: number[] = await trx('data_clean_source').insert({
            name: item.name,
            path: item.isRelative ? item.relativePath : item.absolutePath,
            navName: item.navName,
            workspaceId: workspaceId,
            modelId: 0,
            ImportTime: item.updatedAt,
            dataType: 'csv',
            isRelative: item.isRelative,
            fields: item.size,
            headerExists: true
          })
          ids.push(...id)
        }
        return ids
      })

      // return id
    },
    async updateDataCleanSourceImpot(params: any[], workspaceId: number): Promise<number[]> {
      //  const [id] = await DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source').insert(reformatDataSourceForDB(dataSource))
      // const params = JSON.parse(JSON.stringify(dataSource.fileList))
      const ids: number[] = []
      return await DBClient.getInstance(dataCleanAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          const id: number[] = await trx('data_clean_source').where('id', item.id)
            .update({
              name: item.name,
              path: item.isRelative ? item.relativePath : item.absolutePath,
              navName: item.navName,
              workspaceId: item.workspaceId,
              modelId: 0,
              ImportTime: item.updatedAt,
              dataType: 'csv',
              isRelative: item.isRelative,
              fields: item.size,
              headerExists: true
            })
          ids.push(i)
        }
        return ids
      })

      // return id
    },
    async queryAllDataCleanSources(workspaceId: number): Promise<any> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source')
        .where('workspaceId', workspaceId)
        .select('*')
        // .groupBy('navName')
        // .orderBy('id')
        .then(results => {
          return parseDataSourceFromDBQueryAllResult(results)
        })
    },
    async deleteDataCleanSource(name: string) {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source')
        .where('navName', name)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    async renameDataLinkNavName(curName: string, newName: string): Promise<any> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source')
        .where('navName', curName)
        .update({
          navName: newName
        })
        .then((result: any) => {
          return result
        })
    },
    async deleteDataCleanSourceByIds(ids: number[]) {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source')
        .whereIn('id', ids)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    async queryDataCleanSource(id: number): Promise<DataCleanSource> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_source')
        .where('id', id)
        .select('*')
        .then(results => {
          return parseDataSourceFromDBQueryResult(results)
        })
    },
    async insertDataCleanProjects(dataCleanProject: DataCleanProject): Promise<number> {
      const [id] = await DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects').insert(reformatDataCleanProjectForDB(dataCleanProject))
      return id
    },
    async updateDataCleanProjectname(dataCleanProject: DataCleanProject): Promise<number> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects').where('id', dataCleanProject.id)
        .update({
          name: dataCleanProject.name
        })
        .then((result: any) => {
          return result
        })
    },
    async queryDataCleanProjects(workspaceId: number): Promise<DataCleanProject[]> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects')
        .where('workspaceId', workspaceId)
        .select('*')
        .orderBy('id').then(results => {
          return Promise.all(results.map(result => {
            return parseDataCleanProjectFromDBQueryResult(result)
          }))
        })
    },
    async deleteDataCleanProjects(id: number): Promise<number> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects')
        .where('id', id)
        .delete()
        .then(result => {
          return result
        })
    },
    async updateDataCleanProjects(dataCleanProject: any): Promise<number> {
      return DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects')
        .where('id', dataCleanProject.id)
        .update(updateReformatDataCleanProjectForDB(dataCleanProject))
        .then((result: any) => {
          return result
        })
    },
    async insertDataCleanTasks(dataCleanTasks: DataCleanTasks): Promise<number> {
      const [id] = await DBClient.getInstance(dataCleanAPIs.userSpace)('data_clean_projects')
        .insert(reformatDataCleanTaskForDB(dataCleanTasks))
      return id
    }
  }
}
async function writeAllData(dataCleanProject: any, projectInfo: any[]) {
  const codeVars = await formatCodeVariables(projectInfo[0].coding)
  let dataSources = projectInfo[0].dataSources
  let outputs = projectInfo[0].outputs
  const outputFiles: any[] = []
  const outBasePath = pathJoin(dataCleanProject.outputPath, dataCleanProject.outputFileName)
  const outputsNames = outputs.map((item:any) => { return item.name })
  const isOutputName = chuckOutputName(outputsNames, projectInfo[0].coding)
  console.log(dataSources)
  // if (!isOutputName) {
  //   console.log('output模板名称不在output模板范围内')
  //   return
  // }
  for (let i = 0; i < dataSources.length; i++) {
    let newPath = ''
    if (dataSources[i].isRelative) {
      newPath = pathJoin(dataCleanProject.dirPath, dataSources[i].path)
    } else {
      newPath = dataSources[i].path
    }
    dataSources[i].path = newPath
    const readStream = createReadStream(dataSources[i].path.toString()).pipe(csvParser({}))
    const fileName = dataSources[i].name.split(dataSources[i].navName)[0].slice(0, dataSources[i].name.split(dataSources[i].navName)[0].length - 1)
    const projectName = dataSources[i].name.split(dataSources[i].navName)[1].slice(1)
    let fileNameStr = ' let fileName = "' + fileName + '"\r\n let sourceName = "' + dataSources[i].navName + '"\r\n let projectName = "' + projectName + '"\r\n'
    let coding = formatCodeOutputTry(fileNameStr + projectInfo[0].coding)
    console.log('start write', i, newPath)
    await writeData(readStream, outputFiles, outputs, outBasePath, coding, codeVars)
    // dataIndex++
  }
  for (let i = 0; i < outputFiles.length; i++) {
    outputFiles[i].WritableData.end()
  }
  alert('数据清洗完成')
}
async function writeData(readStream: Duplex, outputFiles: any[], outputs: any[], outBasePath: string, coding: string, codeVars: string[]) {
  return new Promise((resolve) => {
    const startTime = new Date().getTime()
    const resultHandle = new AsyncEval(coding, codeVars)
    // const parser = createReadStream(dataPath).pipe(csvParser({}))
    const output = new Writable({
      objectMode: true,
      highWaterMark: 64,
      write(chunk, encoding, callback) {
        const resultClean = resultHandle.RunEval(chunk)
        const OutputFile = resultHandle.outputFile()
        const CurrentFile = CurrentOutputFile(outputs, OutputFile, outputFiles, outBasePath)
        const finalResult = returnStr(resultClean, CurrentFile)
        if (!CurrentFile.WritableData.write(finalResult, encoding)) {
          CurrentFile.WritableData.once('drain', callback)
        } else {
          callback()
        }
      }
    })

    const parser = readStream.pipe(output).on('finish', () => {
      const endTime = new Date().getTime()
      console.log('total time', (endTime - startTime) / 1000)
      resolve(true)
    })
  })
  // .pipe(output)
  // createReadStream(dataPath).pipe(csvParser({})).pipe(transform)
}
function returnStr(resultClean: any, CurrentFile: any) {
  let str: string = ''
  let firstField = true
  CurrentFile.header.forEach((item: string) => {
    if (firstField) {
      str += clearUndefined(resultClean[item])
      firstField = false
    } else {
      str += ',' + clearUndefined(resultClean[item])
    }
  })

  if (CurrentFile.count === 0) {
    str = CurrentFile.header.join(',') + '\r\n' + str + '\r\n'
  } else {
    str = str + '\r\n'
  }
  return str
}
function clearUndefined(str: any) {
  if (str === undefined) return str
  if (isNumber(str)) return str
  if (str.indexOf('undefined') !== -1) {
    str = str.replace('undefined', '')
  }
  return str
}
function CurrentOutputFile(outputs: any[], OutputFile: any, outputFiles: any[], outBasePath: string) {
  const currentOutput = outputFiles.find((item) => item.name === OutputFile.name && item.path === OutputFile.path)
  if (currentOutput) {
    currentOutput.count = currentOutput.count + 1
    return currentOutput
  } else {
    // Output = addOutputFIle(outputs, parser)
    const Output = addOutputFIle(outputs, OutputFile, outputFiles, outBasePath)
    outputFiles.push(Output)
    return Output
  }
}
function addOutputFIle(outputs: any[], OutputFile: any, outputFiles: any[], outBasePath: string) {
  // function addOutputFIle(outputs: any[], parser: any) {
  const outPath = pathJoin(outBasePath, OutputFile.path)
  createFileSync(outPath)

  const currentOutput = outputs.find((item) => item.name === OutputFile.name)
  const Output = {
    name: OutputFile.name,
    path: OutputFile.path,
    count: 0,
    header: currentOutput ? currentOutput.value.split(',') : [],
    WritableData: createWriteStream(outPath)
  }
  // Output.WritableData.on('drain', function () {
  //   let resume = true
  //   Output.pause = false
  //   for (let i = 0; i < outputFiles.length; i++) {
  //     if (outputFiles[i].pause) {
  //       resume = false
  //     }
  //   }
  //   if (resume) {
  //     parser.resume()
  //   }
  // })

  return Output
}

async function formatCodeVariables(code: any) {
  const codingArr = code.split('\n')
  let startVariablesString = '/*CODE_SEGMENT Define_Variables*/'
  let endVariablesString = '/*END_CODE_SEGMENT Define_Variables*/'
  let variablesStartIndex = 0
  let variablesEndIndex = 0
  codingArr.map((item: any, index: number) => {
    if (item.trim() === startVariablesString) variablesStartIndex = index + 1
    if (item.trim() === endVariablesString) variablesEndIndex = index
  })

  const newCodingArr = codingArr.slice(variablesStartIndex, variablesEndIndex)
  let resultCodeVariablesArr = [] as any
  await newCodingArr.map((item: any) => {
    let name = ''
    if (item.indexOf('let') !== -1) {
      name = item.replace('let', '').split('=')[0].trim()
    } else if (item.indexOf('const') !== -1) {
      name = item.replace('const', '').split('=')[0].trim()
    }
    resultCodeVariablesArr.push(name)
  })
  return resultCodeVariablesArr
}
function chuckOutputName(outputs: string[], coding: string) {
  const codingArr = coding.split('\n')
  let outputString = 'OutPut'
  let flog = true
  codingArr.map((item: any, index: number) => {
    if (item.indexOf(outputString) !== -1) {
      let outName = item.split('(')[1].split(',')[0]
      if (outputs.indexOf(outName.slice(1, outName.length - 1)) === -1) {
        flog = false
      }
    }
  })
  return flog
}
function formatCodeOutputTry(code: any) {
  const codingArr = code.split('\n')
  let startVariablesString = '/*CODE_SEGMENT OUTPUT*/'
  let endVariablesString = '/*END_CODE_SEGMENT OUTPUT*/'
  let variablesStartIndex = 0
  let variablesEndIndex = 0
  codingArr.map((item: any, index: number) => {
    if (item.trim() === startVariablesString) variablesStartIndex = index + 1
    if (item.trim() === endVariablesString) variablesEndIndex = index
  })
  codingArr[variablesStartIndex] = 'try{\r\n' + codingArr[variablesStartIndex]
  codingArr[variablesEndIndex] = '}catch(err){}\r\n' + codingArr[variablesEndIndex]

  return codingArr.join('\n')
}
function pathJoin(...args: string[]) {
  return path.normalize(path.join(...args))
}
export default dataCleanAPIs
