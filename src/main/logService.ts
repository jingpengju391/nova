import { app, BrowserWindow } from 'electron'
import { createWriteStream, createReadStream, readdirSync, rmSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { PassThrough, pipeline, Transform } from 'stream'
import { format } from 'util'

let schedule = require('node-schedule')
let ss = require('socket.io-stream')
let io = require('socket.io-client')

function formatMsg(message: any, options: any[]) { return options.length !== 0 ? format(message, options) : format(message) }
function baseTransform(tag: string) { return new Transform({ transform(c, e, cb) { cb(undefined, `[${tag}] [${new Date().toLocaleString()}] ${c}\n`) } }) }

function getUpdateLogList(dir: string, base: string): Array<{ absolute: string, relative: string }> {
  let ret = []
  let files = readdirSync(dir)
  for (const name of files) {
    let absolutePath = join(dir, name)
    if (!name.endsWith('.log')) continue
    ret.push({
      absolute: absolutePath,
      relative: join(base, name) // 传入路径的相对路径
    })
  }
  return ret
}

export interface ILogService {
  log(message: any, ...options: any[]): void;
  warn(message: any, ...options: any[]): void;
  error(message: any, ...options: any[]): void;
}

export class LogService implements ILogService {
  private loggerEntries = { log: baseTransform('INFO'), warn: baseTransform('WARN'), error: baseTransform('ERROR') };

  readonly log = (message: any, ...options: any[]) => { this.loggerEntries.log.write(formatMsg(message, options)) }

  readonly warn = (message: any, ...options: any[]) => { this.loggerEntries.warn.write(formatMsg(message, options)) }

  readonly error = (message: any, ...options: any[]) => { this.loggerEntries.error.write(formatMsg(message, options)) }

  private output = new PassThrough();

  private logDirectory: string = ''

  constructor() {
    pipeline(this.loggerEntries.log, this.output, () => { })
    pipeline(this.loggerEntries.warn, this.output, () => { })
    pipeline(this.loggerEntries.error, this.output, () => { })

    process.on('uncaughtException', (err) => {
      this.error('Uncaught Exception')
      this.error(err)
    })
    process.on('unhandledRejection', (reason) => {
      this.error('Uncaught Rejection')
      this.error(reason)
    })
    if (process.env.NODE_ENV === 'development') {
      this.output.on('data', (b) => { console.log(b.toString()) })
    }
    app.once('browser-window-created', (event, window) => {
      this.captureWindowLog(window)
    })
  }

  /**
   * Initialize log output directory
   * @param directory The directory of the log
   */
  async initialize(directory: string) {
    this.logDirectory = directory
    const mainLog = join(directory, 'main.log')
    const stream = createWriteStream(mainLog, { encoding: 'utf-8', flags: 'a+' })
    this.output.pipe(stream)
    this.scheduleTask()
    this.log(`Setup main logger to ${mainLog}`)
  }

  sendLogToServer(logFiles: Array<{ absolute: string, relative: string }>) {
    let isWorking = false
    let myTimer: any = null
    this.log('Schedule task starts.....', new Date())
    try {
      let sentCnt = 0
      let ioUrl = 'http://39.107.120.94:8092/stream'
      let socket = io.connect(ioUrl)

      myTimer = setTimeout(() => {
        this.log('Update log timeout..')
        if (!isWorking) socket.close()
      }, 60000)

      socket.on('connect', () => {
        let user = process.platform === 'win32' ? process.env.userName : process.env.USER
        socket.emit('create_stream', { user: user || 'FeiYan', files: logFiles })
        for (let l of logFiles) {
          ss(socket).on(l.relative, function(stream: any, data: any) {
            isWorking = true
            createReadStream(l.absolute, { highWaterMark: 128 * 1024 }).pipe(stream)
          })
        }
      })
      socket.on('copied', (data: any) => {
        this.log(`${data.name}log sent!`)
        rmSync(join(this.logDirectory, data.name)) // force to ignore path not exists

        sentCnt++
        if (sentCnt === logFiles.length) {
          this.log('All log sent, remove all listeners!')
          ss(socket).removeAllListeners()
          if (myTimer) clearTimeout(myTimer)
          socket.close()
        }
      })
    } catch (e) {
      this.error(e)
      if (myTimer) clearTimeout(myTimer)
    }
  }

  scheduleTask() {
    let logFiles = getUpdateLogList(this.logDirectory, './')
    let now = Date.now()
    for (let l of logFiles) {
      let s = statSync(l.absolute)
      if ((s.birthtimeMs - now) / 1000 / 3600 / 24 >= 7) {
        return this.sendLogToServer(logFiles) // 服务启动时：检查log创建时间是否满足七天
      }
    }
    schedule.scheduleJob('0 0 6 * * 5', () => {
    // 测试用，每分钟第30秒发送
    // schedule.scheduleJob('30 * * * * *', () => {
      this.sendLogToServer(logFiles) // 服务长期在线，定时发送
    })
  }

  /**
   * Capture the window log
   * @param window The browser window
   * @param name The name alias of the window. Use window.webContents.id by default
   */
  captureWindowLog(window: BrowserWindow, name?: string) {
    name = name ?? window.webContents.id.toString()
    if (!this.logDirectory) {
      this.warn(`Cannot capture window log for window ${name}. Please initialize the logger to set logger directory!`)
      return
    }
    const loggerPath = resolve(this.logDirectory, `renderer.${name}.log`)
    this.log(`Setup renderer logger for window ${name} to ${loggerPath}`)
    const stream = createWriteStream(loggerPath, { encoding: 'utf-8', flags: 'a+' })
    const levels = ['INFO', 'WARN', 'ERROR']
    window.webContents.on('console-message', (e, level, message, line, id) => {
      stream.write(`[${levels[level]}] [${new Date().toUTCString()}] [${id}]: ${message}\n`)
    })
    window.once('close', () => {
      window.webContents.removeAllListeners('console-message')
      stream.close()
    })
  }

  /**
   * This will create a logger prepend [${tag}] before each log from it
   * @param tag The tag to prepend
   */
  createLoggerFor(tag: string): ILogService {
    function transform(tag: string) { return new Transform({ transform(c, e, cb) { cb(undefined, `[${tag}] ${c}\n`) } }) }
    const log = transform(tag).pipe(this.loggerEntries.log)
    const warn = transform(tag).pipe(this.loggerEntries.warn)
    const error = transform(tag).pipe(this.loggerEntries.error)

    return {
      log(message: any, ...options: any[]) { log.write(formatMsg(message, options)) },
      warn(message: any, ...options: any[]) { warn.write(formatMsg(message, options)) },
      error(message: any, ...options: any[]) { error.write(formatMsg(message, options)) }
    }
  }
}
