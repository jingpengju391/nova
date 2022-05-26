import masterDataSource from '@/store/modules/masterDataSource'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { UnsavedMasterExistsError } from '@/errors'
import {
  AnchorProductJson, AnchorProduct, CreaterMasterDefaultIdentification,
  ChoseCodeIndex, SimplifiedProduct
} from '@shared/dataModelTypes/product/products'
import { getMasterNavigationNodeIdAndType } from '@/utils'
import { ElMessage } from 'element-plus'
import store from '@/store'
import { currentLibraryChecked, openMasterDialog, productSearch } from '../config'
import { computed } from 'vue'

export const toolButtons = computed(() => [
  {
    effect: 'dark',
    content: '新增master',
    placement: 'bottom',
    value: 1,
    title: '产品'
  },
  {
    effect: 'dark',
    content: !productSearch?.value ? '显示搜索' : '隐藏搜索',
    placement: 'bottom',
    value: 1,
    componentId: 'search',
    click: () => (productSearch.value = !productSearch.value)
  },
  {
    effect: 'dark',
    content: '新增master',
    placement: 'bottom',
    value: 1,
    componentId: 'folder-add',
    click: () => addNewMaster().then(_ => openMasterDialog())
  }
])

export async function addNewMaster() {
  try {
    await selectUnsavedNewMasterNodeIfExists()
    return new Promise((resolve, reject) => {
      const temporaryMaster = new AnchorProduct()
      masterDataSource.setTemporaryMaster(temporaryMaster)
      const simplifiedMaster = masterDataSource.getSimplifiedMasterForViewByMasterId(temporaryMaster.id)
      store.commit('masters/updateCurrentMasterNode', simplifiedMaster)
      resolve(1)
    })
  } catch (error:any) {
    if (error instanceof UnsavedMasterExistsError) {
      ElMessage({
        message: '当前存在新建的未保存master，请先设置该master！',
        type: 'warning'
      })
    } else {
      console.log(error)
    }
  }
}

function selectUnsavedNewMasterNodeIfExists(): Promise<void> {
  const unsavedMaster = masterDataSource.getTemporaryMaster()
  return new Promise((resolve, reject) => {
    if (unsavedMaster) {
      reject(new UnsavedMasterExistsError(unsavedMaster.name))
    } else {
      resolve()
    }
  })
}

export function clearTemporaryMasterData() {
  masterDataSource.clearTemporaryMaster()
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode) return
  const { id } = getMasterNavigationNodeIdAndType(currentMasterNode.id)
  id === CreaterMasterDefaultIdentification.defaultId &&
  store.commit('masters/updateCurrentMasterNode', undefined)
}

export async function saveNewMasterToDb(newMasterForm:AnchorProduct) {
  // const codeIndexes:Record<string, ChoseCodeIndex> = {}
  // store.state.masters.codeIndexes.forEach(codeIndex => {
  //   codeIndexes[codeIndex.name] = {
  //     name: codeIndex.name,
  //     value: currentLibraryChecked.value.indexOf(codeIndex.id) !== -1
  //   }
  // })
  const temporaryMaster = new AnchorProduct(newMasterForm)
  temporaryMaster.defaultCodeIndex(store.state.masters.codeIndexes)
  currentLibraryChecked.value.forEach(id => temporaryMaster.updateCodeIndexValue(store.state.masters.codeIndexes, id, true))

  const path = newMasterForm.id ? 'updateMasterFromDB' : 'insertMasterFromDB'
  const newMasterId = await store.dispatch('masters/' + path, temporaryMaster)
  const masterId = newMasterForm.id || newMasterId
  const newMaster = masterDataSource.getCompleteMaster(masterId)
  const pathM = newMasterForm.id ? 'updatedProductBlock' : 'addProductBlock'
  const result = await store.dispatch('models/' + pathM, newMaster)
  return new Promise((resolve, reject) => { resolve(result) })
}

export async function deleteMaster(masterId: string) {
  const { id } = getMasterNavigationNodeIdAndType(masterId)
  const completeMaster = masterDataSource.getCompleteMaster(id)
  const { deleteMaster, deleteBlock } = await store.dispatch('masters/deleteMasterFromDB', id)
  // update ui about master
  if (deleteMaster) {
    const currentMasterNode = store.state.masters.currentMasterNode
    currentMasterNode?.id === masterId && store.commit('masters/updateCurrentMasterNode', undefined)
    const masterNavigationTree = masterDataSource.getSimplifiedMasterForView()
    const modelBlocks = modelsDataSource.getAllModelBlocksForAModel(completeMaster.modelId!)
    store.commit('masters/updateMasterNavigationTree', masterNavigationTree)
    // to do delete model product
    // modelBlocks.forEach(item => {
    //   item.isProductMask = 0
    //   item.productId = undefined
    //   store.dispatch('models/')
    // })
  } else {
    ElMessage.error('delete master failed!')
  }
  // delete catch block about master
  if (!deleteBlock) return
  const blockIds = modelsDataSource.getModelBlockByMasterId(id)
  blockIds.forEach(item => {
    store.commit('models/deleteBlockFromDataSourceAndNaviTree', item)
  })
}

export function updateMaster(masterId: number, master:SimplifiedProduct) {
  const currentMasterNode = store.state.masters.currentMasterNode
}

export async function copyMaster(masterId: string) {
  const { id } = getMasterNavigationNodeIdAndType(masterId)
  const master = masterDataSource.getCompleteMaster(id)
  const copyMaterName = masterDataSource.generateCopyMasterName(id, master.name)
  const temporaryMaster = new AnchorProduct({
    ...master,
    id: CreaterMasterDefaultIdentification.defaultId,
    name: copyMaterName
  } as AnchorProductJson)
  const newMasterId = await store.dispatch('masters/insertMasterFromDB', temporaryMaster)
  const newMaster = masterDataSource.getCompleteMaster(newMasterId)
  const result = await store.dispatch('models/addProductBlock', newMaster)
}
