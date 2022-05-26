
import assumptionTableAPIs from '../../preload/assumptionTableAPIs'
class AssumptionTable {
  async isExists(ctx: any) {
    let { src } = ctx.request.body

    ctx.body = {
      data: assumptionTableAPIs.isExists(src),
      status: 200
    }
  }

  async isDeleteDir(ctx: any) {
    let { src } = ctx.request.body

    let data = await assumptionTableAPIs.isDeleteDir(src)
    ctx.body = {
      data,
      status: 200
    }
  }

  async importDirectory(ctx: any) {
    assumptionTableAPIs.username = ctx.session.username
    let { filePath } = ctx.request.body
    let data = await assumptionTableAPIs.importDirectory(filePath)
    ctx.body = {
      data,
      status: 200
    }
    // let filePath: string
    // const result = await ipcRenderer.invoke('dialog:showOpenDialog', {
    //   properties: ['openDirectory']
    // })
    // // return result
    // if (!result.canceled) {
    //   filePath = result.filePaths[0]
    //   const stats = await stat(filePath)
    //   const dataInputDirectory = {
    //     id: 0,
    //     name: parse(filePath).name,
    //     absolutePath: filePath,
    //     relativePath: filePath
    //   }
    //   return { canceled: false, dataInputDirectory }
    // } else {
    //   return { canceled: true, filePath: null }
    // }
  }

  async assumptionTablleCreateDocs(ctx: any) {
    let { src, dist } = ctx.request.body
    let data = await assumptionTableAPIs.assumptionTablleCreateDocs(src, dist)
    ctx.body = {
      data,
      status: 200
    }
  }

  async assumptionTabllePasteShear(ctx: any) {
    let { src, dist, callback } = ctx.request.body
    let data = await assumptionTableAPIs.assumptionTabllePasteShear(src, dist, callback)
    ctx.body = {
      data,
      status: 200
    }
  }

  async assumptionTablleDelteFileDist(ctx: any) {
    let { src, callback } = ctx.request.body
    let data = await assumptionTableAPIs.assumptionTablleDelteFileDist(src, callback)
    ctx.body = {
      data,
      status: 200
    }
  }

  async assumptionTablleDelteFile(ctx: any) {
    let { src, callback } = ctx.request.body
    let data = await assumptionTableAPIs.assumptionTablleDelteFile(src, callback)
    ctx.body = {
      data,
      status: 200
    }
  }

  async clearDirWatcher(ctx: any) {
    let { src } = ctx.request.body
    let data = await assumptionTableAPIs.clearDirWatcher(src)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new AssumptionTable()
