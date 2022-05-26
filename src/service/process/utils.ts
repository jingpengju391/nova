import os from 'os'
import { execSync } from 'child_process'

function getWinLogicalProcessors(): number[] {
  let dt = execSync('wmic cpu get NumberOfLogicalProcessors')
  let arr = dt.toString().split('\r\n')
  let ret = []
  for (let a of arr) {
    let p = parseInt(a, 10)
    if (!isNaN(p)) ret.push(p)
  }
  return ret
}

export default {
  getProcessorsList(): number[] {
    if (process.platform === 'win32') return getWinLogicalProcessors()
    else return [os.cpus().length] // 支持目前单物理cpu mac / linux
  }
}
