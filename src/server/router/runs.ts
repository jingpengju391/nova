import dataInputs from '../controller/dataInputs'


import Router from 'koa-router'

const router = new Router()
router.post('/db/queryAllDataInputsOfWorkspace', dataInputs.queryAllDataInputsOfWorkspace)



export default router
