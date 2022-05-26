import workspaces from '../controller/workspaces'
import Router from 'koa-router'

const router = new Router()
router.post('/chooseWorkspacePath', workspaces.chooseWorkspacePath)
router.post('/readWorkspacePath', workspaces.readWorkspacePath)
router.post('/upload', workspaces.upload)
router.post('/delete', workspaces.delete)

export default router
