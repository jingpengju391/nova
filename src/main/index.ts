import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions, shell } from 'electron'
import { registerRenderMessageHandlers, unregisterRenderMessageHandlers, lastWorkspacePath } from './communicationAPIs'
import { registerRenderProcessMessageHandlers, unregisterRenderProcessMessageHandlers } from '../service/process/index'
import { LogService } from './logService'
import indexPreload from '@preload/index'
import indexHtmlUrl from '@renderer/index.html'
import logoUrl from '@static/logo.png'
import DialogService from './dialogService'
import { isMac, isWin, isLinux } from './utils'
// import createBaseWorker from './workers/index?worker'

const ProgressBar = require('electron-progressbar')

let windows = [] as BrowserWindow[]
let progressBar: any
let logger: LogService
let openedWorkspacePath: string | undefined
let eventRegisterred = false
async function main() {
  logger = new LogService()
  logger.initialize(app.getPath('userData'))
  console.log(app.getPath('userData'))
  buildMenu()
  /**
   * fixed bug: dev tool get disconnected each time the app get rebuilt and code changes are related to sqlite3
   * https://github.com/mapbox/node-sqlite3/issues/1370
   */
  // app.allowRendererProcessReuse = false
  await app.whenReady()
  createWindow(openedWorkspacePath)
  DialogService.initialize(logger)

  // createBaseWorker({ workerData: 'worker world' }).on('message', (message) => {
  //   logger.log(`Message from worker: ${message}`)
  // }).postMessage('')
}

function createWindow(workspacePath?: string): BrowserWindow {
  console.log('register Render', workspacePath)
  registerAllRenderMessageHandlers()
  console.log('registerred Render', workspacePath)
  windows.length > 0 && (progressBar = new ProgressBar({
    browserWindow: {
      height: 80,
      webPreferences: {
        devTools: false
      }
    },
    title: '打开工程文件中',
    style: {
      text: { display: 'none' },
      detail: { display: 'none' },
      bar: { background: '#409EFF' },
      value: { background: 'rgb(179, 216, 255)' }
    }
  }))
  const newWindow = new BrowserWindow({
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      preload: indexPreload,
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#ffffff', // together with ready-to-show event make app starting smoother
    icon: logoUrl,
    show: false
  })
  newWindow.maximize()
  newWindow.loadURL(indexHtmlUrl)

  windows.push(newWindow)
  newWindow.webContents.send('app:postIsAppStartedInitialValue', !!workspacePath)
  newWindow.once('ready-to-show', () => {
    workspacePath &&
      typeof workspacePath === 'string' &&
      newWindow.webContents.send('app:openWorkspaceFromPath', workspacePath)
    newWindow.show()
    progressBar?.setCompleted()
    progressBar = undefined
  })
  newWindow.on('close', () => {
    newWindow.webContents.send('app:terminateLanguageServer')
  })
  newWindow.on('closed', () => {
    windows = windows.filter(window => window !== newWindow)
  })

  return newWindow
}

function buildMenu() {
  const template: MenuItemConstructorOptions[] = []
  isMac && template.push(
    {
      label: 'Fei Yan',
      submenu: [
        { label: 'About Fei Yan', role: 'about' },
        { type: 'separator' },
        { label: 'Quit Fei Yan', role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    }
  )

  const windowSubMenu: MenuItemConstructorOptions[] = [
    { role: 'minimize', label: '最小化' }
    // { role: 'zoom' }
  ]
  isMac
    ? windowSubMenu.push(
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' }
    )
    : windowSubMenu.push({ role: 'close', label: '关闭' })
  windowSubMenu.push({ label: '打开开发工具', accelerator: 'F12', click: openDevTools })
  template.push(
    {
      label: '文件',
      submenu: [
        {
          label: '新建工作平台',
          click: handleMenuItemNewWorkspaceClick
        },
        {
          label: '打开工作平台',
          click: handleMenuItemOpenWorkspaceClick
        },
        {
          label: '打开最近文件',
          role: 'recentDocuments',
          submenu: [
            {
              label: '清除最近文件',
              role: 'clearRecentDocuments'
            }
          ]
        }
      ]
    },
    {
      role: 'windowMenu',
      label: '窗口',
      submenu: windowSubMenu
    },
    {
      role: 'help',
      label: '帮助',
      submenu: [
        {
          label: '更多',
          click: async () => await shell.openExternal('https://www.deeplightconnect.com/')
        }
      ]
    }
  )

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

const registerRenderCreateWindowMessageHandler = () => {
  ipcMain.handle('window:createNewWorkspaceWindow', (event, workspacePath: string) => {
    createWindow(workspacePath)
  })
}

function unregisterRenderCreateWindowMessageHandler() {
  ipcMain.removeHandler('window:createNewWorkspaceWindow')
}

function registerAllRenderMessageHandlers() {
  if (!eventRegisterred) {
    eventRegisterred = true
    registerRenderMessageHandlers()
    registerRenderProcessMessageHandlers()
    registerRenderCreateWindowMessageHandler()
  }
}

function unregisterAllRenderMessageHandlers() {
  unregisterRenderMessageHandlers()
  unregisterRenderProcessMessageHandlers()
  unregisterRenderCreateWindowMessageHandler()
  eventRegisterred = false
}

function openDevTools() {
  BrowserWindow.getFocusedWindow()?.webContents.openDevTools()
}

async function handleMenuItemNewWorkspaceClick() {
  const result = await DialogService.showCreateWorkspaceDialog()
  !result.canceled && createWindow(result.filePath)
}

async function handleMenuItemOpenWorkspaceClick() {
  const result = await DialogService.showOpenWorkspaceDialog()
  !result.canceled && createWindow(result.filePaths[0])
}

// ensure app start as single instance
// if (!app.requestSingleInstanceLock()) {
//   app.quit()
// }

app.on('window-all-closed', () => {
  unregisterAllRenderMessageHandlers()
  if (!isMac) app.quit()
})

// mac only
app.on('activate', () => {
  windows.length <= 0 && createWindow(lastWorkspacePath())
})

// mac only
app.on('open-file', (event, path) => {
  event.preventDefault()
  logger.log(`Mac open file path: ${path}`)
  if (app.isReady()) {
    createWindow(path)
  } else {
    openedWorkspacePath = path
  }
})

// windowns
app.on('second-instance', (event, commandLine, workingDirectory) => {
  logger.log(`Second-instance workingDir: ${workingDirectory}, cmdLine: ${commandLine}`)
  if (process.platform !== 'darwin') {
    event.preventDefault()
    createWindow(commandLine[0])
  }
})

// TODO: open workspace from windows
app.on('ready', () => {
  if ((isWin || isLinux) && process.argv.length >= 2) {
    logger.log('Windows open file path:', process.argv[1])
    openedWorkspacePath = undefined
    if (process.argv[1] !== '--inspect=5858') openedWorkspacePath = process.argv[1]
  }
})

// app.on('before-quit', () => {
//   mainWindow!.webContents.send('app:beforeQuit')
// })

process.nextTick(main)
