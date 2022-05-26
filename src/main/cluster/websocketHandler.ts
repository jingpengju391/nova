import { cmdRet } from './type'
import { RawData } from 'ws'
import { BrowserWindow } from 'electron'
import { ProcessQueue, ProcessType } from '@shared/dataModelTypes/tasks'
import webContents from '../../service/webContents'

const CMDTYPE = Symbol('cmdType')

let WebSocket = require('ws')

let mySocket: any
if (process.env.ARCHITECTURE === 'bs') {
  mySocket = require('../../server/socket')
}

// let taskQueueLen = 0
let informOpen = false
let stdOpen = false
// let window: BrowserWindow | any
let processQueueCluster: ProcessQueue[] = []

function updateTaskQueueItemStatus(processId: string | undefined, linearIdx: number, parallelIdx: number, type: string, status: boolean): void {
  // if (!taskQueue) return console.log('taskQueue lost!')
  if (!processId) return console.log('processId lost!')
  for (let i = 0; i < processQueueCluster.length; i++) {
    if (processQueueCluster[i].processId === processId) {
      // console.log('set status:', linearIdx, parallelIdx, type, status)
      // @ts-ignore
      processQueueCluster[i].modelProcess[linearIdx][parallelIdx][type] = status
      break
    }
  }
}

function closeAndReturn(ws: typeof WebSocket, resolve: any, params: any) {
  ws.close()
  return resolve(params)
}

export default async function websocketHandler(msg: Array<any>, processQueue?: ProcessQueue[], processId?: string): Promise<cmdRet> {
  // @ts-ignore
  const cmd = msg[1][0]
  if (cmd === 'create') {
    // update process queue
    processQueueCluster = [...processQueue!]
  }
  // if (processId) window = getContentFromProcessQueueByProcessId(processId, 'currentWindow')
  if (cmd === 'inform' && informOpen) return { success: true }
  if (cmd === 'stdout' && stdOpen) return { success: true }
  const schedulerWs = new WebSocket.WebSocket(`ws://127.0.0.1:8090?type=${cmd}_nova`)
  schedulerWs[CMDTYPE] = cmd
  const retType = [
    'created', 'waiting', 'worker_query', 'tagged', 'usage_ret',
    'progress', 'active', 'copied', 'stop_error',
    'task_started' // for close starterWs
  ]

  const proocessType = [
    'started', 'reduced', 'stdout', 'job_stopped', 'task_log', 'task_stopped'
  ]

  const aliveType = ['informed', 'std_created']

  return new Promise(resolve => {
    schedulerWs.on('open', () => {
      let strMsg = JSON.stringify(msg)
      schedulerWs.send(strMsg)
    })

    schedulerWs.on('close', () => {
      if (schedulerWs[CMDTYPE] !== 'inform' && schedulerWs[CMDTYPE] !== 'stdout') {
        return closeAndReturn(schedulerWs, resolve, { success: false, message: 'Socket Closed.' })
      } else {
        schedulerWs[CMDTYPE] === 'inform' && (informOpen = false)
        schedulerWs[CMDTYPE] === 'stdout' && (stdOpen = false)
        console.log('Should reconnect Inform Websocket.') // TODO
      }
    })

    schedulerWs.on('error', function (err: Error) {
      return closeAndReturn(schedulerWs, resolve, { success: false, message: err.toString() })
    })
    schedulerWs.on('message', (buf: RawData, isBinary: boolean) => {
      const [type, params] = JSON.parse(buf.toString())
      if (type === 'log') {
        console.log(params)
      }

      if (proocessType.includes(type)) {
        let idx = params.index
        let aimProcess = processQueueCluster.find(ele => ele.processId === params.processId)!
        if (!aimProcess) {
          // TODO 处理异常的运行中任务
          // if (type === 'task_stopped') {
          //   let fixAimProcess = processQueueCluster.find(ele => ele.userSpace === params.userSpace)
          //   if (!fixAimProcess) return console.log('Fix ended stask status error')
          //   for (let tid of params.novaTaskIds) {
          //     webContents.send(fixAimProcess.userSpace, fixAimProcess.currentWindow, 'task:updateStatus', tid, ProcessType.modelRun, 5)
          //   }
          // }
          // return console.log('Process info lost!!!!!:', params.processId, type)
        }
        if (type === 'started') {
          if (params.idx === 0) {
            updateTaskQueueItemStatus(params.processId, idx[0], idx[1], 'runned', true)
            let taskItem = aimProcess.modelProcess[idx[0]][idx[1]]
            if (!taskItem.killed && !taskItem.finished) {
              webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:updateStatus', params.novaTaskId, ProcessType.modelRun, 0)
              webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:pid', params.novaTaskId, ProcessType.modelRun, params.process['0'].pid)
            }
          }
          let data = `Task ${params.novaTaskId} running on worker: ${params.workerId}`
          webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', data, params.novaTaskId)
        } else if (type === 'stdout') {
          webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', params.data.toString(), params.novaTaskId)
        } else if (type === 'reduced') {
          console.log('[Reduced]:', aimProcess.modelProcess[params.index[0]][params.index[1]].taskId, 'time:', new Date())
          updateTaskQueueItemStatus(params.processId, idx[0], idx[1], 'finished', true)
          let statCode = params.endCode === 0 ? 1 : 3 // 1正常结束;3跳点
          webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:close', params.endCode)
          webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:updateStatus', params.novaTaskId, ProcessType.modelRun, statCode)
          webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', `Task ${params.novaTaskId} finished.`, params.novaTaskId)
        } else if (type === 'job_stopped') {
          let isKilled = aimProcess.modelProcess[idx[0]][idx[1]].killed
          let isFin = aimProcess.modelProcess[idx[0]][idx[1]].finished
          webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', params.message, params.novaTaskId)
          let stopCode = (params.code === 1) ? 4 : 5 // param.code === 1 model stop, same in nova
          if (params.success && !isKilled && !isFin) {
            updateTaskQueueItemStatus(params.processId, idx[0], idx[1], 'killed', true)
            updateTaskQueueItemStatus(params.processId, idx[0], idx[1], 'finished', true)
            updateTaskQueueItemStatus(params.processId, idx[0], idx[1], 'runned', true)
            webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:updateStatus', params.novaTaskId, ProcessType.modelRun, stopCode)
          } else {
            let dt = `[Cluster] Task close failed:${params.message}`
            webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', dt, params.novaTaskId)
          }
        } else if (type === 'task_stopped') {
          // console.log(`Task stopped:${params.success}, msg:${params.message}, CMDTYPE:`, schedulerWs[CMDTYPE])
          // let aimProcess = processQueueCluster.find(ele => ele.processId === params.processId)
          // close stopWs
          // webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:close', 1) // code 1，被停止
          if (params.success) {
            webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:close', 1)
            for (let i = 0; i < aimProcess.modelProcess.length; i++) {
              for (let j = 0; j < aimProcess.modelProcess[i].length; j++) {
                if (!aimProcess.modelProcess[i][j].finished && !aimProcess.modelProcess[i][j].killed) {
                  let eachTaskId = aimProcess.modelProcess[i][j].taskId
                  updateTaskQueueItemStatus(params.processId, i, j, 'killed', true)
                  updateTaskQueueItemStatus(params.processId, i, j, 'finished', true)
                  updateTaskQueueItemStatus(params.processId, i, j, 'runned', true)
                  webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', params.message, eachTaskId)
                  webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:updateStatus', eachTaskId, ProcessType.modelRun, 5)
                }
              }
            }
          }
          if (schedulerWs[CMDTYPE] === 'stop') return closeAndReturn(schedulerWs, resolve, params)
        }
      }

      if (type === 'task_done') {
        console.log('[Task done]')
      }

      if (type === 'error') {
        let taskId = params.novaTaskId
        let aimProcess = processQueueCluster.find(ele => ele.processId === params.processId)!
        if (!aimProcess) console.log('Process info lost finding:', params, type)
        if (!taskId) return console.log('Error ret lack taskId:', params, 'type:', type)
        if (aimProcess) {
          for (let i = 0; i < aimProcess.modelProcess.length; i++) {
            params.code !== 0 && webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:close', params.closeCode)
            for (let j = 0; j < aimProcess.modelProcess[i].length; j++) {
              let eachTaskId = aimProcess.modelProcess[i][j].taskId
              if (!aimProcess.modelProcess[i][j].finished && params.code !== 0) {
                updateTaskQueueItemStatus(params.processId, i, j, 'killed', true)
                updateTaskQueueItemStatus(params.processId, i, j, 'finished', true)
                updateTaskQueueItemStatus(params.processId, i, j, 'finished', true)
                webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', params.err, eachTaskId)
                webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:updateStatus', eachTaskId, ProcessType.modelRun, 2)
              } else {
                webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:error', params.err, eachTaskId)
              }
            }
          }
        }
      }

      if (retType.includes(type)) {
        if (type === 'stop_error') {
          console.error('stop error:', params)
        }
        if (type === 'waiting') {
          let aimProcess = processQueueCluster.find(ele => ele.processId === params.processId)!
          for (let i = 0; i < aimProcess.modelProcess.length; i++) {
            for (let j = 0; j < aimProcess.modelProcess[i].length; j++) {
              let eachTaskId = aimProcess.modelProcess[i][j].taskId
              webContents.send(aimProcess.userSpace, aimProcess.currentWindow, 'task:newPrintLines', params.message, eachTaskId)
            }
          }
        }
        return closeAndReturn(schedulerWs, resolve, params)
      }
      if (aliveType.includes(type)) {
        schedulerWs[CMDTYPE] === 'inform' && (informOpen = true)
        schedulerWs[CMDTYPE] === 'stdout' && (stdOpen = true)
        return resolve(params)
      }
    })
  })
}
