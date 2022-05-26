import helpAPIs from '../../../preload/helpAPIs'

class Help {
  async readDocFile(ctx: any) {
    let { src } = ctx.request.body
    let data = await helpAPIs.readDocFile(src)
    ctx.body = {
      data,
      status: 200
    }
  }

  async helpFileInfos(ctx: any) {
    let { src } = ctx.request.body
    let data = await helpAPIs.helpFileInfos(src)
    ctx.body = {
      data,
      status: 200
    }
  }

  async readHelpdir(ctx: any) {
    let { src } = ctx.request.body
    let data = await helpAPIs.readHelpdir(src)
    ctx.body = {
      data,
      status: 200
    }
  }

  async readImg(ctx: any) {
    let { src } = ctx.request.body
    let data = await helpAPIs.readImg(src)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Help()
