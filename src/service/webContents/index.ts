let mySocket: any
if (process.env.ARCHITECTURE === 'bs') {
  mySocket = require('../../server/socket')
}
export default {
  send: (userSpace:string, currentWindow:any, channel: string, ...args: any[]):void => {
    if (process.env.ARCHITECTURE === 'bs') {
      mySocket.sendToWindow(userSpace, currentWindow, channel, args)
    } else if (currentWindow) {
      currentWindow.send(channel, ...args)
    }
  }
}
