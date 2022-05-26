import { filterSource, filters, loading } from '../config'
import { getSourceForJson } from './utils'
import * as monaco from 'monaco-editor'
import store from '@/store'
import NProgress from '@shared/nprogress'
import { ElMessage } from 'element-plus'
import { ruleValue, getParentKeysAndKeys } from '@/store/modules/globalSearchReplaceSource'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { getModelNodeType } from '@/utils'
import { code } from '@shared/PrivateDeployment'
import { propertyType, selects } from './range'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'

export let source:any

export function getSourceForModelMatches(formulas: any) {
  const { caseSensitive, regularExpress, searchValue, wordSeparators } = ruleValue()
  return formulas.map((item:any) => {
    let result: any
    const model = monaco.editor.createModel(item[1], 'cpp')
    const keys = item[0].split(' ')
    const key = keys.at(-1)
    const keyStr = code.includes(key) ? 'formula' : key
    const { path, blockId } = getPathAndBlockId(keys)
    for (const match of model.findMatches(searchValue, false, regularExpress, caseSensitive, wordSeparators, false)) {
      result = {
        text: model.getLineContent(match.range.startLineNumber),
        range: match.range,
        model: model,
        keys,
        key,
        path,
        name: item[2],
        blockId: blockId || undefined,
        ...searchType(keys),
        [keyStr]: code.includes(key) ? model.getLineContent(match.range.startLineNumber) : item[1]
      }
    }
    return result
  }).filter((item:any) => item)
}

export async function someContentToFind() {
  try {
    NProgress.start()
    source = filterSource()
    const totalSourceData = getSourceForJson(source, filters)
    store.commit('globalSearchReplace/updateTotalSourceData', totalSourceData)
    store.commit('globalSearchReplace/clearMonacoModels')
    // const data = await getUpdateData()
    updateMonacoModels(totalSourceData)
    NProgress.done()
  } catch (error:any) {
    ElMessage.error(error.message)
    NProgress.done()
  }
}

export function updateMonacoModels(data:any) {
  const monacoModels = getSourceForModelMatches(data)
  store.commit('globalSearchReplace/updateMonacoModels', monacoModels)
}

function getPathAndBlockId(args:string[]) {
  const paths:string[] = []
  const { parentKeys, keys } = getParentKeysAndKeys(args)
  const currentModelNode = store.state.models.currentModelNode
  // @ts-ignore
  const modelBlock = parentKeys.reduce((newObj, key) => {
    newObj[key].name && paths.push(newObj[key].name)
    return newObj[key]
  }, source)
  let blockId
  if (!paths.length && currentModelNode) {
    const isModels = getModelNodeType(currentModelNode)
    if (!isModels) {
      const completeModel = modelsDataSource.getCompleteModel(currentModelNode.id)
      paths.push(...[completeModel.name, currentModelNode.name])
    } else {
      paths.push(currentModelNode.name)
    }
  }
  return {
    blockId: modelBlock?.id || blockId,
    path: paths.join('/')
  }
}

function searchType(keys:string[]):{type:string} {
  const propertyTypes = propertyType.filter((item:{value:PropertyType, label:string}) => {
    return keys.includes(item.value)
  })

  if (propertyTypes.length) {
    return {
      type: propertyTypes[0].value
    }
  } else {
    return {
      type: keys.includes('codeIndexes') ? selects[1].options[2].value : selects[1].options[0].value
    }
  }
}
