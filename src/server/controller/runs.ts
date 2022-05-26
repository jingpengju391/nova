// import DBClient from "../../service/db/dbClient"
import { Runner } from '../../shared/dataModelTypes/runs/runners'
import runsAPIs from '../../preload/runsAPIs'

class Runs {
  async queryAllTargetsOfWorkspace(ctx: any): Promise<void> {
    let { workspaceId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryAllTargetsOfWorkspace(workspaceId)

    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllProjectionsOfWorkspace(ctx: any): Promise<void> {
    let { workspaceId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryAllProjectionsOfWorkspace(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllRunnersOfWorkspace(ctx: any): Promise<void> {
    let { workspaceId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryAllRunnersOfWorkspace(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryTargets(ctx: any) {
    let { targetIds } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryTargets(targetIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertTarget(ctx: any) {
    let { target } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.insertTarget(target)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateTarget(ctx: any) { // todo 随后再测
    let { id, fields } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.updateTarget(id, fields)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteTarget(ctx: any) { // todo随后再测
    let { id } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.deleteTarget(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllRunnersOfModel(ctx: any) { // todo随后再测
    let { modelId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryAllRunnersOfModel(modelId)

    ctx.body = {
      data,
      status: 200
    }
  }

  async queryRunner(ctx: any) { // todo随后再测
    let { runnerId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    const data = await runsAPIs.db.queryRunner(runnerId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryRunners(ctx: any) {
    let { runnerIds } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryRunners(runnerIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertRunner(ctx: any) {
    let { runner } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.insertRunner(runner)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateRunner(ctx: any) {
    let { id, fields } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.updateRunner(id, fields)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteRunner(ctx: any) {
    let { id } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.deleteRunner(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryProjection(ctx: any) {
    let { projectionId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    const data = await runsAPIs.db.queryProjection(projectionId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryProjections(ctx: any) {
    let { projectionIds } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryProjections(projectionIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertProjection(ctx: any) {
    let { projection } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    const data = await runsAPIs.db.insertProjection(projection)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateProjection(ctx: any) {
    let { id, fields } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.updateProjection(id, fields)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteProjection(ctx: any) {
    let { id } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.deleteProjection(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteQueueRunnerItem(ctx: any) {
    let { ids } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.deleteQueueRunnerItem(ids)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryProjectionQueues(ctx:any) {
    let { workspaceId, projectionId, mode, parentId } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryProjectionQueues(workspaceId, projectionId, mode, parentId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertQueueRunner(ctx:any) {
    let { queueRunner } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.insertQueueRunner(queueRunner)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateQueueRunner(ctx:any) {
    let { id, fields } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.updateQueueRunner(id, fields)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryCpusFromDB(ctx:any) {
    let { id } = ctx.request.body
    runsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await runsAPIs.db.queryCpusFromDB(id)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Runs()
