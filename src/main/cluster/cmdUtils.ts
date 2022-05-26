import fs from 'fs'
import path from 'path'
import { pathInfo } from './type'

// const fsExtra = require('fs-extra')

export default {
  async readFileAsync(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })
  },

  async writeFileAsync(filePath: string, data: any): Promise<boolean> {
    return new Promise(resolve => {
      fs.writeFile(filePath, data, err => {
        if (!err) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  },

  async appendFileAsync(filePath: string, data: any): Promise<boolean> {
    return new Promise(resolve => {
      fs.appendFile(filePath, data, err => {
        if (!err) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  },

  async getCsvLength(filePath: string): Promise<number> {
    const buf = await this.readFileAsync(filePath)
    const dt = buf.toString()
    const arr = dt.split('\n')
      .filter(function(ele: string) {
        return ele && ele.trim()
      })
    return arr.length
  },

  // getMntPathFromCsvName(csvName: string): string {
  //   return path.join(process.env.MNT, 'csv', csvName)
  // },
  //
  // getMntOutputPath(jobId: number, idx: number): string {
  //   return path.join(process.env.MNT, 'output', jobId.toString(), `output_${idx}`)
  // },
  //
  // getMntResultDir(jobId: number): string {
  //   return path.join(process.env.MNT, 'result', jobId.toString())
  // },
  //
  // getPort(): number {
  //   return parseInt(process.env.PORT, 10)
  // },

  getServerUrl(): string {
    // return `ws://${process.env.IP}:${process.env.PORT}`
    return 'ws://127.0.0.1:8090'
  },

  getIdxFilenamesInDir(dir: string): Array<string> {
    let ret: string[] = []
    fs.readdirSync(dir)
      .forEach(file => {
        if (!file.startsWith('.DS_Store')) ret.push(file)
      })
    return ret
  },

  // async copyDir(src: string, dst: string): Promise<unknown> {
  //   return new Promise(resolve => {
  //     fsExtra.copy(src, dst, err => {
  //       if (err) {
  //         console.error(err)
  //         resolve(false)
  //       } else {
  //         resolve(true)
  //       }
  //     })
  //   })
  // },
  //
  // async isFileExists(filepath: string): Promise<boolean> {
  //   return new Promise(resolve => {
  //     fs.stat(filepath, function(err, stat) {
  //       if (stat && stat.isFile()) {
  //         resolve(true)
  //       } else {
  //         resolve(false)
  //       }
  //     })
  //   })
  // },

  async removeDir(dir: string): Promise<void> {
    fs.rmdirSync(dir, { recursive: true })
  },

  async getFilesInDir(dir: string, ret?: pathInfo, base:string = './'): Promise<pathInfo> {
    !ret && (ret = { absolute: [], relative: [] })
    let files = fs.readdirSync(dir)
    for (const item of files) {
      let fPath = path.join(dir, item)
      let stat = fs.statSync(fPath)
      if (stat.isDirectory() === true) {
        await this.getFilesInDir(fPath, ret)
      }
      if (stat.isFile() === true) {
        ret.absolute.push(fPath)
        ret.relative.push(path.join(base, item))
      }
    }
    return ret
  }
}
