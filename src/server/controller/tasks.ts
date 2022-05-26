// import DBClient from "../../service/db/dbClient"

import tasksAPIs from '../../preload/tasksAPIs'
import assumptionVarsAPIs from "../../preload/assumptionVarsAPIs"

class Tasks {
  async readConsoleFile(ctx: any): Promise<void> {
    let { src } = ctx.request.body
    let data = await tasksAPIs.readConsoleFile(src)
    ctx.body = {
      data,
      status: 200
    }
  }

  async readCsvFile(ctx: any): Promise<void> {
    let { filePath } = ctx.request.body
    let data = await tasksAPIs.readCsvFile(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertTaskMonitsToDB(ctx: any) {
    let { workspaceId, taskMonit } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.db.insertTaskMonitsToDB(workspaceId, taskMonit)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryTaskMonitsFromDB(ctx: any) {
    let { workspaceId } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.db.queryTaskMonitsFromDB(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteTaskMoniteToDB(ctx: any) {
    let { idArr } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.db.deleteTaskMoniteToDB(idArr)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateTaskMoniteToDB(ctx: any) {
    let { id, status } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.db.updateTaskMoniteToDB(id, status)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateTaskMoniteSubmitTimeToDB(ctx: any) {
    let { id } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.db.updateTaskMoniteSubmitTimeToDB(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async compileModel(ctx:any): Promise<any> {
    let { model, workspace } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.run.compileModel(model, workspace)
    ctx.body = {
      data,
      status: 200
    }
  }

  async stopProcess(ctx:any): Promise<any> {
    let { pid, taskId, processId, useCluster } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.run.stopProcess(pid, taskId, processId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async runProjection(ctx:any) {
    let { simplifiedProjection, workspace } = ctx.request.body
    tasksAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await tasksAPIs.run.runProjection(simplifiedProjection, workspace)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Tasks()
