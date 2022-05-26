import path from 'path'
import fs from 'fs'
import workspacesAPIs from '../../preload/workspacesAPIs'
import workingSpace from '../../service/workingSpace'
import config from '../config'
const compressing = require('compressing')

const deleteFolder = require('../../util/file').deleteFolder

class Workspaces {
  async chooseWorkspacePath(ctx: any): Promise<void> {

  }

  async readWorkspacePath(ctx: any): Promise<void> {
    let { currentPath, extension, onlyDir } = ctx.request.body
    const username = ctx.session.username
    const spaceNum = ctx.session.spaceNum
    const userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    Object.assign(workingSpace, { username, spaceNum })

    if (currentPath && !workingSpace.canAccess(currentPath, userSpace)) {
      ctx.body = {
        msg: '没有访问权限',
        status: config.status.cantBeAcess
      }
      return
    }

    let data
    if (!currentPath) {
      workingSpace.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
      currentPath = workingSpace.getMyDir(userSpace)
    }
    function readChildren(dir: string) {
      let dirList:[String?] = []
      let fileList:[String?] = []
      const files = fs.readdirSync(dir)
      files.forEach((item:string, index:number) => {
        var fullPath = path.join(dir, item)
        const stat = fs.statSync(fullPath)
        if (stat.isDirectory()) {
          dirList.push(fullPath)
        } else if (!onlyDir) {
          if (extension) {
            let extname = path.extname(fullPath)
            if (extension === extname) {
              fileList.push(fullPath)
            }
          } else {
            fileList.push(fullPath)
          }
        }
      })
      return { fileList, dirList }
    }

    data = {
      ...readChildren(currentPath),
      currentPath: path.normalize(currentPath)
    }
    ctx.body = {
      data,
      status: 200
    }
  }

  async removeTempFolderForModel(ctx: any): Promise<void> {
    let { workspaceName, modelName } = ctx.request.body
    workspacesAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await workspacesAPIs.removeTempFolderForModel(workspaceName, modelName)
    ctx.body = {
      data,
      status: 200
    }
  }

  async removeTempFolder(ctx: any): Promise<void> {
    let { workspaceName, modelName } = ctx.request.body
    workspacesAPIs.userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    let data = await workspacesAPIs.removeTempFolder(workspaceName, modelName)
    ctx.body = {
      data,
      status: 200
    }
  }

  async upload(ctx: any): Promise<void> {
    try {
      let { relativePath } = ctx.request.body
      const userSpace = ctx.session.username + '/' + ctx.session.spaceNum

      const file = ctx.request.files.file // 获取上传文件
      const reader = fs.createReadStream(file.path)
      if (!relativePath) relativePath = ''
      workingSpace.userSpace = userSpace
      let filePath = path.join(workingSpace.getMyDir(userSpace), relativePath, file.name)
      const exist = fs.existsSync(path.join(workingSpace.getMyDir(userSpace), relativePath))
      if (!exist) {
        fs.mkdirSync(path.join(workingSpace.getMyDir(userSpace), relativePath), { recursive: true })
      }
      const upStream = fs.createWriteStream(filePath)
      let pipe = new Promise((resolve, reject) => {
        reader.pipe(upStream)
        upStream.on('close', async () => {
          if (filePath.split('.').pop() === 'zip') {
            let fileDir
            if (!filePath.includes('/Tables')) {
              fileDir = path.join(workingSpace.getMyDir(userSpace), relativePath)
            } else {
              fileDir = path.join(workingSpace.getMyDir(userSpace), relativePath, file.name.substring(0, file.name.length - 4))
              if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true })
              }
            }
            console.log('fileDir:' + fileDir)
            console.log('fs.existsSync(filePath)------', fs.existsSync(filePath))
            await compressing.zip.uncompress(filePath, fileDir)
            fs.unlinkSync(filePath)
          }
          resolve(true)
        })
      })
      let res = await pipe
      if (res) {
        ctx.body = {
          data: {
            filePath
          },
          status: 200
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  async delete(ctx: any): Promise<void> {
    let { deletePath } = ctx.request.body
    const userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    if (deletePath && !workingSpace.canAccess(deletePath, userSpace)) {
      ctx.body = {
        msg: '没有访问权限',
        status: config.status.cantBeAcess
      }
      return
    }
    if (!fs.existsSync(deletePath)) {
      ctx.body = {
        msg: '地址不存在'
      }
      return
    }
    deletePath = path.normalize(deletePath)
    if (fs.statSync(deletePath).isFile()) {
      fs.unlinkSync(deletePath)
    } else {
      deleteFolder(deletePath)
    }
    ctx.body = {
      data: true,
      status: 200
    }
  }
}

export default new Workspaces()
