// import DBClient from "../../service/db/dbClient"
import dataInputsAPIs, { createDataInputName, getDataInputSizeString } from '../../preload/dataInputsAPIs'
import { stat } from 'fs-extra'
const base = require('../../renderer/hooks/webapis').base
class DataInputs {
  async queryAllDataInputsOfWorkspace(ctx: any) {
    let { workspaceId } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.queryAllDataInputsOfWorkspace(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllDataInputsByModelId(ctx: any) {
    let { id } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = dataInputsAPIs.db.queryAllDataInputsByModelId(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryDataInput(ctx: any) {
    let { id } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.queryDataInput(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryDataInputs(ctx: any) {
    let { ids } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.queryDataInputs(ids)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertDataInput(ctx: any) {
    let { dataInput, workspaceId } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.insertDataInput(dataInput, workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertDataInputBatch(ctx: any) {
    let { dataInput, workspaceId } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.insertDataInputBatch(dataInput, workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteDataInputs(ctx: any) {
    let { dataInputIDs } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data: any = await dataInputsAPIs.db.deleteDataInputs(dataInputIDs)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteDataInputsInModel(ctx: any) {
    let { modelIds } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data: any = await dataInputsAPIs.db.deleteDataInputsInModel(modelIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateDataInputName(ctx: any) {
    let { id, newName } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data: any = await dataInputsAPIs.db.updateDataInputName(id, newName)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateDataInput(ctx: any) {
    let { dataInput } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.updateDataInput(dataInput)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateDataInputBatch(ctx: any) {
    let { dataInput } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.db.updateDataInputBatch(dataInput)
    ctx.body = {
      data,
      status: 200
    }
  }

  async pathJoin(ctx: any) {
    let { args } = ctx.request.body

    let data = dataInputsAPIs.pathJoin(args)
    ctx.body = {
      data,
      status: 200
    }
  }

  async readCsvFileInfo(ctx: any) {
    let { filePath } = ctx.request.body
    let data: any = await dataInputsAPIs.readCsvFileInfo(filePath)
    data.birthtime = data.birthtime.toString()
    data.atime = data.atime.toString()
    data.mtime = data.mtime.toString()
    data.ctime = data.ctime.toString()
    ctx.body = {
      data,
      status: 200
    }
  }

  async pathResolve(ctx: any) {
    let { p } = ctx.request.body
    let data = dataInputsAPIs.pathResolve(p)
    ctx.body = {
      data,
      status: 200
    }
  }

  async pathParse(ctx: any) {
    let { p } = ctx.request.body
    let data = dataInputsAPIs.pathParse(p)
    ctx.body = {
      data,
      status: 200
    }
  }

  async getDocFolder(ctx: any) { // todo这个接口bs架构不用

  }

  async readDirectory(ctx: any) {
    let { p } = ctx.request.body
    let data = await dataInputsAPIs.readDirectory(p)
    ctx.body = {
      data,
      status: 200
    }
  }

  async labelReadDirectory(ctx: any) {
    let { p, label } = ctx.request.body
    let data = await dataInputsAPIs.labelReadDirectory(p, label)
    ctx.body = {
      data,
      status: 200
    }
  }

  async downloadFile(ctx: any) {
    let { p } = ctx.request.body
    let name = await dataInputsAPIs.downloadFile(p)
    let data = base + '/download/' + name
    ctx.body = {
      data,
      status: 200
    }
  }

  async import(ctx: any) { // todo这个接口无法和cs公用代码，bs的操作逻辑不一样。
    // let username = ctx.session.username
    let { filePath, relativePath } = ctx.request.body
    // let relativePath = 'C:\\workspaces\\SampleModel\\feiyan\\SampleModel'
    // let documentsPath = workingSpace.getDocumentsPath()
    // let relativePath = path.join(workingSpace.getDocumentsPath(), '/SampleModel')
    // console.log('relativePath--------------', relativePath)
    // let relativePath = workingSpace.getProjectionOutputPath(username)
    // let filePath = 'C:\\workspaces\\SampleModel\\feiyan\\SampleModel\\data\\trad.csv'
    // let filePath = relativePath + '/data/trad.csv'
    const stats = await stat(filePath)
    const isRelative = filePath.indexOf(relativePath) !== -1
    let tmp = filePath
    let num = tmp.indexOf('/data/')
    filePath = num > -1 ? tmp.substring(num, tmp.length) : filePath
    const dataInputFile = {
      id: 0,
      name: createDataInputName(filePath),
      size: getDataInputSizeString(stats.size),
      absolutePath: filePath,
      relativePath: isRelative ? filePath.substr(relativePath.length) : filePath,
      createdAt: stats.birthtime.toLocaleString('zh-CN'),
      updatedAt: stats.mtime.toLocaleString('zh-CN'),
      isRelative: isRelative
    }

    let data = { canceled: false, dataInputFile }

    ctx.body = {
      data,
      status: 200
    }
  }

  async getDataInputPreview(ctx: any) {
    let { filePath } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.getDataInputPreview(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async getDataInputMorePreview(ctx: any) {
    let { filePath, limit } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.getDataInputMorePreview(filePath, limit)
    ctx.body = {
      data,
      status: 200
    }
  }

  async readCsvFileMeta(ctx: any) {
    let { filePath } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.readCsvFileMeta(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async readCsvFile(ctx: any) {
    let { filePath, limit } = ctx.request.body
    dataInputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await dataInputsAPIs.readCsvFile(filePath, limit)

    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new DataInputs()
