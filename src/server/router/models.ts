import models from '../controller/models'


import Router from 'koa-router'

const router = new Router()
router.post('/db/queryAllModelsOfWorkspace', models.queryAllModelsOfWorkspace)



export default router
