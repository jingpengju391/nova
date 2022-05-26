import { evalRight } from '@/utils'
import { clone } from '@shared/functional'
import store from '../index'
import { source, searchRule } from '@/views/GlobalSearchReplace/config'
import { ReplaceData } from '@shared/dataModelTypes/globalSearchReplaces'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { code } from '@shared/PrivateDeployment'
export function getReplaceData() {
  const S = clone(source)
  const { formulas, replaceValue, totalSourceData, currentModelNode } = ruleValue()
  const rule = searchRule()
  const newFormulas = formulas.map((item:any) => {
    item.content = item.content.replace(evalRight(rule), replaceValue)
    return item
  })

  store.dispatch('models/updateOpenedFormulaAllAsync', newFormulas)

  return new Promise((resolve) => {
    const result: ReplaceData[] | any = totalSourceData.map((item: string[]) => {
      let modelBlock:any
      const content = item[1].replace(evalRight(rule), replaceValue)
      const keyArr = item[0].split(' ')
      // @ts-ignore
      const pkey = keyArr.at(-1)
      const { keys, parentKeys } = getParentKeysAndKeys(keyArr)
      // @ts-ignore
      // const num = [...code, 'name', 'description', 'codeIndexes'].includes(parentKeys.at(-1)) ? 2 : 1
      keyArr.reduce((newObj, key, index) => {
        pkey === key && (newObj[key] = content)
        if (parentKeys.length) {
          if (parentKeys.length - 1 === index) {
            modelBlock = newObj[key]
            if (keyArr.includes('codeIndexes')) {
              modelBlock.isCodeIndex = true
            }
          }
        } else {
          modelBlock = S
        }
        return newObj[key]
      }, S)
      return modelBlock
    })
    resolve(result)
  })
}

export function getParentKeysAndKeys(keys: string[]) {
  const findIndex = keys.findIndex(item => {
    return item === PropertyType.links ||
      item === PropertyType.methods ||
      item === PropertyType.series ||
      item === PropertyType.variables ||
      item === 'name' ||
      item === 'description' ||
      item === 'chooseIf' ||
      item === 'abandonIf'
  })

  const cloneKeys = clone(keys)

  if (findIndex !== -1) {
    // console.log(cloneKeys.splice(findIndex), findIndex, 'hello')
    // const keys = cloneKeys.splice(findIndex)
    return {
      parentKeys: cloneKeys,
      keys: cloneKeys.splice(findIndex)
    }
  } else {
    return {
      parentKeys: cloneKeys,
      keys: []
    }
  }
  // console.log(keys, 'keys')
  // // const cloneKeys = clone(keys)
  // const { matchPath } = ruleValue()
  // // if (matchPath) {
  // //   return {
  // //     keys: cloneKeys,
  // //     parentKeys: []
  // //   }
  // // }
  // if (cloneKeys.length === 1) {
  //   return {
  //     keys: [cloneKeys[0]],
  //     parentKeys: []
  //   }
  // }
  // if (cloneKeys.length === 2) {
  //   return {
  //     keys: [cloneKeys[1]],
  //     parentKeys: [cloneKeys[0]]
  //   }
  // }

  // const num = matchPath ? 1 : 2
  // return {
  //   keys: cloneKeys.filter((item:string, index:number) => index > num),
  //   parentKeys: cloneKeys.filter((item:string, index:number) => index <= num)
  // }
}

export function ruleValue() {
  const monacoModels = store.state.globalSearchReplace.monacoModels
  const totalSourceData = store.state.globalSearchReplace.totalSourceData
  const replaceValue = store.state.globalSearchReplace.replaceValue
  const caseSensitive = store.getters['globalSearchReplace/gettersCaseSensitive']
  const regularExpress = store.getters['globalSearchReplace/gettersRegularExpress']
  const matchWhole = store.getters['globalSearchReplace/gettersMatchWhole']
  const matchPath = store.getters['globalSearchReplace/gettersMatchPath']
  const searchValue = store.state.globalSearchReplace.searchValue
  const wordSeparators = matchWhole ? searchValue : null
  const formulas = store.state.models.openedFormulaItems
  const currentModelNode = store.state.models.currentModelNode
  return {
    caseSensitive,
    regularExpress,
    searchValue,
    wordSeparators,
    formulas,
    replaceValue,
    monacoModels,
    currentModelNode,
    totalSourceData,
    matchPath
  }
}
