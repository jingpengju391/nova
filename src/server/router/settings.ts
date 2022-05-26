import settings from '../controller/settings'
import Router from 'koa-router'

const router = new Router()
router.post('/app/update', settings.updateAppSettings)
router.post('/app/query', settings.queryAppSettings)
router.post('/task/update', settings.updateTaskSettings)
router.post('/task/query', settings.queryTaskSettings)
router.post('/runner/update', settings.updateRunnerSettings)
router.post('/runner/query', settings.queryRunnerSettings)

export default router
