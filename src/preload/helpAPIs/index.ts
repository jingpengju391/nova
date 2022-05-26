import { ipcRenderer } from 'electron'
import fse, { stat, lstat, copy, existsSync, watch, watchFile, readdir, emptyDir, createReadStream } from 'fs-extra'
import fs from 'fs'
import path, { parse, resolve } from 'path'
export default {
  async readDocFile(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(src, 'utf-8', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          //   console.log(data)
          return resolve(data)
        }
      })
    })
  },
  async helpFileInfos(src: string) {
    const vstat = await lstat(src)
    return {
      id: vstat.ino,
      isDirectory: vstat.isDirectory(),
      isFile: vstat.isFile(),
      name: parse(src).base, // ${vstat.isDirectory() ? '/' : ''}
      absolutePath: src,
      basePath: src
    }

    // return vstat
  },
  async readHelpdir(src: string): Promise<any> {
    let tempDirPath
    if(process.env.ARCHITECTURE === 'bs'){
      tempDirPath = 'C:\\working-place\\Nova\\tasks\\helps'
    }else {
      tempDirPath = ipcRenderer.sendSync('app:helpFilesPath') as string
    }
    console.log('tempDirPath-------------',tempDirPath)
    if (src === '') {
      src = tempDirPath
    }
    const files: string[] = await readdir(src)
    // console.log(files)

    return await Promise.all(files.map(async v => {
      const vstat = await lstat(path.join(src, v))
      // console.log(vstat)
      return {
        id: vstat.ino,
        isDirectory: vstat.isDirectory(),
        isFile: vstat.isFile(),
        name: `${parse(v).base}`, // ${vstat.isDirectory() ? '/' : ''}
        absolutePath: resolve(path.join(src, v)),
        basePath: src
      }
    }))
  },
  async readImg(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(src, 'binary', (err, data) => {
        if (err) {
          console.log(err)
        } else {
          //   console.log(data)
          return resolve(data)
        }
      })
    })
  }

}
