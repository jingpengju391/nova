import { parseStringPostfixNumber } from '@/store/modules/utils'
import { DirectoryFileDescriptor } from '@shared/dataModelTypes'
import { useDataInputsAPIs } from '@/hooks/apis'

export async function generateCopyDirectoryOrFiles(newCopyObject:any, path:any):string {
  const newMaps = await getFileMaps(path)
  return newMaps.get(newCopyObject.name) ? generateCopyNewName(newCopyObject, newMaps) : newCopyObject.name
}

function generateCopyNewName(newCopyObject:any, newMaps:any):string {
  let temporaryName = newCopyObject.name
  const numberPostfix = parseStringPostfixNumber(newCopyObject.name)
  const nameLen = newCopyObject.name.length
  let postfixNumber = 1
  let namePrefix = ''
  if (nameLen === numberPostfix) {
    postfixNumber = 1
    namePrefix = newCopyObject.name
  } else {
    postfixNumber = parseInt(newCopyObject.name.substring(numberPostfix, nameLen)) + 1
    namePrefix = newCopyObject.name.substring(0, numberPostfix)
  }
  temporaryName = namePrefix + postfixNumber.toString()
  while (!checkNewModelBlockName(newCopyObject, temporaryName, newMaps)) {
    ++postfixNumber
    temporaryName = namePrefix + postfixNumber.toString()
  }
  return temporaryName
}

async function getFileMaps(path:any):any {
  const files: DirectoryFileDescriptor[] = await useDataInputsAPIs().readDirectory(path)
  const newMap = new Map()
  files.forEach((item:DirectoryFileDescriptor) => {
    const name = item.name.replace(/\//, '').split('.')[0]
    newMap.set(<string>name, {
      ...item,
      name
    })
  })
  return newMap
}

export function checkNewModelBlockName(newCopyObject:any, name:string, newMaps:any) : boolean {
  const iterator = newMaps.values()
  let { value, done } = iterator.next()
  while (!done) {
    if (value.name === name && value.name !== newCopyObject.name) {
      return false
    }
    const newResult = iterator.next()
    value = newResult.value
    done = newResult.done
  }
  return true
}
