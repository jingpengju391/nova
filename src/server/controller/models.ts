
import modelAPIs from '../../preload/modelsAPIs'
import runsAPIs from '../../preload/runsAPIs'

class Models {
  async queryAllModelsOfWorkspace(ctx: any) {
    let { workspaceId } = ctx.request.body
    // let username = ctx.session.username
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryAllModelsOfWorkspace(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllClassifyListFromDB(ctx: any) {
    let { workspaceId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryAllClassifyListFromDB(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async openFileDialog() {
    // const result: OpenDialogReturnValue = await ipcRenderer.invoke('dialog:showOpenDialog', {
    //   properties: ['openFile'],
    //   filters: [{ name: '模型JSON文件', extensions: ['json'] }]
    // })
    // return { canceled: result.canceled, filePath: result.filePaths[0] }
  }

  async importModelJSON(ctx: any): Promise<void> {
    let { filePath } = ctx.request.body
    let data = await modelAPIs.importModelJSON(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async export() { // todo empty
    // const result = await ipcRenderer.invoke('dialog:showSaveDialog', {
    //   title: '导出模型',
    //   defaultPath: 'Models_' + new Date().getTime(),
    //   buttonLabel: '导出',
    //   filters: [{ name: 'JSON', extensions: ['json'] }]
    // })
    // if (!result.canceled) {
    //   const filePath = result.filePath
    //   data = { canceled: false, filePath }
    // } else {
    //   data = { canceled: true, filePath: null }
    // }
  }

  async writeModelJSONFileToDisk(ctx:any) {
    let { filePath, modelId } = ctx.request.body
    let data = await modelAPIs.writeModelJSONFileToDisk(filePath, modelId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async getModelCreator(ctx:any) {
    modelAPIs.username = ctx.session.username
    let data = await modelAPIs.getModelCreator()
    ctx.body = {
      data,
      status: 200
    }
  }

  async readFileIndexPos(ctx:any) {
    let { filePath, len, pos } = ctx.request.body
    let data = await modelAPIs.readFileIndexPos(filePath, len, pos)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryModel(ctx: any) {
    let { modelId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    const data = await modelAPIs.db.queryModel(modelId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryModels(ctx: any) {
    let { modelIds } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryModels(modelIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryProduct(ctx: any) {
    let { productId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryProduct(productId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryProducts(ctx: any) {
    let { productIds } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryProducts(productIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllProduct(ctx: any) {
    let { workspaceId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryAllProduct(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllProductByModel(ctx: any) {
    let { modelId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryAllProductByModel(modelId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryModelWithItsBlocks(ctx: any) {
    let { modelId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.queryModelWithItsBlocks(modelId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async dbImportModelJSON(ctx: any) {
    let { modelJSON } = ctx.request.body
    // all db manipulation should stay inside one transaction
    // insert a model first, then insert blocks
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.importModelJSON(modelJSON)
    ctx.body = {
      data,
      status: 200
    }
  }
  /**
   *
   * @param modelBlock is the block to be inserted
   * @param maskId is the id of mask of this block. Use this to update mask to make conditional compiling working
   */

  async insertModelBlock(ctx:any) {
    let { modelBlock, maskId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.insertModelBlock(modelBlock, maskId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertProduct(ctx:any) {
    let { product } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = modelAPIs.db.insertProduct(product)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryModelBlock(ctx: any) {
    let { modelBlockId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = modelAPIs.db.queryModelBlock(modelBlockId)
    ctx.body = {
      data,
      status: 200
    }
  }
  // TODO: update all usages of this api, so '@param fields' only contain the fields that need to be updated
  /**
   *
   * @param id
   * @param fields have to be an object with fields that only contains the columns defined in 'blocks' table
   * @param maskId is the id of mask of this block. Use this to update mask to make conditional compiling working
   * @param updatedFormula has formula updated
   * @returns {void}
   */

  async updateModelBlock(ctx: any) {
    let { id, fields, maskId, updatedFormula, updatedHeader } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.updateModelBlock(id, fields, maskId, updatedFormula, updatedHeader)

    ctx.body = {
      data,
      status: 200
    }
  }

  async updateProduct(ctx: any) {
    let { id, fields } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.updateProduct(id, fields)

    ctx.body = {
      data,
      status: 200
    }
  }

  async updateModelBlocks(ctx: any) {
    let { ids, fields, updatedFormula, updatedHeader } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.updateModelBlocks(ids, fields, updatedFormula, updatedHeader)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateProducts(ctx: any) {
    let { ids, products, updatedFormula, updatedHeader } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.updateProducts(ids, products, updatedFormula, updatedHeader)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertModel(ctx: any) {
    let { model } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.insertModel(model)
    ctx.body = {
      data,
      status: 200
    }
  }
  /**
   *
   * @param id
   * @param fields have to be an object with fields that only contains the columns defined in 'models' table
   * @returns {void}
   */
  // TODO: update all usages of this api, so '@param fields' only contain the fields that need to be updated

  async updateModel(ctx: any) {
    let { id, fields } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.updateModel(id, fields)
    ctx.body = {
      data,
      status: 200
    }
  }

  async copyModel(ctx: any) {
    let { modelToCopy, newModelName, allModelBlocks } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.copyModel(modelToCopy, newModelName, allModelBlocks)
    ctx.body = {
      data,
      status: 200
    }
  }

  async copyModelBlock(ctx: any) {
    let { modelBlockToCopy, newBlockName, maskId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.copyModelBlock(modelBlockToCopy, newBlockName, maskId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteModel(ctx: any) {
    let { id } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.deleteModel(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteProduct(ctx: any) {
    let { id } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.deleteProduct(id)
    ctx.body = {
      data,
      status: 200
    }
  }
  /**
   * API for deletion of Mask, Block or Child Block
   * @param id
   * @param maskId is the id of mask of this block. Use this to update mask to make conditional compiling working
   */

  async deleteModelBlock(ctx: any) {
    let { id, maskId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.deleteModelBlock(id, maskId)

    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteModelBlocks(ctx: any) {
    let { ids } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.deleteModelBlocks(ids)

    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteProperty(ctx: any) {
    let { id, type, block, maskId } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.deleteProperty(id, type, block, maskId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertModelsClassifyListToDB(ctx: any) {
    let { workspaceId, ClassifyList } = ctx.request.body
    modelAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await modelAPIs.db.insertModelsClassifyListToDB(workspaceId, ClassifyList)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new Models()
