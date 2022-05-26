import store from '@/store'
import { clone } from '@shared/functional'
import { filterSourceAndNaviTree } from '@/utils'
import { newColumnSection } from './index'
import { useAssumptionVarPagesAPIs } from '@/hooks/apis'
import { parseStringPostfixNumber } from '@/store/modules/utils'
import { VariableSectionlimiter, VariableSectionlimiterHeader, ArrayToString } from '@shared/dataModelTypes/assumptions'
import { Console } from 'console'
export const filterNavigationTree = (modelId: number, fileId?: number, formId?: number) => {
  return new Promise((resolve) => {
    store.dispatch('assumptionVar/addPropertyModelNodeAsync', modelId).then(res => {
      const arr = filterSourceAndNaviTree(res, 'source', 'assumption', fileId, formId, modelId)
      resolve(arr)
    })
  })
}

export const insertData = (target:any, num:number) => {
  const V = store.getters['assumptionVar/variable']
  const S = store.getters['assumptionVar/section']
  const gettersCurrentCopySection = store.getters['assumptionVar/gettersCurrentCopySection']
  const currentCopySection = gettersCurrentCopySection.$index ? gettersCurrentCopySection : newColumnSection
  const indexTarget = target.$index + num
  const indexNear = indexTarget - 1
  const sortAggregate = [S[indexTarget]?.sort || (new Date()).valueOf(), S[indexNear].sort].sort()
  const newSortTime = Math.random() * (sortAggregate[1] - sortAggregate[0]) + sortAggregate[0]
  const lCurrent = gettersCurrentCopySection.$index
    ? generateCopySectionName({ ...currentCopySection, sort: newSortTime }, S)
    : { ...currentCopySection, sort: newSortTime }
  S.splice(indexTarget, 0, lCurrent)
  store.commit('assumptionVar/setCurrentCopySection', currentCopySection)
  if (!currentCopySection.value) return
  V.forEach((item:any, index:number) => {
    const sKey = []
    const sVal = []
    item[currentCopySection.value] = currentCopySection.variables[index]
    for (const i in item) {
      const str = i.split(VariableSectionlimiter)[0]
      if (str === VariableSectionlimiterHeader) {
        sKey.push(i)
        sVal.push(item[i])
      }
    }
    item.sectionKey = sKey.join(ArrayToString)
    item.sectionVal = sVal.join(ArrayToString)
  })
  useAssumptionVarPagesAPIs().db.updatedVariableKeyValToDB(clone(V)).then(_ => {
    store.commit('assumptionVar/setCurrentCopySection', {})
  })
}

export const stickData = (targetData:any) => {
  const V = store.getters['assumptionVar/variable']
  const currentCopySection = store.getters['assumptionVar/gettersCurrentCopySection']
  V.forEach((item:any, index:number) => {
    const sKey = []
    const sVal = []
    item[targetData.value] = currentCopySection.variables[index]
    for (const i in item) {
      const str = i.split(VariableSectionlimiter)[0]
      if (str === VariableSectionlimiterHeader) {
        sKey.push(i)
        sVal.push(item[i])
      }
    }
    item.sectionKey = sKey.join(ArrayToString)
    item.sectionVal = sVal.join(ArrayToString)
  })
  useAssumptionVarPagesAPIs().db.updatedVariableKeyValToDB(clone(V)).then(_ => {
    store.commit('assumptionVar/setCurrentCopySection', {})
  })
}

function generateCopySectionName(section: any, sections:any) {
  let newSectionName = section.label
  const numberPostfix = parseStringPostfixNumber(section.label)
  const nameLen = section.label.length
  let postfixNumber = 1
  let namePrefix = ''
  if (nameLen === numberPostfix) {
    postfixNumber = 1
    namePrefix = section.label
  } else {
    postfixNumber = parseInt(section.label.substring(numberPostfix, nameLen)) + 1
    namePrefix = section.label.substring(0, numberPostfix)
  }
  newSectionName = namePrefix + postfixNumber.toString()
  while (!checkNewModelBlockName(sections, newSectionName)) {
    ++postfixNumber
    newSectionName = namePrefix + postfixNumber.toString()
  }
  section.label = newSectionName
  return section
}

function checkNewModelBlockName(sections: any, newName: string): boolean {
  const sectionsMap = new Map()
  sections.forEach((section:any) => {
    sectionsMap.set(section.id, section)
  })
  const iterator = sectionsMap.values()
  let { value, done } = iterator.next()
  while (!done) {
    if (value.label === newName) {
      return false
    }
    const newResult = iterator.next()
    value = newResult.value
    done = newResult.done
  }
  return true
}
