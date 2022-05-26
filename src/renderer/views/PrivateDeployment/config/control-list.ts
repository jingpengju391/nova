import { SourceControl, ignore as ig, checks as ck } from '@shared/PrivateDeployment'
import store from '@/store'
import { getDiffForJson } from '@/utils'
import { clone } from '@shared/functional'
import { dLink } from '@shared/dataModelTypes/models/links'
import { dModelBlock } from '@shared/dataModelTypes/models/masks'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { useWorkspacesAPIs } from '@/hooks/apis'
import type { FormulaTabItem, SimplifiedModelBlock } from '@shared/dataModelTypes'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { ref, toRefs } from 'vue'
import { checkSourceValue, ControlList, switchSource, getAllSourceValue } from '../config'
import NProgress from '@shared/nprogress'

export const height = ref(0)

export const setSourceControl = (currentSource: SourceControl) => {
  currentSource.status = !currentSource.status
}

export const setSourceControlCenter = async () => {
  NProgress.start()
  let checks:string[] = ck
  let ignore:string[] = []
  await store.dispatch('privateDeployment/recoverCurrentWorkspaceFromDB')
  const OldObjModels = store.state.privateDeployment.originalModels
  const NewObjModels = store.state.privateDeployment.currentModels
  if (switchSource.value) {
    checks = checkSourceValue(ControlList)
  } else {
    checks = getAllSourceValue(ControlList)
    ignore = [...checkSourceValue(ControlList), ...ig]
  }
  const diffModels = getDiffForJson(OldObjModels, NewObjModels, checks, ignore)
  const diffArr = diffModels.map((item: string[]) => {
    const IM = clone(item)
    if (IM[1] === 'deleted' || IM[1] === 'created') {
      return {
        ...IM[2],
        original: IM
      }
    }

    if (IM[1] === 'changed') {
      const keyArr = IM[0].split(' ')
      // @ts-ignore
      const value = clone(keyArr.slice(0, keyArr.length - 1).reduce((newObj, key) => newObj[key], NewObjModels))
      // @ts-ignore
      value.original = IM
      return value
    }
  })
  store.commit('privateDeployment/updateOriginal', diffArr)
  NProgress.done()
}

export const setCurrentDiffFormulaItems = async (diff: dLink | dModelBlock) => {
  if (diff?.original[1] === 'deleted') {
    return
  }
  NProgress.start()
  if (diff?.original[1] === 'created') {
    store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
      id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + diff.id,
      name: diff.name,
      children: []
    })
    NProgress.done()
    return
  }
  if (typeof diff.id === 'number') {
    const df: string[] | any = diff.original[0].split(' ')
    const key = df[df.length - 1]
    const currentModelNode = store.state.models.currentModelNode as SimplifiedModelBlock | any
    const params = modelsDataSource.generateBlockFormulaItem(diff.name, diff.id, key, currentModelNode[key]) as FormulaTabItem
    params.original = diff.original
    store.commit('models/updateCurrentFormulaItem', params)
    const G = params.original[0].split(' ').length > 2 ? ModelNavigationNodeType.modelBlocks : ModelNavigationNodeType.models
    store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
      id: G + NaviNodeIdDelimiter + diff.id,
      name: diff.name,
      children: []
    })
  } else {
    const NewObjModels = modelsDataSource.getCompleteModels()
    const keys = diff.original[0].split(' ')
    const keyArr = keys.slice(0, 3)
    await store.dispatch('models/selectProperty', {
      id: diff.id,
      name: diff.name,
      type: diff.original[0].split(' ')[3],
      original: diff.original,
      key: keys[keys.length - 1],
      // @ts-ignore
      blockId: keyArr.reduce((newObj, key) => newObj[key], NewObjModels).id
    })
  }
  NProgress.done()
}

export const importDiffModel = async () => {
  const { canceled, workspacePath } = await useWorkspacesAPIs().chooseWorkspacePath()
  if (canceled) return
  NProgress.start()
  await window.apis.initializeWorkspace(workspacePath as string, false)
  await store.dispatch('privateDeployment/recoverOriginalWorkspaceFromDB', null, { root: true })
  await window.apis.initializeWorkspace(document.title as string, false)
  setSourceControlCenter()
  NProgress.done()
}

function unique(arr: any, key: string) {
  const res = new Map()
  return arr.filter((item: any) => !res.has(item[key]) && res.set(item[key], 1))
}

function handleDiff() {
  let checks:string[] = ck
  let ignore:string[] = []
  if (switchSource) {
    checks = checkSourceValue(ControlList)
  } else {
    ignore = [...checkSourceValue(ControlList), ...ig]
  }
  const OldObjModels = store.state.privateDeployment.originalModels
  const NewObjModels = store.state.privateDeployment.currentModels
  const diffModels = getDiffForJson(OldObjModels, NewObjModels, checks, ignore)
}
