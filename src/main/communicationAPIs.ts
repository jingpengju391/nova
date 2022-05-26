import { ipcMain, app, ipcRenderer } from 'electron'
import { join } from 'path'
import { queryCpus } from '../service/process'
import DialogService from './dialogService'
const os = require('os')
const rimraf = require('rimraf')
let lastWorkPath: string | undefined
const dbConfigPaths = {
  migrationFilePath: join(__dirname, '../db/migrations'),
  seedFilePath: join(__dirname, '../db/seeds')
}

const userDbConfigPaths = {
  migrationFilePath: join(__dirname, '../db/userMigrations')
}

function novaTempFileDirectory(): string {
  let tmpdir: any
  if (process.env.ARCHITECTURE === 'bs') {
    try {
      switch (process.platform) {
        case 'darwin':
          tmpdir = os.tmpdir()
          break
        case 'win32':
          tmpdir = os.tmpdir()
          break
        default:
          tmpdir = '/mnt/feiyan/Temp/'
      }
    } catch (e) {
      console.log(e)
    }
  } else {
    tmpdir = app.getPath('temp')
  }
  return join(tmpdir, 'com.deep-light.feiyan')
}

function novaDocDirectory(): string {
  return join(app.getPath('documents'), 'feiyan')
}

function novaUserDirectory(): string {
  if (process.env.ARCHITECTURE === 'bs') {
    let NovaDir: string
    const homedir = os.homedir()
    switch (process.platform) {
      case 'win32':
        NovaDir = join(homedir, '/AppData/Roaming/feiyan')
        break
      case 'darwin':
        NovaDir = join(homedir, '/Library/Application Support/feiyan')
        break
      default:
        NovaDir = '/mnt/feiyan/user'
    }
    return NovaDir
  } else {
    return join(app.getPath('appData'), 'feiyan')
  }
}

export const registerRenderMessageHandlers = function () {
  // Native File Dialog
  ipcMain.handle('dialog:showOpenWorkspaceDialog', () => DialogService.showOpenWorkspaceDialog())
  ipcMain.handle('dialog:showOpenAuthorizationDialog', () => DialogService.showOpenAuthorizationDialog())
  ipcMain.handle('dialog:showCreateWorkspaceDialog', () => DialogService.showCreateWorkspaceDialog())
  ipcMain.handle('dialog:showOpenDialog', (_, options) => DialogService.showOpenDialog(options))
  ipcMain.handle('dialog:showSaveDialog', (_, options) => DialogService.showSaveDialog(options))
  // DB configs based on different app status
  ipcMain.on('app:dbConfigs', (event) => {
    event.returnValue = dbConfigPaths
  })
  ipcMain.on('app:userDbConfigs', (event) => {
    event.returnValue = userDbConfigPaths
  })

  ipcMain.on('app:userDirectory', (event) => {
    event.returnValue = novaUserDirectory()
  })
  // The temporary files directory that is assigned by the OS
  ipcMain.on('app:tempDirectory', (event) => {
    event.returnValue = novaTempFileDirectory()
  })
  // The document directory that is assigned to Nova by the OS
  ipcMain.on('app:docDirectory', (event) => {
    event.returnValue = novaDocDirectory()
  })
  // The libs files directory that is used by compile and run scripts
  ipcMain.on('app:libsDirectory', (event) => {
    switch (process.platform) {
      case 'darwin':
        event.returnValue = join(__dirname, '../tasks/libs_mac')
        break
      case 'win32':
        event.returnValue = join(__dirname, '../tasks/libs_windows')
        break
      default:
        event.returnValue = join(__dirname, '../tasks/libs_linux')
    }
  })
  // The core files directory that is used by compile and run scripts
  ipcMain.on('app:coreFilesPath', (event) => {
    switch (process.platform) {
      case 'darwin':
        event.returnValue = join(__dirname, '../tasks/core_mac')
        break
      case 'win32':
        event.returnValue = join(__dirname, '../tasks/core_windows')
        break
      default:
        event.returnValue = join(__dirname, '../tasks/core_linux')
    }
  })

  ipcMain.on('app:headerFilesPath', (event) => {
    event.returnValue = join(__dirname, '../tasks/headers')
  })
  ipcMain.on('app:taskFilesPath', (event) => {
    event.returnValue = join(__dirname, '../tasks')
  })
  ipcMain.on('app:helpFilesPath', (event) => {
    //  event.returnValue = join(__dirname, '../tasks/help')
    event.returnValue = join(__dirname, '../tasks/helps')
  })
  ipcMain.handle('app:setLastWorkPath', (_: any, path: string) => {
    //  event.returnValue = join(__dirname, '../tasks/help')
    lastWorkPath = path
  })
  ipcMain.handle('fs:removeTempFolderForModel', fsRemoveTempFolderForModel)
  ipcMain.handle('fs:removeTempFolder', fsRemoveTempFolder)
  ipcMain.on('app:queryCpus', (event) => {
    //  event.returnValue = join(__dirname, '../tasks/help')
    event.returnValue = queryCpus()
  })
}

export function unregisterRenderMessageHandlers() {
  ipcMain.removeHandler('dialog:showOpenWorkspaceDialog')
  ipcMain.removeHandler('dialog:showCreateWorkspaceDialog')
  ipcMain.removeHandler('dialog:showOpenAuthorizationDialog')
  ipcMain.removeHandler('dialog:showOpenDialog')
  ipcMain.removeHandler('dialog:showSaveDialog')
  ipcMain.removeHandler('fs:removeTempFolderForModel')
  ipcMain.removeHandler('fs:removeTempFolder')
  ipcMain.removeHandler('app:setLastWorkPath')
  ipcMain.removeAllListeners('app:dbConfigs')
  ipcMain.removeAllListeners('app:userDbConfigs')
  ipcMain.removeAllListeners('app:tempDirectory')
  ipcMain.removeAllListeners('app:docDirectory')
  ipcMain.removeAllListeners('app:userDirectory')
  ipcMain.removeAllListeners('app:libsDirectory')
  ipcMain.removeAllListeners('app:coreFilesPath')
  ipcMain.removeAllListeners('app:taskFilesPath')
  ipcMain.removeAllListeners('app:headerFilesPath')
  ipcMain.removeAllListeners('app:helpFilesPath')
  ipcMain.removeAllListeners('app:queryCpus')
}

function fsRemoveTempFolder(_: any) {
  return new Promise(resolve => {
    console.log('join(novaTempFileDirectory(), module.exports.userSpace)--------', join(novaTempFileDirectory(), module.exports.userSpace))
    rimraf(join(novaTempFileDirectory(), module.exports.userSpace), (err: Error) => err ? resolve(false) : resolve(true))
  })
}
function fsRemoveTempFolderForModel(_: any, workspaceName: string, modelName: string) {
  const tempDirPath = join(novaTempFileDirectory(), module.exports.userSpace, workspaceName, modelName)

  // =======
  // function fsRemoveTempFolder(_: any) {
  //   return new Promise(resolve => {
  //     console.log('novaTempFileDirectory--------------', novaTempFileDirectory())
  //     rimraf(novaTempFileDirectory(), (err: Error) => err ? resolve(false) : resolve(true))
  //   })
  // }
  // function fsRemoveTempFolderForModel(_: any, workspaceName: string, modelName: string) {
  //   const tempDirPath = join(novaTempFileDirectory(), workspaceName, modelName)
  // >>>>>>> develop
  return new Promise(resolve => {
    rimraf(tempDirPath, (err: Error) => err ? resolve(false) : resolve(true))
  })
}

export function lastWorkspacePath() {
  return lastWorkPath
}

module.exports = {
  username: '',
  userSpace: '',
  lastWorkspacePath,
  novaUserDirectory,
  fsRemoveTempFolder,
  fsRemoveTempFolderForModel,
  novaTempFileDirectory
}
