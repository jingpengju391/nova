import { AssumptionInfo, ArrayToString, CheckedHalflimiter } from '@shared/dataModelTypes/assumptions'
import { useAssumptionVarPagesAPIs } from '../../hooks/apis'
import modelsDataSource from './modelsDataSource'
import { clone } from '@shared/functional'
import store from '../index'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { filterSourceAndNaviTree } from '@/utils'
import { getCurrentModelParentId } from '../baseModules'

export const addModelsToDataSourceAndNaviTree = (id: number) => {
  const ModelBlock: any = []
  const data = modelsDataSource.getModelBlockMap()
  data.forEach((item: any, index: any) => {
    if (item.modelId === id) {
      item.children = []
      const variables = Object.values(item.variables)
      variables.forEach((iter: any) => item.children.push(iter))
      ModelBlock.push(item)
    }
  })
  return clone(ModelBlock)
}

export const queryCurrentBlockInfo = (data: AssumptionInfo[]) => {
  return new Promise((resolve) => {
    const obj: any = []
    data.forEach(async (item: AssumptionInfo) => {
      const blocksData: any = {}
      const blocksAll = modelsDataSource.getAllSimplifiedModelBlocksForAModel(item.modelId)
      const tableVariables = await useAssumptionVarPagesAPIs().db.queryVariableVar(item.pageId)
      const section = await useAssumptionVarPagesAPIs().db.querySectionVarById(item.sectionId)
      const sectionValue = section?.value || ''
      tableVariables.forEach((iter: any) => {
        const sectionKeys = iter.sectionKey ? iter.sectionKey.split(ArrayToString) : []
        const sectionVals = iter.sectionVal ? iter.sectionVal.split(ArrayToString) : []
        const sectionValueIndex = sectionKeys.indexOf(sectionValue)
        const source = iter.source ? iter.source.split(ArrayToString) : []
        const value = sectionValueIndex === '-1' || !sectionVals.length ? '' : sectionVals[sectionValueIndex]
        const blocks: any = getBlockByVariableId(source, blocksAll)
        blocks.forEach((itew: any) => {
          blocksData[itew.name] = blocksData[itew.name] || {}
          itew.variables.forEach((iteq: any) => {
            if (iteq.type === 'variables') {
              blocksData[itew.name][iteq.name] = {
                type: iter.type,
                linkage: {
                  pageID: item.pageId,
                  sectionID: item.sectionId
                },
                value: value
              }
            }
          })
        })
      })
      obj.push(blocksData)
    })
    resolve(obj)
  })
}
// 删除pages 同时删除variables/sections/block
export const deletionAssociationByPageId = (payload: any) => {
  payload.forEach(async (item: any) => {
    useAssumptionVarPagesAPIs().db.queryVariableVar(item.id).then((res: any) => {
      const variables: number[] = res.map((iter: any) => iter.id)
      useAssumptionVarPagesAPIs().db.querySectionVar(item.id).then((resv: any) => {
        const sections: number[] = resv.map((itee: any) => itee.id)
        useAssumptionVarPagesAPIs().db.deleteAssumptionVariables(variables)
        useAssumptionVarPagesAPIs().db.deleteAssumptionSections(sections)
      })
    })
    const path = 'assumptionVar/addPropertyModelNodeAsync'
    const oldTree = await store.dispatch(path, item.modelId)
    const newTree = filterSourceAndNaviTree(oldTree, 'source', 'assumption')
    newTree.forEach((itee: any) => {
      itee.children.forEach((iter: any) => {
        iter.assumptionBind =
          iter?.assumptionBind?.pageId === item.id
            ? undefined
            : iter.assumptionBind
      })
    })
    store.dispatch('assumptionVar/updateBlockVariableWithDBSync', newTree)
  })
}

export const deleteAssumptionData = (id: number) => {
  useAssumptionVarPagesAPIs().db.deleteAssumptionVarPagesInModel([id]).then(_ => {
    useAssumptionVarPagesAPIs().db.deleteAssumptionSectionByModelId([id]).then(_ => {
      useAssumptionVarPagesAPIs().db.deleteAssumptionVariableModelId([id])
    })
  })
}

export async function exportAssumeData() {
  const models = store.getters['models/gettersModelNavigationTree']
  const assumeData = models.map((item: any) => {
    return {
      id: item.id.split(NaviNodeIdDelimiter)[1] * 1,
      modelName: item.name
    }
  })
  const modelsIds = assumeData.map((item: any) => item.id)
  const pages = await useAssumptionVarPagesAPIs().db.queryAllAssumptionVars(modelsIds, store.state.workspace.id)
  assumeData.forEach((item: any) => {
    item.pages = []
    pages.forEach(async (iter: any) => {
      item.id === iter.modelId && item.pages.push(iter)
      iter.variables = await useAssumptionVarPagesAPIs().db.queryVariableVar(iter.id)
      iter.sections = await useAssumptionVarPagesAPIs().db.querySectionVar(iter.id)
    })
  })
  return assumeData
}

export async function deleteAssociatedSourceData(simplifiedProperty: any) {
  const { id } = getCurrentModelParentId()
  let res: any
  const newProperty = modelsDataSource.getProperty(simplifiedProperty.id, simplifiedProperty.type, id)
  if (newProperty?.assumptionBind?.variableId) {
    const variable = await useAssumptionVarPagesAPIs().db.queryVariableVarById(newProperty.assumptionBind.variableId)
    const source = variable[0].source.split(ArrayToString).filter((item: any) => item !== simplifiedProperty.id)
    variable[0].source = source.join(ArrayToString)
    res = await useAssumptionVarPagesAPIs().db.updateAssumptionVarVariableName(variable[0])
  }
  return res
}

export const deleteAssociatedSourceDataBatch = (id: number) => {
  return new Promise((resolve) => {
    let res
    const variables = [] as any
    const v = modelsDataSource.getSimplifiedModelBlockForView(id).variables
    v.forEach((item: any) => {
      const newProperty = modelsDataSource.getProperty(item.id, item.type, id)
      variables.push(newProperty)
    })
    variables.forEach(async (item: any) => {
      if (item.assumptionBind && item.assumptionBind.pageId && item.assumptionBind.variableId) {
        const variable = await useAssumptionVarPagesAPIs().db.queryVariableVarById(item.assumptionBind.variableId)
        const source = variable[0].source.split(ArrayToString).filter((item: any) => item !== item.id)
        variable[0].source = source.join(ArrayToString)
        res = await useAssumptionVarPagesAPIs().db.updateAssumptionVarVariableName(variable[0])
      }
    })
    resolve(res)
  })
}

function getBlockByVariableId(variables: any, blocks: any) {
  let blocksClone = clone(blocks)
  blocksClone.forEach((item: any) => {
    item.variables =
      item.variables.filter((iter: any) => variables.indexOf(`${iter.id}${CheckedHalflimiter}${item.id}`) !== -1)
  })
  blocksClone = blocksClone.filter((iter: any) => iter.variables.length)
  return blocksClone
}

export const generateCopySectionName = (id: number) => {

}
