import type { DataInputFile } from '@shared/dataModelTypes'
import type { DataInfo } from '@shared/dataModelTypes/dataInputs'
import { useDataInputsAPIs } from '../../hooks/apis'
import modelsDataSource from './modelsDataSource'
import { ArrayToString } from '@shared/dataModelTypes/dataInputs'
import type { ModelNavigationNode } from '@shared/dataModelTypes/models/models'
import { CopyTypeBlock } from '@shared/dataModelTypes/models/helpers'
export class DataInputDataSource {
  #dataModelMap = new Map<number, DataInputFile[]>()
  #dataBlockMap = new Map<number, DataInputFile[]>()
  clear() {
    this.#dataModelMap.clear()
    this.#dataBlockMap.clear()
  }

  addNewEntriesToDataMap(newEntries: DataInputFile[]) {
    let currentID: number | undefined
    let currentList: DataInputFile[] | undefined
    newEntries.forEach(fileItem => {
      if (fileItem) {
        if (currentID === undefined) {
          currentID = fileItem.modelId
          currentList = this.#dataModelMap.get(currentID)
          if (currentList === undefined) {
            currentList = [] as DataInputFile[]
            this.#dataModelMap.set(currentID, currentList)
            currentList.push(fileItem)
          } else {
            currentList.push(fileItem)
          }
        } else if (currentID === fileItem.modelId) {
          currentList?.push(fileItem)
        } else {
          currentID = fileItem.modelId
          currentList = this.#dataModelMap.get(currentID)
          if (currentList === undefined) {
            currentList = [] as DataInputFile[]
            this.#dataModelMap.set(currentID, currentList)
            currentList.push(fileItem)
          } else {
            currentList.push(fileItem)
          }
        }
      }
    })
  }

  addNewEntriesToDataBlockMap(newEntries: DataInputFile[]) {
    let currentID: number | undefined
    let currentList: DataInputFile[] | undefined
    newEntries.forEach(fileItem => {
      if (fileItem) {
        if (currentID === undefined) {
          currentID = fileItem.blockId
          currentList = this.#dataBlockMap.get(currentID)
          if (currentList === undefined) {
            currentList = [] as DataInputFile[]
            this.#dataBlockMap.set(currentID, currentList)
            currentList.push(fileItem)
          } else {
            currentList.push(fileItem)
          }
        } else if (currentID === fileItem.blockId) {
          currentList?.push(fileItem)
        } else {
          currentID = fileItem.blockId
          currentList = this.#dataBlockMap.get(currentID)
          if (currentList === undefined) {
            currentList = [] as DataInputFile[]
            this.#dataBlockMap.set(currentID, currentList)
            currentList.push(fileItem)
          } else {
            currentList.push(fileItem)
          }
        }
      }
    })
  }

  deleteModel(modelId: number) {
    this.#dataModelMap.delete(modelId)
  }

  deleteBlock(blockId: number) {
    this.#dataBlockMap.delete(blockId)
  }

  deleteFile(modelId: number | undefined, filesId: number[]) {
    if (modelId === undefined) return
    const fileList = this.#dataModelMap.get(modelId)
    this.#dataModelMap.set(modelId, fileList!.filter(f => !filesId.includes(f.id)))
  }

  deleteBlockFile(blockId: number | undefined, filesId: number[]) {
    if (blockId === undefined) return
    const fileList = this.#dataBlockMap.get(blockId)
    this.#dataBlockMap.set(blockId, fileList!.filter(f => !filesId.includes(f.id)))
  }

  updateFileName(modelId: number | undefined, update: Partial<DataInputFile>, index: number) {
    if (modelId === undefined) return
    const fileList = this.#dataModelMap.get(modelId)
    if (fileList === undefined) return
    if (index > -1) {
      fileList[index].name = update.name!
    }
  }

  updateFiles(updateFiles: DataInputFile) {
    const filesList = this.#dataModelMap.get(updateFiles.modelId)
    if (filesList === undefined) return
    filesList?.map((item, index) => {
      if (item.id === updateFiles.id) {
        filesList[index] = JSON.parse(JSON.stringify(updateFiles))
      }
    })
    this.#dataModelMap.set(updateFiles.modelId, filesList)
  }

  updateFileBlockName(blockId: number | undefined, update: Partial<DataInputFile>, index: number) {
    if (blockId === undefined) return
    const fileList = this.#dataBlockMap.get(blockId)
    if (fileList === undefined) return
    if (index > -1) {
      fileList[index].name = update.name!
    }
  }

  getCurrentFile(id: number): DataInputFile[] {
    return this.#dataModelMap.get(id)!
  }

  getCurrentBlockFile(id: number): DataInputFile[] {
    return this.#dataBlockMap.get(id)!
  }

  queryCurrentDataInfo(data: DataInfo[]) {
    return new Promise((resolve) => {
      const obj: any = []
      data.forEach((item: DataInfo) => {
        const dataMappingItems = modelsDataSource.getDataMappingItemsForAModel(item.modelId)
        useDataInputsAPIs().db.queryAllDataInputsByModelId(item.modelId).then(res => {
          res.forEach((iter: any) => {
            const temporary: any = {
              fileName: iter.absolutePath,
              dataType: iter.absolutePath.split('.')[1].toUpperCase(),
              dataFieLds: {}
            }
            const oldBlockValArr = iter.blockVal.split(ArrayToString)
            const newBlockValArr = oldBlockValArr.filter((_: any, index: number) => index)
            dataMappingItems.forEach((itee: any, index: number) => {
              temporary.dataFieLds[itee.name] = {
                field: newBlockValArr[index],
                type: itee.type
              }
            })
            obj.push(temporary)
          })
        })
      })
      resolve(obj)
    })
  }

  async deleteDataInputsInModelWithDBSync(modelId: number): Promise<any> {
    return useDataInputsAPIs().db.deleteDataInputsInModel([modelId]).then(() => {
      this.deleteModel(modelId)
    })
  }

  getDataInputSizeString(size: number): string {
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

  async handleDataInputs(datainput: DataInputFile) {
    const wholePath: string = datainput.absolutePath
    let fileInfo = null as any
    try {
      fileInfo = await useDataInputsAPIs().readCsvFileInfo(wholePath)
      datainput.size = fileInfo ? getDataInputSizeString(fileInfo.size) : '0'
      datainput.createdAt = fileInfo ? new Date(fileInfo.birthtimeMs).toLocaleString() : ''
      datainput.updatedAt = fileInfo ? new Date(fileInfo.mtimeMs).toLocaleString() : ''
    } catch (error) {
      console.log(error)
    }
    return datainput
  }

  async handleDataInputsByRelativePath(datainput: DataInputFile, RelativePath: string) {
    const wholePath: string = RelativePath
    let fileInfo = null as any
    try {
      fileInfo = await useDataInputsAPIs().readCsvFileInfo(wholePath)
      // console.log(fileInfo)
      datainput.size = fileInfo ? getDataInputSizeString(fileInfo.size) : '0'
      datainput.createdAt = fileInfo ? fileInfo.birthtime.toLocaleString() : ''
      datainput.updatedAt = fileInfo ? fileInfo.mtime.toLocaleString() : ''
    } catch (error) {
      console.log(error)
    }
    return datainput
  }

  buildDataNavtionTree(modelNavigationTree: ModelNavigationNode[]) {
    return modelNavigationTree.map((node: ModelNavigationNode) => {
      return {
        id: node.id,
        name: node.name,
        children: node.children.filter((child) => {
          return child.copyType === CopyTypeBlock.data
        }).map((child) => {
          return {
            id: child.id,
            name: child.name
          }
        })
      }
    })
  }
}

const defaultDataInputDataSource = new DataInputDataSource()

export default defaultDataInputDataSource

function getDataInputSizeString(size: number): string {
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
