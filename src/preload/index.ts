import { ipcRenderer, contextBridge, Dialog, IpcRenderer } from 'electron'
import dataClean from './dataCleanAPIs'
import dataInputs from './dataInputsAPIs'
import models from './modelsAPIs'
import products from './productAPIs'
import workspaces from '../preload/workspacesAPIs'
import tasks from './tasksAPIs'
import runs from './runsAPIs'
import settings from './settingsAPIs'
import outputs from './outputsAPIs'
import assumptionVarPages from './assumptionVarsAPIs'
import assumptionTable from './assumptionTableAPIs'
import helps from './helpAPIs'
import type { Workspace } from '@shared/dataModelTypes'
import user from './userAPIs'
// import dbService from '../service/db/index'
// import { dirname, basename } from 'path'
// import fs from 'fs'
import RCS from './rcs'
// import { getFileNameWithoutExtension } from '@shared/commonUtils'
// import gitAPIs from './gitAPIs'
// import workspacesAPIs from '../service/workspacesAPIs/index'
/**
 * Wrapper of ipc renderer.
 *
 * So the `contextIsolation: true` won't prevent you to use method inherit from EventEmitter,
 * like `ipcRenderer.on`
 */
const isWin = process.platform === 'win32'
const _ipcRenderer: IpcRenderer = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, listener) => {
    ipcRenderer.on(channel, listener)
    return _ipcRenderer
  },
  once: (channel, listener) => {
    ipcRenderer.once(channel, listener)
    return _ipcRenderer
  },
  postMessage: (channel, message, transfers) => ipcRenderer.postMessage(channel, message, transfers),
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
    return _ipcRenderer
  },
  removeListener: (channel, listener) => {
    ipcRenderer.removeListener(channel, listener)
    return _ipcRenderer
  },
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  sendSync: (channel, ...args) => ipcRenderer.sendSync(channel, ...args),
  sendTo: (id, channel, ...args) => ipcRenderer.sendTo(id, channel, ...args),
  sendToHost: (channel, ...args) => ipcRenderer.sendToHost(channel, args),
  // event emitter methods
  setMaxListeners: (n) => {
    ipcRenderer.setMaxListeners(n)
    return _ipcRenderer
  },
  getMaxListeners: () => ipcRenderer.getMaxListeners(),
  listeners: (e) => ipcRenderer.listeners(e),
  rawListeners: (e) => ipcRenderer.rawListeners(e),
  emit: (e, ...args) => ipcRenderer.emit(e, ...args),
  listenerCount: (e) => ipcRenderer.listenerCount(e),
  addListener: (e, l) => {
    ipcRenderer.addListener(e, l)
    return _ipcRenderer
  },
  off: (e, l) => {
    ipcRenderer.off(e, l)
    return _ipcRenderer
  },

  prependListener: (e, l) => {
    ipcRenderer.prependListener(e, l)
    return _ipcRenderer
  },
  prependOnceListener: (e, l) => {
    ipcRenderer.prependOnceListener(e, l)
    return _ipcRenderer
  },
  eventNames: () => ipcRenderer.eventNames()
}

let isAppStartedInitialValue = false
_ipcRenderer.on('app:postIsAppStartedInitialValue', (_, started: boolean) => {
  isAppStartedInitialValue = started
})
// async function initializeDB(workspacePath: string): Promise<void> {
//   DBClient.initialize(workspacePath)
//   const dbConfigs = ipcRenderer.sendSync('app:dbConfigs') as DBConfigs
//   const migrationConfig: Knex.MigratorConfig = {
//     directory: dbConfigs.migrationFilePath
//   }
//   const version = await DBClient.getInstance().migrate.currentVersion(migrationConfig)
//   await DBClient.getInstance().migrate.latest(migrationConfig)
//   const isAppFirstLoaded = version === 'none'
//   if (isAppFirstLoaded) {
//     await DBClient.getInstance().seed.run({ directory: dbConfigs.seedFilePath })
//   }
// }
async function initializeRCS(workspaceDirPath: string): Promise<void> {
  await RCS.init(workspaceDirPath)
}

const apis = {
  appSettings: {
    ...settings,
    isAppStartedInitialValue: () => isAppStartedInitialValue,
    isWin: () => isWin
  },
  dataClean,
  dataInputs,
  models,
  workspaces,
  tasks,
  runs,
  outputs,
  assumptionVarPages,
  assumptionTable,
  helps,
  ipcRenderer: _ipcRenderer,
  products,
  user,
  dialog: {
    showCertificateTrustDialog(...options: any[]) {
      return ipcRenderer.invoke('dialog:showCertificateTrustDialog', ...options)
    },
    showErrorBox(...options: any[]) {
      return ipcRenderer.invoke('dialog:showErrorBox', ...options)
    },
    showMessageBox(...options: any[]) {
      return ipcRenderer.invoke('dialog:showMessageBox', ...options)
    },
    showOpenDialog(...options: any[]) {
      console.log(...options)
      return ipcRenderer.invoke('dialog:showOpenDialog', ...options)
    },
    showSaveDialog(...options: any[]) {
      return ipcRenderer.invoke('dialog:showSaveDialog', ...options)
    }
  } as Pick<Dialog, 'showCertificateTrustDialog' | 'showErrorBox' | 'showMessageBox' | 'showOpenDialog' | 'showSaveDialog'>,
  async initializeWorkspace(workspacePath: string, createNew: boolean): Promise<Workspace> {
    // if (createNew) {
    //   try {
    //     const exist = fs.existsSync(workspacePath)
    //     if (exist) {
    //       fs.rmSync(workspacePath)
    //     }
    //   } catch (err) {
    //     // TODO: add alert view in UI
    //     console.error(err)
    //   }
    // }
    // await dbService.initializeDB(workspacePath)
    // const defaultWorkSpace = await workspaces.db.getDefaultWorkspace()
    // if (!defaultWorkSpace) throw new Error('No default workspace error')
    // defaultWorkSpace.dirPath = dirname(workspacePath)
    // // for version control
    // // initializeRCS(defaultWorkSpace.dirPath)
    // defaultWorkSpace.fileName = getFileNameWithoutExtension(basename(workspacePath))
    let defaultWorkSpace = await workspaces.initializeWorkspace(workspacePath, createNew)
    return defaultWorkSpace
  }
}
contextBridge.exposeInMainWorld('apis', apis)
