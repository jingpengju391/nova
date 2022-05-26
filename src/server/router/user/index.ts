import user from '../../controller/user/index'


import Router from 'koa-router'

const router = new Router()
router.post('/register', user.register)
router.post('/login', user.login)
router.post('/logout', user.logout)



export default router
