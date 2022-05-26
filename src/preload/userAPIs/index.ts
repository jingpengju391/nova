import { ipcRenderer } from 'electron'
import { ensureDirSync } from 'fs-extra'
const serialNumber = require('serial-number')
const getmac = require('getmac').default
const moment = require('moment')
const schedule = require('node-schedule')
// import getma
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'
// const isExist = (path: String) => { // 判断文件夹是否存在, 不存在创建一个
//   if (!fs.existsSync(path)) {
//     fs.mkdirSync(path)
//   }
// }

const decrypt = (hash: any) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])
  return decrpyted.toString()
}

let userAPIs = {
  username: '',
  getUserDataDir() {
    const userDataDir = ipcRenderer.sendSync('app:userDirectory')
    ensureDirSync(userDataDir)
    return userDataDir
  },
  async firstCheckLocalLicense() {
    let userDataDir = userAPIs.getUserDataDir()
    let destination = path.join(userDataDir, '/license.key')
    return await checkLicense(destination)
  },
  async checkLicenseSchedule() {
    const rule = new schedule.RecurrenceRule()
    rule.minute = [0, 30]
    // console.log(rule.minute)
    return await new Promise((resolve, reject) => {
      schedule.scheduleJob(rule, async function () {
        console.log('执行定时任务')
        let userDataDir = userAPIs.getUserDataDir()
        let destination = path.join(userDataDir, '/license.key')
        resolve(await checkLicense(destination))
      })
    })
  },
  async authorize(licensePath: string) {
    // let fileName = path.basename(licensePath)
    // if (fileName !== 'license.key') {
    //   return false
    // }
    let userDataDir = userAPIs.getUserDataDir()
    let destination:string = path.join(userDataDir, '/license.key')
    fs.copyFileSync(licensePath, destination)
    return await checkLicense(destination)
  },
  async showPhysicalAddress() {
    try {
      return await new Promise((resolve, reject) => {
        serialNumber((err: any, value:any) => {
          if (err) {
            resolve('showPhysicalAddress failed')
          } else {
            resolve(value)
          }
        })
      })
    } catch (e) {
      console.log(e)
      return 'showPhysicalAddress failed'
    }
  },
  async showPhysicalAddressOld() {
    try {
      return getmac()
    } catch (e) {
      console.log(e)
      return 'showPhysicalAddressOld failed'
    }
  }
}

export default userAPIs

async function checkLicense(licenseDestination: string) {
  let isExists = fs.existsSync(licenseDestination)
  if (!isExists) {
    return {
      isAuthor: false,
      msg: '授权文件不存在本地缓存中'
    }
  }
  let data: any = fs.readFileSync(licenseDestination, 'utf-8')
  let originalTxt = decrypt(JSON.parse(data))

  let physicalAddress = originalTxt.split(';')[1]
  let expireDate = originalTxt.split(';')[0]

  // console.log('还剩',moment(expireDate).diff(moment().format('YYYY-MM-DD'), 'days'),'天')
  if ((physicalAddress === await userAPIs.showPhysicalAddress() || physicalAddress === getmac()) && moment(expireDate).diff(moment().format('YYYY-MM-DD'), 'days') >= 0) {
    return {
      isAuthor: true,
      msg: '授权截止日期:' + expireDate + '，还剩' + moment(expireDate).diff(moment().format('YYYY-MM-DD'), 'days') + '天'
    }
  } else {
    return {
      isAuthor: false,
      msg: '机器唯一编码不对或者授权期限过期'
    }
  }
}
