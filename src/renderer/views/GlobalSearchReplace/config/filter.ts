import store from '@/store'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { ElMessage } from 'element-plus'
import { ControlList as attribute, switchSource, rangeValue, objectValue } from '../config'
import { ruleValue } from '@/store/modules/globalSearchReplaceSource'
import { SourceControl, code } from '@shared/PrivateDeployment'
import { omit } from '@shared/functional'
import { evalRight, getModelNodeType, ModelNodeType } from '@/utils'
import { keyContent } from '@shared/dataModelTypes/product/indicators'
import { _has } from '@shared/functional/internals'
import { selects } from './range'
// filter source for data source  model/mask/block
export function filterSource() {
  const flag = store.state.globalSearchReplace.matchPath
  return flag ? getCompleteSource() : omitAttribute(modelsDataSource.getAllModels(), false)
}

// filter attribute for data source
function filterAttribute(): { checks: string[], ignores: string[] } {
  const ranges = JSON.parse(JSON.stringify(rangeValue.value))
  const findIndex = ranges.findIndex((item: string) => item === 'formula')
  const attrs = attribute.filter((item: SourceControl) => item.status).map((item: SourceControl) => item.value)
  findIndex !== -1 && ranges.splice(findIndex, 1, ...attrs)
  return {
    checks: [...ranges, 'codeIndexes'],
    ignores: switchSource ? [] : attrs
  }
}

function getCompleteSource() {
  const currentModelNode = store.state.models.currentModelNode

  let source:any = modelsDataSource.getAllModels()
  // no path global search
  if (!currentModelNode) {
    ElMessage.info('您没有选择搜索模块，将全局搜索！')
    return omitAttribute(source, false)
  }

  const isModels = getModelNodeType(currentModelNode) === ModelNodeType.models
  source = isModels ? modelsDataSource.getCompleteModel(currentModelNode.id)
    : modelsDataSource.getCompleteModelBlock(currentModelNode.id)
  return omitAttribute(source, isModels)
}

function omitAttribute(obj:any, isModels:boolean) {
  const result:any = obj
  if (!Array.isArray(result)) {
    if (isModels) {
      result.detailedChildren.forEach((modelBlock:any) => {
        delete modelBlock.detailedChildren
        delete modelBlock.detailedParent
      })
      return result
    }
    return omit(['detailedChildren', 'detailedParent'], result)
  }

  return result.map(model => {
    model.detailedChildren.map((modelBlock:any) => omit(['detailedChildren', 'detailedParent'], modelBlock))
    return model
  })
}

export function check(key:string, obj?:any) {
  if (obj && Array.isArray(obj)) {
    return true
  }
  const { checks, ignores } = filterAttribute()
  return checks.includes(key) && !ignores.includes(key)
}

function checkRule(value: any): never[] {
  const rule = searchRule()
  const { searchValue } = ruleValue()
  if (!rule || !searchValue) return []
  return evalRight(rule).test(value)
}

export function searchRule():string {
  const { caseSensitive, regularExpress, searchValue } = ruleValue()
  return regularExpress ? searchValue : caseSensitive
    ? '/' + searchValue + '/g'
    : '/' + searchValue + '/ig'
}

export function filters(obj: any, key: string) {
  if (!obj[key]) return false

  let currentObjType = selects[1].options[0].value

  if (_has(keyContent.abandonIf, obj)) {
    currentObjType = selects[1].options[2].value
  }

  if (_has('isDefining', obj)) {
    currentObjType = selects[1].options[1].value
  }

  const flag = Array.isArray(obj) ? true : objectValue.value.includes(currentObjType)

  return flag &&
    check(key, obj) && checkRule(obj[key])
}
