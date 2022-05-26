const path = require('path')
const os = require('os')
export class WorkingSpace {
  username:string
  userSpace:string
  workspacePath:string
  documentsPath:string
  newModelName:string
  topFolder: string
  constructor(username?:string, userSpace?:string, newModelName?:string) {
    this.username = username || ''
    this.userSpace = userSpace || ''
    switch (os.type()) {
      case 'Windows_NT':
        this.topFolder = path.join(__dirname, '../../../../../')
        break
      case 'Linux':
        this.topFolder = '/mnt/feiyan'
        break
      case 'Darwin':
        this.topFolder = os.homedir() + '/Documents'
        break
      default:
        this.topFolder = ''
    }
    this.workspacePath = ''
    this.documentsPath = ''
    this.newModelName = newModelName || ''
  }

  getTopFolder() {
    return this.topFolder
  }

  getMyUsernameDir() {
    return path.join(this.topFolder, '/workspaces/' + this.username)
  }

  getMyDir(userSpace:string) {
    return path.join(this.topFolder, '/workspaces/' + userSpace)
  }

  getOriginalModelPath() {
    return path.join(this.topFolder, '/workspaces', '/SampleModel.zip')
  }

  getNewModelPath() {
    return path.join(this.topFolder, '/workspaces/NewWorkspace.feiyanworkspace')
  }

  canAccess (path:string, userSpace:string) {
    let separation
    switch (process.platform) {
      case 'win32':
        separation = '\\'
        break
      default:
        separation = '/'
    }
    let pathArray = path.split(separation)
    let userDir:string = ''
    switch (os.type()) {
      case 'Windows_NT':
        userDir = pathArray[0] + separation + pathArray[1] + separation + pathArray[2] + separation + pathArray[3] + separation + pathArray[4]
        break
      case 'Linux':
        userDir = pathArray[0] + separation + pathArray[1] + separation + pathArray[2] + separation + pathArray[3] + separation + pathArray[4] + separation + pathArray[5]
        break
      case 'Darwin':
        userDir = pathArray[0] + separation + pathArray[1] + separation + pathArray[2] + separation + pathArray[3] + separation + pathArray[4] + separation + pathArray[5] + separation + pathArray[6]
        break
    }
    if (userDir === this.getMyDir(userSpace)) {
      return true
    } else {
      return false
    }
  }
}

// module.exports =
// module.exports.WorkingSpace = WorkingSpace
export default new WorkingSpace()
