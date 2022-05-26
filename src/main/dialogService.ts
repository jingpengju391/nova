import Electron, { dialog, BrowserWindow } from 'electron'
import { ILogService } from './logService'
import { ITerminable, toTerminable } from '@shared/terminable'

export default class DialogService {
  static #isDialogShowing: boolean
  static #logService: ILogService

  static initialize(logService: ILogService) {
    this.#isDialogShowing = false
    this.#logService = logService
  }

  static async showOpenWorkspaceDialog(): Promise<Electron.OpenDialogReturnValue> {
    const dialogLock = this.#requestSingleDialogLock()
    if (!dialogLock) {
      this.#logService.error('a dialog is already or will be showing')
      return { canceled: true, filePaths: [] }
    }
    const currentWindow = BrowserWindow.getFocusedWindow()
    try {
      return currentWindow
        ? await dialog.showOpenDialog(
          currentWindow, {
          title: '打开工程文件',
          properties: ['openFile'],
          filters: [{ name: '飞燕工程文件', extensions: ['feiyanworkspace'] }]
        })
        : await dialog.showOpenDialog({
          title: '打开工程文件',
          properties: ['openFile'],
          filters: [{ name: '飞燕工程文件', extensions: ['feiyanworkspace'] }]
        })
    } finally {
      dialogLock.terminate()
    }
  }

  static async showOpenAuthorizationDialog(): Promise<Electron.OpenDialogReturnValue> {
    const dialogLock = this.#requestSingleDialogLock()
    if (!dialogLock) {
      this.#logService.error('a dialog is already or will be showing')
      return { canceled: true, filePaths: [] }
    }
    const currentWindow = BrowserWindow.getFocusedWindow()
    try {
      return currentWindow
        ? await dialog.showOpenDialog(
          currentWindow, {
          title: '打开授权文件',
          properties: ['openFile'],
          filters: [{ name: '飞燕授权文件', extensions: ['key'] }]
        })
        : await dialog.showOpenDialog({
          title: '打开授权文件',
          properties: ['openFile'],
          filters: [{ name: '飞燕授权文件', extensions: ['key'] }]
        })
    } finally {
      dialogLock.terminate()
    }
  }

  static async showCreateWorkspaceDialog(): Promise<Electron.SaveDialogReturnValue> {
    const dialogLock = this.#requestSingleDialogLock()
    if (!dialogLock) {
      this.#logService.error('a dialog is already or will be showing')
      return { canceled: true }
    }

    const currentWindow = BrowserWindow.getFocusedWindow()
    try {
      return currentWindow
        ? await dialog.showSaveDialog(
          currentWindow, {
          title: '新建工程文件',
          defaultPath: 'NewWorkspace.feiyanworkspace',
          buttonLabel: '新建',
          filters: [{ name: 'Nova Workspace', extensions: ['feiyanworkspace'] }]
        })
        : await dialog.showSaveDialog({
          title: '新建工程文件',
          defaultPath: 'NewWorkspace.feiyanworkspace',
          buttonLabel: '新建',
          filters: [{ name: 'Nova Workspace', extensions: ['feiyanworkspace'] }]
        })
    } finally {
      dialogLock.terminate()
    }
  }

  static async showOpenDialog(options: Electron.OpenDialogOptions): Promise<Electron.OpenDialogReturnValue> {
    return dialog.showOpenDialog(options)
  }

  static async showSaveDialog(options: Electron.SaveDialogOptions): Promise<Electron.SaveDialogReturnValue> {
    return dialog.showSaveDialog(options)
  }

  static async showMessageBox(options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
    return dialog.showMessageBox(options)
  }

  static #requestSingleDialogLock(): ITerminable | undefined {
    if (this.#isDialogShowing) return undefined
    this.#isDialogShowing = true
    return toTerminable(() => {
      this.#isDialogShowing = false
    })
  }
}
