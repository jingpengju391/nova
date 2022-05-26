import productAPIs from '../../../preload/productAPIs'
let { indicators } = productAPIs
class Products {
  async queryAllMasterOfWorkspace(ctx: any) {
    let { workspaceId } = ctx.request.body
    productAPIs.products.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await productAPIs.products.db.queryAllMasterOfWorkspace(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryCodeIndexesByModelId(ctx: any) {
    let { modelId } = ctx.request.body
    indicators.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await indicators.db.queryCodeIndexesByModelId(modelId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async importCodeIndexes(ctx: any) {
    let { codeIndexes } = ctx.request.body
    indicators.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await indicators.db.importCodeIndexes(codeIndexes)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateCodeIndexes(ctx: any) {
    let { codeIndexes } = ctx.request.body
    indicators.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await indicators.db.updateCodeIndexes(codeIndexes)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Products()
