
import assumptionVarsAPIs from '../../preload/assumptionVarsAPIs'

class AssumptionVarPages {
  async outputExellFile(ctx: any) {
    let { filePath, data } = ctx.request.body

    let responseData = await assumptionVarsAPIs.outputExellFile(filePath,data)

    ctx.body = {
      data: responseData,
      status: 200
    }
  }

  async outputExellAppendFile(ctx: any) {
    let { filePath, data } = ctx.request.body
    let responseData = assumptionVarsAPIs.outputExellAppendFile(filePath,data)
    ctx.body = {
      data: responseData,
      status: 200
    }
  }

  async deleteTableFile(ctx: any) {
    let { filePath } = ctx.request.body
    let data = await assumptionVarsAPIs.deleteTableFile(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async copyTableFile(ctx: any) {
    let { filePath, newPath } = ctx.request.body
    let data = await assumptionVarsAPIs.copyTableFile(filePath, newPath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async renameTableFile(ctx: any) {
    let { filePath, newPath } = ctx.request.body
    let data = await assumptionVarsAPIs.renameTableFile(filePath, newPath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async addTableFile(ctx: any) {
    let { filePath } = ctx.request.body
    let data = await assumptionVarsAPIs.addTableFile(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async addTableDirectory(ctx: any) {
    let { filePath } = ctx.request.body
    let data = await assumptionVarsAPIs.addTableDirectory(filePath)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllFileListFromDB(ctx: any) {
    let { workspaceId } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.queryAllFileListFromDB(workspaceId)

    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllAssumptionVars(ctx: any) {
    let { ids, workspaceId } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.queryAllAssumptionVars(ids,workspaceId)

    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAssumptionVar(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.queryAssumptionVar(id)
    ctx.body = {
      data,
      status: 200
    }
  }
  // TODO: using workspace info from vuex

  async insertAssumptionVarPage(ctx: any) {
    let { assumptionVarPage, workspaceId } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.insertAssumptionVarPage(assumptionVarPage,workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionVarPages(ctx: any) {
    let { assumptionVarPageIDs } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionVarPages(assumptionVarPageIDs)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionVarPagesInModel(ctx: any) {
    let { modelIds } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionVarPagesInModel(modelIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateAssumptionVarPageName(ctx: any) {
    let { id, newName } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.updateAssumptionVarPageName(id, newName)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertAssumptionVarVariable(ctx: any) {
    let { assumptionVariable, workspaceId } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.insertAssumptionVarVariable(assumptionVariable, workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updatedVariableKeyValToDB(ctx: any) {
    let { property } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.updatedVariableKeyValToDB(property)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryAllVariableVars(ctx: any) {
    let { workspaceId } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.queryAllVariableVars(workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryVariableVar(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.queryVariableVar(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async queryVariableVarById(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.queryVariableVarById(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateAssumptionVarVariableName(ctx: any) {
    let { assumptionVariable } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.updateAssumptionVarVariableName(assumptionVariable)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertAssumptionVarSection(ctx: any) {
    let { assumptionSection,workspaceId } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.insertAssumptionVarSection(assumptionSection, workspaceId)
    ctx.body = {
      data,
      status: 200
    }
  }

  async querySectionVar(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.querySectionVar(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async querySectionVarById(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.querySectionVarById(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async updateAssumptionSection(ctx: any) {
    let { assumptionSection } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.updateAssumptionSection(assumptionSection)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionSection(ctx: any) {
    let { assumptionSection } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionSection(assumptionSection)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionVariable(ctx: any) {
    let { assumptionSection } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionVariable(assumptionSection)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionSections(ctx: any) {
    let { sectionIds } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionSections(sectionIds)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionVariables(ctx: any) {
    let { assumptionSection } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionVariables(assumptionSection)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionSectionByModelId(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionSectionByModelId(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async deleteAssumptionVariableModelId(ctx: any) {
    let { id } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.deleteAssumptionVariableModelId(id)
    ctx.body = {
      data,
      status: 200
    }
  }

  async saveUpdatedPropertyAssumptionBindToDB(ctx: any) {
    let { property } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.saveUpdatedPropertyAssumptionBindToDB(property)
    ctx.body = {
      data,
      status: 200
    }
  }

  async insertAssumptionFileListToDB(ctx: any) {
    let { workspaceId, FileTable } = ctx.request.body
    assumptionVarsAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await assumptionVarsAPIs.db.insertAssumptionFileListToDB(workspaceId, FileTable)
    ctx.body = {
      data,
      status: 200
    }
  }
}

export default new AssumptionVarPages()
