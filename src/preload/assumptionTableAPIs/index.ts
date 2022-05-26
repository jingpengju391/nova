import { ipcRenderer } from 'electron'
import path, { parse, resolve } from 'path'
import fse, { stat, lstat, copy, existsSync, watch, watchFile, readdir, emptyDir, createReadStream } from 'fs-extra'
import fs from 'fs'
export function is(filePath: string): string {
  return parse(filePath).name
}
export default {

  async importDirectory(filePath?:string) {
    if (process.env.ARCHITECTURE === 'bs') {
      const dataInputDirectory = {
        id: 0,
        name: parse(filePath as string).name,
        absolutePath: filePath,
        relativePath: filePath
      }
      return { canceled: false, dataInputDirectory }
    } else {
      let filePath: string
      const result = await ipcRenderer.invoke('dialog:showOpenDialog', {
        properties: ['openDirectory']
      })
      // return result
      if (!result.canceled) {
        filePath = result.filePaths[0]
        const stats = await stat(filePath)
        const dataInputDirectory = {
          id: 0,
          name: parse(filePath).name,
          absolutePath: filePath,
          relativePath: filePath
        }
        return { canceled: false, dataInputDirectory }
      } else {
        return { canceled: true, filePath: null }
      }
    }
  },
  async assumptionTablleCreateDocs(src: string, dist: string, callback: void): Promise<any> {
    return new Promise((resolve, reject) => {
      copy(src, dist, (err) => {
        if (!err) resolve(true)
      })
    })
  },
  async assumptionTabllePasteShear(src: string, dist: string, callback: void): Promise<any> {
    return new Promise((resolve, reject) => {
      copy(src, dist, (err) => {
        if (!err) {
          emptyDir(src, (err) => {
            if (!err) {
              fs.rmdir(src, (err) => {
                if (!err) resolve(true)
              })
            }
          })
        }
      })
    })
  },
  async assumptionTablleDelteFileDist(src: string, callback: void): Promise<any> {
    return new Promise((resolve, reject) => {
      emptyDir(src, (err) => {
        if (!err) {
          fs.rmdir(src, (err) => {
            if (!err) resolve(true)
          })
        }
      })
    })
  },
  async assumptionTablleDelteFile(src: string, callback: void): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.unlink(src, (err) => {
        if (!err) resolve(true)
      })
    })
  },
  isExists(src: string) {
    return existsSync(src)
  },
  isDeleteDir(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const watcher = watchFile(src, (evet, ename) => {
        try {
          resolve(true)
        } catch (err) {
          console.log(err)
        }

        // watcher.close()
      })
    })
  },
  async clearDirWatcher(src: string) {
    fs.unwatchFile(src)
  }
}
