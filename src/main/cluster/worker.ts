import websocketHandler from './websocketHandler'

export default {
  async tagWorkers(tagName: string, data: Array<string>): Promise<object> {
    if (!tagName || !data) {
      return {
        success: false,
        message: 'Lack arg.'
      }
    }
    const msg = ['worker', ['tag', ...data]] // id[]
    return websocketHandler(msg)
  },

  async getWorkerUsage(workerId: string): Promise<object> {
    if (!workerId) {
      return {
        success: false,
        message: 'Lack arg.'
      }
    }
    const msg = ['worker', ['usage', workerId]]
    return websocketHandler(msg)
  },

  /**
   * @api {get} /worker Request One Client
   * @apiGroup Admin
   * @apiName Get worker info
   * @apiParam {String| null} type tag/taskId
   * @apiParam {String} content tag name or taskId
   *
   * @apiSuccess {Object} worker Workers List.
   *
   */
  async queryWorkers(type: string | null, content: string | null): Promise<object> {
    const msg = ['worker', ['query', type, content]]
    return websocketHandler(msg)
  }
}
