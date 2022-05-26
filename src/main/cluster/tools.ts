import websocketHandler from './websocketHandler'

export default {
  async hello() {
    return 'hello world'
  },

  async isActive(namespace: string, processId: string) {
    const msg = ['active', ['active', namespace]] // duplicate for cmd format
    let ret = await websocketHandler(msg)
    if (ret.success) {
      await this.setInformWebSocket(processId)
      await this.setStdWebSocket(processId)
    }
    return ret
  },

  async setInformWebSocket(processId: string) {
    const msg = ['inform', ['inform']]
    return websocketHandler(msg, undefined, processId)
  },

  async setStdWebSocket(processId: string) {
    const msg = ['stdout', ['stdout']]
    return websocketHandler(msg, undefined, processId)
  },

  async cp(sourcePath: string, targetWorker: string, targetPath: string, idx: number) {
    const msg = ['cp', {
      sourcePath,
      targetWorker,
      targetPath,
      idx
    }]
    return websocketHandler(msg)
  }
}
