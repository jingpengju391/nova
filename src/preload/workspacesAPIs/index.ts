import { ipcRenderer } from 'electron'
import type { OpenDialogReturnValue, SaveDialogReturnValue } from 'electron'
import { Workspace } from '@shared/dataModelTypes'
import DBClient from '../../service/db/dbClient'
import fs from 'fs'
import dbService from '../../service/db'
import { basename, dirname } from 'path'
import { getFileNameWithoutExtension } from '@shared/commonUtils'

let communicationAPIs: any
if (process.env.ARCHITECTURE === 'bs') {
  communicationAPIs = require('../../main/communicationAPIs')
}

let workspacesAPIs = {
  userSpace: '',
  async createWorkspacePath(): Promise<{ canceled: boolean, workspacePath: string | undefined }> {
    const result: SaveDialogReturnValue = await ipcRenderer.invoke('dialog:showCreateWorkspaceDialog')
    return result.canceled
      ? { canceled: true, workspacePath: undefined }
      : { canceled: false, workspacePath: result.filePath }
  },
  async chooseWorkspacePath(): Promise<{ canceled: boolean, workspacePath: string | undefined }> {
    const result: OpenDialogReturnValue = await ipcRenderer.invoke('dialog:showOpenDialog')
    return { canceled: result.canceled, workspacePath: result.filePaths[0] }
  },
  async chooseAuthorizationPath(): Promise<{ canceled: boolean, workspacePath: string | undefined }> {
    const result: OpenDialogReturnValue = await ipcRenderer.invoke('dialog:showOpenAuthorizationDialog')
    return { canceled: result.canceled, workspacePath: result.filePaths[0] }
  },
  openWorkspaceInNewWindow(workspacePath: string) {
    ipcRenderer.invoke('window:createNewWorkspaceWindow', workspacePath)
  },
  async removeTempFolderForModel(workspaceName: string, modelName: string): Promise<boolean> {
    let result
    if (process.env.ARCHITECTURE === 'bs') {
      communicationAPIs.userSpace = workspacesAPIs.userSpace
      result = await communicationAPIs.fsRemoveTempFolderForModel(undefined, workspaceName, modelName)
    } else {
      result = await ipcRenderer.invoke('fs:removeTempFolderForModel', workspaceName, modelName)
    }
    return result
  },
  async removeTempFolder(workspaceName: string, modelName: string): Promise<boolean> {
    let result
    if (process.env.ARCHITECTURE === 'bs') {
      communicationAPIs.userSpace = workspacesAPIs.userSpace
      result = await communicationAPIs.fsRemoveTempFolder(undefined, workspaceName, modelName)
    } else {
      result = await ipcRenderer.invoke('fs:removeTempFolder', workspaceName, modelName)
    }
    return result
  },
  db: {
    async getDefaultWorkspace(): Promise<Workspace | null> {
      const results = await DBClient.getInstance(workspacesAPIs.userSpace)('workspaces').where('id', 1).select('*')
      return results.length > 0 ? results[0] : null
    }
  },
  async initializeWorkspace(workspacePath: string, createNew: boolean, username: string = ''): Promise<Workspace> {
    if (createNew) {
      try {
        const exist = fs.existsSync(workspacePath)
        if (exist) {
          fs.rmSync(workspacePath)
        }
      } catch (err) {
        // TODO: add alert view in UI
        console.error(err)
      }
    }
    if (process.env.ARCHITECTURE !== 'bs') {
      ipcRenderer.invoke('app:setLastWorkPath', workspacePath)
    }
    dbService.userSpace = this.userSpace
    await dbService.initializeDB(workspacePath)
    const defaultWorkSpace = await this.db.getDefaultWorkspace()
    if (!defaultWorkSpace) throw new Error('No default workspace error')
    defaultWorkSpace.dirPath = dirname(workspacePath)

    // for version control
    // initializeRCS(defaultWorkSpace.dirPath)
    defaultWorkSpace.fileName = getFileNameWithoutExtension(basename(workspacePath))
    await dbService.initUserDB(username)
    return defaultWorkSpace
  }
}

export default workspacesAPIs
