
import { CodeIndexClass, CodeIndex, CodeTransformation } from '@shared/dataModelTypes/product/indicators'
import store from '@/store'
import { parseStringPostfixNumber } from '@/store/modules/utils'
import { omit } from '@shared/functional'
import { ElMessage } from 'element-plus'
import { getCurrentModelBlockModelId } from '@/store/baseModules'
import masterDataSource from '@/store/modules/masterDataSource'
function onButtonsClicked(event: MouseEvent) {
  // const target = event.target as HTMLElement updateCurrentCodeIndex
  Created()
}

function Created() {
  const displayModelTreeNavi = store.state.models.displayModelTreeNavi
  if (displayModelTreeNavi) {
    ElMessage({
      message: '此功能暂时被禁用',
      type: 'warning'
    })
    return true
  }
  const modelId = store.state.models.currentModelNode?.id || 0
  const newCodeIndex = new CodeIndexClass({ modelId })
  store.commit('codeIndex/updateCurrentCodeIndex', newCodeIndex)
}

async function Delete(codeIndex:CodeIndex) {
  await store.dispatch('codeIndex/deleteCodeIndexksFromDB', [codeIndex])
  const modelId = getCurrentModelBlockModelId() as number
  const products = masterDataSource.getCompleteMastersByModelId(modelId)
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    product.deleteCodeIndex(codeIndex.id.toString())
    await store.dispatch('masters/updateMasterFromDB', product)
  }
}

function Copy(codeIndex:CodeTransformation) {
  store.commit('codeIndex/updateCurrentCopy', codeIndex)
}

function Stick() {
  const currentCopy = omit(['id'], store.state.codeIndex.currentCopy)
  const codeIndexes = store.state.codeIndex.codeIndexes
  const currentModelNode = store.state.models.currentModelNode

  if (!currentCopy) return
  const newName = generateCopySectionName(currentCopy.name, codeIndexes)
  const newCodeIndex = new CodeIndexClass({
    ...currentCopy,
    name: newName,
    updatedAt: new Date().getTime()
  })

  store.dispatch('codeIndex/insertCodeIndexFromDB', {
    ...newCodeIndex,
    modelId: currentModelNode!.id
  })
}

export { onButtonsClicked, Created, Delete, Copy, Stick }

function generateCopySectionName(name: string, codeIndexes:CodeIndex[]) {
  let newSectionName = name
  const numberPostfix = parseStringPostfixNumber(name)
  const nameLen = name.length
  let postfixNumber = 1
  let namePrefix = ''
  if (nameLen === numberPostfix) {
    postfixNumber = 1
    namePrefix = name
  } else {
    postfixNumber = parseInt(name.substring(numberPostfix, nameLen)) + 1
    namePrefix = name.substring(0, numberPostfix)
  }
  newSectionName = namePrefix + postfixNumber.toString()
  while (!checkNewModelBlockName(codeIndexes, newSectionName)) {
    ++postfixNumber
    newSectionName = namePrefix + postfixNumber.toString()
  }
  name = newSectionName
  return name
}

function checkNewModelBlockName(codeIndexes: CodeIndex[], newName: string): boolean {
  const codeMap = new Map()
  codeIndexes.forEach((codeIndex:CodeIndex) => codeMap.set(codeIndex.id, codeIndex))
  const iterator = codeMap.values()
  let { value, done } = iterator.next()
  while (!done) {
    if (value.name === newName) {
      return false
    }
    const newResult = iterator.next()
    value = newResult.value
    done = newResult.done
  }
  return true
}
