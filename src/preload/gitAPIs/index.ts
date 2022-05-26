import { SimpleGit } from 'simple-git'
import { gitConfig } from '@shared/PrivateDeployment'

const simpleGit = require('simple-git')

export default {
  async initGit(path:string, config:gitConfig) {
    const git:SimpleGit = simpleGit(path)
    return await git.init()
      .addRemote('origin', config.url)
      .addConfig('user.name', config.username)
      .addConfig('user.email', config.email)
  },
  async commitGit(path:string, commitInfo:string) {
    const git:SimpleGit = simpleGit(path)
    return await git
      .add('./*')
      .commit(commitInfo)
  },
  async pullGit(path:string) {
    const git:SimpleGit = simpleGit(path)
    return await git.pull('origin', 'master')
  },
  async pushGit(path:string) {
    const git:SimpleGit = simpleGit(path)
    return await git.push('origin', 'master')
  }
  // async diffGit(path:string) {
  //   const git:SimpleGit = simpleGit(path)
  //   // return await git.diff({
  //   //   baseDir: path,
  //   //   binary: 'git',
  //   //   maxConcurrentProcesses: 6
  //   // }, (a, b) => {
  //   //   console.log(a, b)
  //   // })
  //   const status = await git.status()
  //   console.log(process.cwd(), status, 898989)
  //   const diff = await git.diff({
  //     baseDir: `${path}/Models_1635853760387.json`,
  //     binary: 'git',
  //     maxConcurrentProcesses: 6
  //   }, (a, b, c) => {
  //     console.log(a, b, c, 8888)
  //   })
  //   console.log(diff, 9999)
  // }
}

// const simpleGit = git(filePath)
// const status = await simpleGit.status()
// const diff = await simpleGit.diff((a, b, c) => {
//   console.log(a, b, c, 8888)
// })
// console.log(diff, 9999)
