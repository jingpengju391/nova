import websocketHandler from './websocketHandler'
import type { taskConfig, cmdRet } from './type'
import { ClusterProcessItem, ProcessQueue } from '@shared/dataModelTypes/tasks'
import { BrowserWindow } from 'electron'

export default {
  async createTask(tConfig: taskConfig, tScheme: Array<Array<Partial<ClusterProcessItem>>>, taskQueue: ProcessQueue[]): Promise<cmdRet> {
    const msg = ['task', ['create', tConfig, tScheme]]
    return websocketHandler(msg, taskQueue)
  },

  async startTask(taskId: number, taskQueue: ProcessQueue[], processId: string): Promise<cmdRet> {
    if (!taskId) return { success: false, message: 'Lack arg.' }
    const msg = ['task', ['start', taskId]]
    return websocketHandler(msg, taskQueue, processId)
  },

  async stopTask(processQueue: ProcessQueue[], processId: string): Promise<cmdRet> {
    if (!processId) return { success: false, message: 'Lack processId.' }
    const msg = ['task', ['stop', processId]]
    return websocketHandler(msg, processQueue, processId)
  },

  async getProgress(taskId: number): Promise<object> {
    if (!taskId) return { success: false, message: 'Lack arg.' }
    const msg = ['task', ['progress', taskId]]
    return websocketHandler(msg)
  }
}
