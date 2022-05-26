import router from './router/index'

import mySocket from './socket/index'
import DBClient from '../service/db/dbClient'
import config from './config'
import schedule from '../service/schedule'
const koaBody = require('koa-body')
const fs = require('fs')
const path = require('path')
const session = require('koa-session')
var Koa = require('koa')
const bodyParser = require('koa-bodyparser')
let timeoutUsers = schedule.timeoutUsers
var app = new Koa()
app.use(async function cors (ctx:any, next:any) {
  const origin = ctx.get('Origin')
  // if (origin && REG_WHITE_LIST.test(origin)) {
  ctx.set('Access-Control-Allow-Origin', origin) // 允许跨域
  ctx.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,HEAD,PUT,DELETE') // 支持的方法
  ctx.set('Access-Control-Allow-Credentials', 'true') // 允许传入Cookie
  ctx.set('Access-Control-Max-Age', 2592000) // 过期时间一个月
  // 如果有特殊的请求头，直接响应
  if (ctx.get('Access-Control-Request-Headers')) {
    ctx.set('Access-Control-Allow-Headers', ctx.get('Access-Control-Request-Headers'))
  }
  // FIX：浏览器某些情况下没有带Origin头
  ctx.set('Vary', 'Origin')

  // 如果是 OPTIONS 请求，则直接返回
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204
    return
  }
  // }

  await next()
})

var options = {
  key: fs.readFileSync(path.join(__dirname, '../../../src/server/cert/deeplightconnect.com.key')), // 私钥文件路径
  cert: fs.readFileSync(path.join(__dirname, '../../../src/server/cert/deeplightconnect.com.pem')) // 证书文件路径
}
var server = require('https').createServer(options, app.callback())
exports.server = server

mySocket.init()

// let config = require('./config')
server.listen(config.port)
console.log('启动端口：', config.port)

require('./mongoDB')

app.use(async (ctx:any, next:any) => {
  let username = ctx.session.username
  let userSpace = ctx.session.username + '/' + ctx.session.spaceNum
  if (!username && (['/user/login', '/user/register'].indexOf(ctx.request.originalUrl) === -1)) {
    ctx.body = {
      msg: '请重新登录',
      status: config.status.unLogin
    }
    return
  }
  if (timeoutUsers[userSpace]) {
    DBClient.destroyLater(userSpace)
  } else {
    if (['/user/login', '/user/register', '/get-apis/workspaces/createWorkspacePath', '/get-apis/initializeWorkspace', '/workspaces/readWorkspacePath', '/workspaces/upload', '/workspaces/delete'].indexOf(ctx.request.originalUrl) > -1) {
    } else {
      console.log('此时应禁止请求')

      ctx.body = {
        msg: '请重新登录',
        status: config.status.unLogin
      }
      return
    }
  }
  await next()
})

app.use(koaBody({
  multipart: true, // 开启文件上传
  formidable: {
    maxFileSize: 2000 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M
    keepExtensions: true // 保留文件拓展名
  },
  formLimit: '10mb',
  jsonLimit: '10mb',
  textLimit: '10mb'
}))

app.use(bodyParser({
  formLimit: '10mb',
  jsonLimit: '10mb',
  textLimit: '10mb'
}))
app.use(async (ctx:any, next:any) => {
  try {
    await next()
  } catch (e:any) {
    ctx.body = {
      msg: e.message,
      status: 700
    }
  }
})

app.keys = ['now it is useful!']
const CONFIG = {
  key: 'koa:sess', // cookie key (default is koa:sess)
  maxAge: config.logoutTime, // cookie的过期时间 maxAge in ms (default is 1 days)
  overwrite: true, // 是否可以overwrite    (默认default true)
  httpOnly: true, // cookie是否只有服务器端可以访问 httpOnly or not (default true)
  signed: true, // 签名默认true
  rolling: false, // 在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
  renew: true, // (boolean) renew session when session is nearly expired,
  sameSite: 'none',
  secure: true
}
app.use(session(CONFIG, app))

app.use(router.routes()).use(router.allowedMethods())
