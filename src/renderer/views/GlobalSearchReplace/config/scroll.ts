import { variableHeight, updateMonacoModels } from '../config'
import store from '@/store'
import { clone } from '@shared/functional'
import { throttle } from '@/utils'
import { ruleValue } from '@/store/modules/globalSearchReplaceSource'
const distance = 10
let isFinishLoadData = false

export const waitData:any = []

export const onScroll = throttle((scroll: { scrollLeft: number, scrollTop: number }) => {
  const { scrollTop } = scroll
  // finish load data number
  const finishLoadDataNumber = store.state.globalSearchReplace.monacoModels.length
  // one list el
  const el:HTMLElement|any = document.querySelectorAll('.vxe-body--row')[0]
  // view area height : variableHeight
  // scroll space in Y : scrollTop
  // document total list height : getScrollHeight
  const elHeight = getHeightAtEl(el)
  // will reach bottom ?
  const isReachBottom = willReachBottom(elHeight, finishLoadDataNumber, scrollTop, variableHeight.value)
  if (!isReachBottom || isFinishLoadData) return false
  const scrollSize = getScrollSize(elHeight, variableHeight.value)
  const { totalSourceData } = ruleValue()
  const loadData = clone(getWillLoadData(finishLoadDataNumber, scrollSize, totalSourceData))
  updateMonacoModels(loadData)
}, 5)

export function getUpdateData() {
  // finish load data number
  const finishLoadDataNumber = store.state.globalSearchReplace.monacoModels.length
  // one list el
  const el:HTMLElement|any = document.querySelectorAll('.vxe-body--row')[0]
  const elHeight = getHeightAtEl(el) || 50
  const scrollSize = getScrollSize(elHeight, variableHeight.value)
  const { totalSourceData } = ruleValue()
  const loadData = clone(getWillLoadData(finishLoadDataNumber, scrollSize, totalSourceData))
  isFinishLoadData = false
  return new Promise((resolve, reject) => resolve(loadData))
}

function willReachBottom(elHeight:number, totalNumber:number, scrollTop:number, variableHeight:number) {
  const totalHeight = getScrollHeight(elHeight, totalNumber)
  return scrollTop + variableHeight > totalHeight - distance
}

// total height
function getScrollHeight(elHeight:number, totalNumber:number):number {
  return elHeight * totalNumber
}
// get one list el height
function getHeightAtEl(el:HTMLElement | null):number {
  return el?.offsetHeight || 0
}

function getScrollSize(elHeight:number, variableHeight:number) {
  return Math.ceil(variableHeight / elHeight)
}

function getWillLoadData(finishLoadDataNumber:number, scrollSize:number, totalSourceData:any) {
  const totalNumber = totalSourceData.length
  const needLoadNumber = finishLoadDataNumber + scrollSize
  if (needLoadNumber >= totalNumber) {
    isFinishLoadData = true
    return totalSourceData.slice(finishLoadDataNumber)
  }
  return totalSourceData.slice(finishLoadDataNumber, needLoadNumber)
}
