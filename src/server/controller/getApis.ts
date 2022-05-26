import workspaces from '../../preload/workspacesAPIs'
import workingSpace, { WorkingSpace } from '../../service/workingSpace'
import config from '../config'
import DBClient from '../../service/db/dbClient'
const path = require('path')
const fs = require('fs')
class GetApis {
  async createWorkspacePath (ctx:any) {
    let { newModelName } = ctx.request.body

    let userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let username = ctx.session.username
    let workingSpace = new WorkingSpace(username, userSpace)
    let destinationDirPath = path.join(workingSpace.getMyDir(userSpace), newModelName)

    if (fs.existsSync(destinationDirPath)) {
      ctx.body = {
        msg: '新workspace文件夹已经存在',
        data: false
      }
    } else {
      fs.mkdirSync(destinationDirPath)
      let destinationModelPath = path.join(workingSpace.getMyDir(userSpace), '/' + newModelName, '/' + newModelName + '.feiyanworkspace')
      fs.copyFileSync(workingSpace.getNewModelPath(), destinationModelPath)
      console.log('创建了新的workspace文件夹')
      ctx.body = {
        msg: '创建成功',
        data: {
          workspacePath: destinationModelPath
        },
        status: 200
      }
    }
  }

  chooseWorkspacePath (ctx:any) {

  }

  async initializeWorkspace (ctx:any) {
    let { createNew, workspacePath } = ctx.request.body
    let userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    workspaces.userSpace = userSpace
    workingSpace.workspacePath = workspacePath
    if (!workingSpace.canAccess(workspacePath, userSpace)) {
      ctx.body = {
        msg: '没有访问权限',
        status: config.status.cantBeAcess
      }
      return
    }

    DBClient.destroyNow(userSpace)

    let workspacePathArray = workspacePath.split('\\')
    workingSpace.documentsPath = workspacePathArray.splice(0, workspacePathArray.length - 1).join('\\')

    let defaultWorkSpace = await workspaces.initializeWorkspace(workspacePath, createNew, ctx.session.username)
    ctx.body = {
      data: defaultWorkSpace,
      status: 200
    }
  }
}

export default new GetApis()
