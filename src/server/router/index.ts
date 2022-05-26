import getApis from './getApis'
import dataInputs from './dataInputs'
import assumptionTable from './assumptionTable'
import models from './models'
import outputs from './outputs'
import runs from './runs'
import tasks from './tasks'
import workspaces from './workspaces'
import user from './user'
import settings from './settings'
import dataClean from './dataClean'

console.log('进入了router-----------------------')

const Router = require('koa-router')
const send = require('koa-send')

const router = new Router()

// 指定一个url匹配
router.get('/', async (ctx: any) => {
  ctx.type = 'html'
  ctx.body = '<h1>welcom to Nova!</h1>'
})

router.get('/download/:name', async function(ctx:any) {
  const name = ctx.params.name
  const path = `src/dist-server/upload/${name}`
  console.log('download file path', path)
  ctx.attachment(name)
  await send(ctx, path)
})

router.use('/get-apis', getApis.routes(), getApis.allowedMethods())
router.use('/dataInputs', dataInputs.routes(), dataInputs.allowedMethods())
router.use('/assumptionVarPages', assumptionTable.routes(), assumptionTable.allowedMethods())
router.use('/models', models.routes(), models.allowedMethods())
router.use('/outputs', outputs.routes(), outputs.allowedMethods())
router.use('/runs', runs.routes(), runs.allowedMethods())
router.use('/tasks', dataInputs.routes(), tasks.allowedMethods())
router.use('/workspaces', workspaces.routes(), workspaces.allowedMethods())
router.use('/settings', settings.routes(), settings.allowedMethods())

router.use('/user', user.routes(), user.allowedMethods())
router.use('/dataClean', dataClean.routes(), dataClean.allowedMethods())

export default router
