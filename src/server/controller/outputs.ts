
import outputsAPIs from '../../preload/outputsAPIs'
import tasksAPIs from '../../preload/tasksAPIs'

class Outputs {
  async queryAllOutputsOfWorkspace (ctx:any) {
    let { workspaceId } = ctx.request.body
    outputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await outputsAPIs.db.queryAllOutputsOfWorkspace(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryOutputs(ctx:any) {
    let { outputIds } = ctx.request.body
    outputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await outputsAPIs.db.queryOutputs(outputIds)

    ctx.body = {
      data,
      status: 200
    }
  }

  async insertOutput(ctx:any) {
    let { output } = ctx.request.body
    outputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await outputsAPIs.db.insertOutput(output)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateOutput(ctx:any) {
    let { id, fields } = ctx.request.body
    outputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await outputsAPIs.db.updateOutput(id, fields)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteOutput(ctx:any) {
    let { id } = ctx.request.body
    outputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await outputsAPIs.db.deleteOutput(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateOutputs(ctx:any) {
    let { fields } = ctx.request.body
    outputsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await outputsAPIs.db.updateOutputs(fields)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Outputs()
