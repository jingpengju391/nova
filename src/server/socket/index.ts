import { watchFile } from 'fs-extra'
import config from '../config'
const { io } = require('socket.io-client')
const clientIo = io

interface MySocket {
  socket:any
  io:any
}
class MySocket {
  constructor() {
    this.io
    this.socket
  }

  init() {
    // 与前端的链接，作为服务端
    const server = require('../index').server
    const io = require('socket.io')(server, { cors: true })
    this.io = io
    // let socket:any
    io.on('connection', (socket:any) => {
      this.socket = socket
      socket.on('get-apis/assumptionTable/isDeleteDir', async function (msg:any) {
        let { src } = msg
        console.log('src--------', src)
        let data = await new Promise((resolve, reject) => {
          const watcher = watchFile(src, (evet, ename) => {
            console.log('文件发生变化')
            try {
              resolve(true)
            } catch (err) {
              console.log(err)
            }

            // watcher.close()
          })
        })
        console.log('向前端发送')
        socket.emit('get-apis/assumptionTable/isDeleteDir', { data })
        console.log(data)
      })

      socket.on('create', function(room:string) {
        console.log('加入房间号:',room)
        socket.join(room)
      })
    })

    // 与编译服务的链接，作为客户端
    let compileSocket = clientIo(config.compileBaseUrl)
    compileSocket.on('connect', () => {
      console.log('与编译服务连接成功')
    })

    compileSocket.on('task:pid', (msg) => {
      this.socket.emit('task:pid', msg)
    })
    compileSocket.on('task:newPrintLines', (msg) => {
      this.socket.emit('task:newPrintLines', msg)
    })
    compileSocket.on('task:error', (msg) => {
      this.socket.emit('task:error', msg)
    })
    compileSocket.on('task:close', (msg) => {
      this.socket.emit('task:close', msg)
    })
    compileSocket.on('task:updateStatus', (msg) => {
      this.socket.emit('task:updateStatus', msg)
    })
  }

  // 与前端的链接，作为服务端
  sendToWindow(userSpace:string, currentWindow:any, channel: string, args:any):void{
    this.io.to(userSpace).emit(channel, args)
  }
  // taskPid(userSpace:string, msg:{taskId:any, processType:any, code:any}) {
  //   console.log('发送---------', userSpace)
  //   // this.socket.emit(userSpace + ';' + 'task:pid', msg)
  //   this.io.to(userSpace).emit('task:pid', msg)
  // }
  //
  // taskNewPrintLines(userSpace:string, msg:any) {
  //   console.log('发送---------', userSpace)
  //   // this.socket.emit(userSpace + ';' + 'task:newPrintLines', msg)
  //   this.io.to(userSpace).emit('task:newPrintLines', msg)
  // }
  //
  // taskError(userSpace:string, msg:any) {
  //   console.log('task:error------------', msg)
  //   console.log('发送---------', userSpace)
  //   // this.socket.emit(userSpace + ';' + 'task:error', msg)
  //   this.io.to(userSpace).emit('task:error', msg)
  // }
  //
  // taskClose(userSpace:string, msg:any) {
  //   console.log('io.to---------',io.to)
  //   console.log('发送---------', userSpace)
  //   // this.socket.emit(userSpace + ';' + 'task:close', msg)
  //   this.io.to(userSpace).emit('task:close', msg)
  // }
  //
  // taskUpdateStatus(userSpace:string, msg:any) {
  //   console.log('io.to---------',io.to)
  //   console.log('发送---------', userSpace + ';' + 'task:updateStatus')
  //   // this.socket.emit(userSpace + ';' + 'task:updateStatus', msg)
  //   this.io.to(userSpace).emit('task:updateStatus', msg)
  // }
}
export default module.exports = new MySocket()
