import { ipcRenderer } from 'electron'
import { stat, lstat, readdir, createReadStream } from 'fs-extra'
import path, { parse, resolve } from 'path'
import type { DataInputFile, DirectoryFileDescriptor, CsvFileBody } from '@shared/dataModelTypes'
import DBClient from '../../service/db/dbClient'
import { DataInputPreviewReachLineLimit } from '@shared/errors'
import fs from 'fs'
const parseCsv = require('csv-parse')
const compressing = require('compressing')

export function createDataInputName(filePath: string): string {
  return parse(filePath).name
}

export function getDataInputSizeString(size: number): string {
  let i = 0
  while (size > 1000 && i < 4) {
    size = Math.round(size / 1000)
    i++
  }
  switch (i) {
    case 1:
      return size.toString() + 'KB'
    case 2:
      return size.toString() + 'MB'
    case 3:
      return size.toString() + 'GB'
    case 4:
      return size.toString() + 'TB'
    default:
      return size.toString() + 'B'
  }
}
let dataInputAPIs = {
  userSpace: '',
  pathParse(p: string) {
    return parse(p)
  },
  pathResolve(p: string) {
    return resolve(p)
  },
  pathJoin(...args: string[]) {
    return path.normalize(path.join(...args))
  },
  getDocFolder(): string { // 不用迁移到bs
    const documentsPath = ipcRenderer.sendSync('app:docDirectory') as string
    return documentsPath
  },
  async readDirectory(p: string) {
    try {
      const files: string[] = await readdir(p)
      return await Promise.all(files.map(async v => {
        const vstat = await lstat(path.join(p, v))
        return {
          id: vstat.ino,
          isBlockDevice: vstat.isBlockDevice(),
          isCharacterDevice: vstat.isCharacterDevice(),
          isDirectory: vstat.isDirectory(),
          isFIFO: vstat.isFIFO(),
          isFile: vstat.isFile(),
          isSocket: vstat.isSocket(),
          isSymbolicLink: vstat.isSymbolicLink(),
          name: `${parse(v).base}${vstat.isDirectory() ? '/' : ''}`,
          absolutePath: resolve(path.join(p, v)),
          size: getDataInputSizeString(vstat.size),
          createdAt: vstat.birthtime.toLocaleString('zh-CN'),
          updatedAt: vstat.mtime.toLocaleString('zh-CN')
        } as DirectoryFileDescriptor
      }))
    } catch (e) {
      console.log(e)
    }
  },
  async labelReadDirectory(p: string, label: string) {
    let tmp: string = ''
    if (fs.existsSync(path.join(p, label, label))) {
      tmp = path.join(p, label, label)
    } else if (fs.existsSync(path.join(p, label, label.toLowerCase()))) {
      tmp = path.join(p, label, label.toLowerCase())
    }
    p = tmp
    try {
      const files: string[] = await readdir(p)
      return await Promise.all(files.map(async v => {
        const vstat = await lstat(path.join(p, v))
        return {
          id: vstat.ino,
          isBlockDevice: vstat.isBlockDevice(),
          isCharacterDevice: vstat.isCharacterDevice(),
          isDirectory: vstat.isDirectory(),
          isFIFO: vstat.isFIFO(),
          isFile: vstat.isFile(),
          isSocket: vstat.isSocket(),
          isSymbolicLink: vstat.isSymbolicLink(),
          name: `${parse(v).base}${vstat.isDirectory() ? '/' : ''}`,
          absolutePath: resolve(path.join(p, v)),
          size: getDataInputSizeString(vstat.size),
          createdAt: vstat.birthtime.toLocaleString('zh-CN'),
          updatedAt: vstat.mtime.toLocaleString('zh-CN')
        } as DirectoryFileDescriptor
      }))
    } catch (e) {
      console.log(e)
    }
  },
  async downloadFile(p: string) {
    const exist = fs.existsSync(p)
    if (!exist) {
      return null
    } else {
      const pNames = p.split('/')
      const uploadPath = path.join(__dirname, '../../upload')
      const upload = fs.existsSync(uploadPath)
      if (!upload) {
        await fs.mkdirSync(uploadPath)
      }
      console.log('file zip', path.join(uploadPath, pNames[pNames.length - 1]) + '.zip')
      const result = await compressing.zip.compressDir(p, path.join(uploadPath, pNames[pNames.length - 1]) + '.zip')
      if (result !== undefined) {
        return null
      }
      return pNames[pNames.length - 1] + '.zip'
    }
  },
  async import(relativePath: string) {
    let filePath: string
    const result = await ipcRenderer.invoke('dialog:showOpenDialog', {
      properties: ['openFile'],
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    console.log(result, 'result')
    if (!result.canceled) {
      filePath = result.filePaths[0]
      const stats = await stat(filePath)
      const isRelative = filePath.indexOf(relativePath) !== -1
      const dataInputFile = {
        id: 0,
        name: createDataInputName(filePath),
        size: getDataInputSizeString(stats.size),
        absolutePath: filePath,
        relativePath: isRelative ? (filePath.length <= relativePath.length + 1 ? '' : filePath.substr(relativePath.length + 1)) : filePath,
        createdAt: stats.birthtime.toLocaleString('zh-CN'),
        updatedAt: stats.mtime.toLocaleString('zh-CN'),
        isRelative: isRelative
      }
      return { canceled: false, dataInputFile }
    } else {
      return { canceled: true, dataInputFile: null }
    }
  },
  async dataSourceImport(relativePath: string) {
    // let filePath: string
    const result = await ipcRenderer.invoke('dialog:showOpenDialog', {
      properties: ['multiSelections'],
      filters: [{ name: 'CSV', extensions: ['csv'] }]
    })
    if (!result.canceled) {
      const dataInputFiles: any = []
      await Promise.all(result.filePaths.map(async (item: string) => {
        const stats = await stat(item)
        const time = new Date().toLocaleString('zh-CN')
        const isRelative = item.indexOf(relativePath) !== -1
        const dataInputFile = {
          id: 0,
          name: createDataInputName(item),
          size: getDataInputSizeString(stats.size),
          absolutePath: item,
          relativePath: isRelative ? (item.length <= relativePath.length + 1 ? '' : item.substr(relativePath.length + 1)) : item,
          createdAt: time,
          updatedAt: time,
          isRelative: isRelative
        }
        dataInputFiles.push(dataInputFile)
        return { canceled: false, dataInputFiles }
      }))
      return { canceled: false, dataInputFiles }
    } else {
      return { canceled: true, dataInputFiles: null }
    }
  },
  async getDataInputPreview(filePath: string) {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath)
      const maxLineCount = 15
      let lines = [] as string[]
      let data = ''
      stream.on('data', moreData => {
        data += moreData
        lines = data.split('\n')
        if (lines.length > maxLineCount) {
          lines = lines.slice(0, maxLineCount)
          stream.destroy(new DataInputPreviewReachLineLimit('Reach the line count limit'))
        }
      })
      stream.on('error', err => {
        if (err instanceof DataInputPreviewReachLineLimit) {
          resolve(lines)
        } else {
          reject(err)
        }
      })
      stream.on('end', () => {
        resolve(lines)
      })
    })
  },
  async getDataInputMorePreview(filePath: string, limit: number = 120) {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath)
      const maxLineCount = limit
      let lines = [] as string[]
      let data = ''
      stream.on('data', moreData => {
        data += moreData
        lines = data.split('\n')
        if (lines.length > maxLineCount) {
          lines = lines.slice(0, maxLineCount)
          stream.destroy(new DataInputPreviewReachLineLimit('Reach the line count limit'))
        }
      })
      stream.on('error', err => {
        if (err instanceof DataInputPreviewReachLineLimit) {
          resolve(lines)
        } else {
          reject(err)
        }
      })
      stream.on('end', () => {
        resolve(lines)
      })
    })
  },
  async readCsvFileMeta(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const stream = createReadStream(filePath)
      const maxLineCount = 1
      let lines = [] as string[]
      let data = ''
      stream.on('data', moreData => {
        data += moreData
        lines = data.split('\n')
        if (lines.length > maxLineCount) {
          lines = lines[0].split(',')
          stream.destroy(new DataInputPreviewReachLineLimit('Reach the line count limit'))
        }
      })
      stream.on('error', err => {
        if (err instanceof DataInputPreviewReachLineLimit) {
          resolve(lines)
        } else {
          reject(err)
        }
      })
      stream.on('end', () => {
        resolve(lines[0].split(','))
      })
    })
  },
  async readCsvFile(filePath: string, limit: number = 20): Promise<CsvFileBody> {
    const name = getName(filePath)
    const options = {}
    const parser = createReadStream(filePath).pipe(parseCsv(options))
    const list = []
    for await (const record of parser) {
      list.push(record)
      if (list.length >= limit + 1) { // the first line is header row
        break
      }
    }
    parser.end()
    const [columns, ...rows] = list
    return { name, path: filePath, columns, rows }
  },
  readCsvFileInfo(filePath: string) {
    return new Promise((resolve, reject) => {
      try {
        stat(filePath).then(res => {
          resolve(res)
        })
      } catch (error) {
        reject(error)
      }
    })
  },
  db: {
    queryAllDataInputsOfWorkspace(workspaceId: number) {
      const timeNow = new Date()
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs').where('workspaceID', workspaceId)
        .select('id', 'name', 'path', 'absolutePath', 'modelId', 'blockKey', 'blockVal', 'isRelative', 'blockId')
        .orderBy('modelId')
        .orderBy('id')
        .then(results => {
          return Promise.all(results.map(result => {
            const isWin = process.platform === 'win32'
            const path = result.path ? (isWin
              ? result.path.replace(/\//g, '\\')
              : result.path.replace(/\\/g, '/')) : ''
            const absolutePath = result.absolutePath ? (isWin
              ? result.absolutePath.replace(/\//g, '\\')
              : result.absolutePath.replace(/\\/g, '/')) : ''
            return {
              id: result.id,
              name: result.name,
              size: null,
              absolutePath: absolutePath,
              relativePath: path,
              createdAt: timeNow.toLocaleString('zh-CN'),
              updatedAt: timeNow.toLocaleString('zh-CN'),
              modelId: result.modelId,
              blockKey: result.blockKey,
              blockVal: result.blockVal,
              isRelative: !!result.isRelative,
              blockId: result.blockId
            }
          }))
        })
    },
    queryAllDataInputsByModelId(id: number) {
      const timeNow = new Date().getTime()
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .where('modelId', id)
        .select('id', 'name', 'path', 'absolutePath', 'modelId', 'blockKey', 'blockVal', 'isRelative')
        .then(results => {
          console.log(results, 'queryAllDataInputsByModelId')
          return Promise.all(results.map(result => {
            return {
              id: result.id,
              name: result.name,
              size: null,
              absolutePath: result.absolutePath,
              relativePath: result.path,
              createdAt: timeNow.toLocaleString('zh-CN'),
              updatedAt: timeNow.toLocaleString('zh-CN'),
              modelId: result.modelId,
              blockKey: result.blockKey,
              blockVal: result.blockVal,
              isRelative: !!result.isRelative
            }
          }))
        })
    },
    queryDataInput(id: number) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .where('id', id)
        .select('*')
        .first()
        .then(result => {
          if (result) {
            return { ...result, absolutePath: result.absolutePath ?? result.path }
          }
          return undefined
        })
    },
    queryDataInputs(ids: number[]) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .where('id', ids)
        .select('*')
        .first()
        .then(results => {
          if (results) {
            return Promise.all(results.map((result: any) => {
              return { ...result, absolutePath: result.absolutePath ?? result.path }
            }))
          }

          return results
        })
    },
    // TODO: using workspace info from vuex
    insertDataInput(dataInput: DataInputFile, workspaceId: number) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs').insert({
        name: dataInput.name,
        path: dataInput.relativePath,
        absolutePath: dataInput.absolutePath,
        workspaceID: workspaceId,
        modelId: dataInput.modelId,
        blockId: dataInput.blockId,
        blockKey: dataInput.blockKey,
        blockVal: dataInput.blockVal,
        isRelative: dataInput.isRelative
      }).then(([id]: any) => {
        // TODO: sqlite3 do not support returning() of knex, so the result will only has id column, and it's an array
        return id
      })
    },
    async insertDataInputBatch(dataInput: DataInputFile[], workspaceId: number) {
      const params = JSON.parse(JSON.stringify(dataInput))
      const ids: number[] = []
      await DBClient.getInstance(dataInputAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          const id: number[] = await trx('data_inputs').insert({
            name: item.name,
            path: item.relativePath,
            absolutePath: item.absolutePath,
            workspaceID: workspaceId,
            modelId: item.modelId,
            blockKey: item.blockKey,
            blockVal: item.blockVal,
            isRelative: item.isRelative
          })
          ids.push(...id)
        }
      })
      return ids
    },
    deleteDataInputs(dataInputIDs: number[]) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .whereIn('id', dataInputIDs)
        .delete()
        .then((result: any) => {
          // TODO: sqlite3 do not support returning() of knex, so the result will only has id column
          return result
        })
    },
    deleteDataInputsInModel(modelIds: number[]) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .whereIn('modelId', modelIds)
        .delete()
        .then((result: any) => {
          // TODO: sqlite3 do not support returning() of knex, so the result will only has id column
          return result
        })
    },
    updateDataInputName(id: number, newName: string) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .where('id', id)
        .then((result: any) => {
          return result
        })
    },
    updateDataInput(dataInput: DataInputFile) {
      return DBClient.getInstance(dataInputAPIs.userSpace)('data_inputs')
        .where('id', dataInput.id)
        .update({
          name: dataInput.name,
          path: dataInput.relativePath,
          absolutePath: dataInput.absolutePath,
          blockKey: dataInput.blockKey,
          blockVal: dataInput.blockVal,
          isRelative: dataInput.isRelative
        })
        .then((result: any) => {
          return result
        })
    },
    async updateDataInputBatch(dataInput: DataInputFile[]) {
      return await DBClient.getInstance(dataInputAPIs.userSpace).transaction(async trx => {
        const result = []
        for (let i = 0; i < dataInput.length; i++) {
          const item = dataInput[i]
          const res = await trx('data_inputs')
            .where('id', item.id)
            .update({
              path: item.relativePath,
              absolutePath: item.absolutePath,
              isRelative: item.isRelative
            })
          result.push(res)
        }
        return result
      })
    }
  }
}

// private

function getName(filePath: string) {
  return path.basename(filePath, path.extname(filePath))
}

export default dataInputAPIs
