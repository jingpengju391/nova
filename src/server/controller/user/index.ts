import workingSpace from '../../../service/workingSpace'
import DBClient from '../../../service/db/dbClient'
const compressing = require('compressing')
const path = require('path')
const fs = require('fs')
let UserModel = require('../../schema/user')
const crypto = require('crypto')
function setPassword(pwd:String, crypto:any) {
  let password = `${pwd}guoyakun`
  const md5 = crypto.createHash('md5')
  md5.update(password)
  var newpwd = md5.digest('hex')
  return newpwd
}

class User {
  async register(ctx: any) {
    let { username, password } = ctx.request.body

    let user = await UserModel.findOne({ username })
    console.log('user----------', user)
    if (user) {
      ctx.body = {
        msg: '不可重复注册'
      }
      return
    }

    password = setPassword(password, crypto)

    var userModel = new UserModel({
      username,
      password
    })

    let save = new Promise((resolve, reject) => {
      userModel.save((err:any, res:any) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
    })
    let data
    try {
      data = await save
    } catch (e) {
      console.log('e:', e)
    }
    ctx.body = {
      data,
      status: 200
    }
    // let res = await UserModel.find({username})
  }

  async login(ctx: any) {
    let { username, password, spaceNum } = ctx.request.body
    if (spaceNum === undefined) {
      spaceNum = 0
    }
    password = setPassword(password, crypto)
    let user = await UserModel.findOne({ username, password })
    if (user) {
      // ctx.session.userState = true
      ctx.session.username = username
      ctx.session.spaceNum = spaceNum
      let userSpace = username + '/' + spaceNum
      workingSpace.username = ctx.session.username
      workingSpace.userSpace = userSpace
      let myUsernameForderPath = path.join(workingSpace.getMyUsernameDir())
      let myForderPath = path.join(workingSpace.getMyDir(userSpace))
      if (!fs.existsSync(myUsernameForderPath)) {
        try {
          fs.mkdirSync(myUsernameForderPath, { recursive: true })
        } catch (e) {
          console.log(e)
        }
      }
      let isExists = fs.existsSync(myForderPath)
      if (isExists) {
        console.log('我自己的这个工作区文件夹已经存在')
      } else {
        fs.mkdirSync(myForderPath, { recursive: true })
        await compressing.zip.uncompress(path.join(workingSpace.getOriginalModelPath()), myForderPath)
        console.log('创建了我自己的文件夹')
      }

      ctx.body = {
        msg: '登录成功',
        data: {
          username,
          userSpace
        },
        status: 200
      }
    } else {
      ctx.body = {
        msg: '用户名或密码错误'
      }
    }
  }

  async logout(ctx: any) {
    let userSpace = ctx.session.username + '/' + ctx.session.spaceNum
    delete ctx.session.username
    delete ctx.session.spaceNum

    DBClient.destroyNow(userSpace)
    ctx.body = {
      msg: '已登出',
      data: {
        userSpace
      },
      status: 200
    }
  }
}

export default new User()
