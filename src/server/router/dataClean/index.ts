import dataClean from '../../controller/dataClean/index'


import Router from 'koa-router'

const router = new Router()
router.post('/run', dataClean.run)

export default router
