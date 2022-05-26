import websocketHandler from './websocketHandler'

export default {

  async createJob(taskId: number, start: number, end: number): Promise<object> {
    if (!taskId || !start || !end) return { success: false, message: 'Lack arg.' }
    const msg = ['job', ['create', `${start}_${end}`]] // TODO expand to multi args
    return websocketHandler(msg)
  },

  async startJob(jobId: number, workerId: string, csvName: string): Promise<object> {
    if (!jobId || !workerId || !csvName) return { success: false, message: 'Lack arg.' }
    // TODO 默认 idx = 0 此接口目前不暴露使用
    const msg = ['job', ['run', jobId, 0, workerId, csvName, null]]
    return websocketHandler(msg)
  },

  async stopJob(jobId: number): Promise<object> {
    if (!jobId) return { success: false, message: 'Lack arg.' }
    const msg = ['job', ['stop', jobId]]
    return websocketHandler(msg)
  }

}
