import { ref, computed } from 'vue'
import type { VNode, VNodeProps } from 'vue'
import store from '@/store'
import { getClassliesByModelId } from '../config'
import { CodeIndex, ChoseCodeIndex } from '@shared/dataModelTypes/product/products'
import masterDataSource from '@/store/modules/masterDataSource'
import { getMasterNavigationNodeIdAndType, MasterNodeType } from '@/utils'
import { ElMessage } from 'element-plus'
import { Library } from '../types'
interface Option {
  key: number
  label: string
  disabled: boolean
}

export const libraryDefaultChecked = ref<number[]>([])
export const libraryChecked = ref<number[]>([])
export const selectDefaultChecked = ref<number[]>([])
export const currentLibraryChecked = ref<number[]>([])

export function filterRenderContent(h: (type: string, props: VNodeProps | null, children?: string) => VNode, option: Option) {
  return h('span', null, option.label)
}

// must be or must not be
export const transferRef = ref<HTMLElement>()
export function currentLibraryCheckedChange(selectKeysProxy: number[], selectKeys: number[]) {
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode) return
  const { id } = getMasterNavigationNodeIdAndType(currentMasterNode.id)
  const codeIndexes: CodeIndex[] = store.state.masters.codeIndexes
  const currentCompleteMaster = masterDataSource.getCompleteMaster(id)
  const codeIndexesJson: Record<string, ChoseCodeIndex> = {}
  codeIndexes.forEach(codeIndex => {
    codeIndexesJson[codeIndex.name] = {
      name: codeIndex.name,
      value: [...selectKeysProxy, ...currentLibraryChecked.value].includes(codeIndex.id)
    }
  })
  masterDataSource.updatedCompleteMaster({
    ...currentCompleteMaster,
    codeIndexes: codeIndexesJson
  })

  const isChoose = selectKeysProxy.includes(selectKeys[0])
  const chooseCodeIndex = codeIndexes.find(codeIndex => codeIndex.id === selectKeys[0])
  if (!chooseCodeIndex) return
  let ChooseIf: number[], AbandonIf: number[]
  try {
    ChooseIf = currentCompleteMaster.getCodeIndexChooseIf(codeIndexes).map(item => item.id)
    AbandonIf = currentCompleteMaster.getCodeIndexAbandonIf(codeIndexes).map(item => item.id)
    isChoose ? chooseData() : liberateData()
  } catch (error: any) {
    ElMessage.warning(error.message)
  }
  function chooseData() {
    const arr = [...selectKeysProxy, ...ChooseIf.filter(item => !AbandonIf.includes(item))]
    selectKeysProxy.length = 0
    codeIndexes.forEach(codeIndex => {
      codeIndex.disabled = AbandonIf.includes(codeIndex.id)
      arr.includes(codeIndex.id) && !codeIndex.disabled && selectKeysProxy.push(codeIndex.id)
    })
    toCheckedCurrentLibrary()
  }
  function liberateData() {
    const arr = selectKeysProxy.filter(key => !ChooseIf.includes(key))
    selectKeysProxy.length = 0
    selectKeysProxy.push(...arr)
    codeIndexes.forEach(codeIndex => {
      codeIndex.disabled = AbandonIf.includes(codeIndex.id)
    })
  }

  function toCheckedCurrentLibrary() {
    const disabledId = codeIndexes.filter(codeIndex => codeIndex.disabled).map(codeIndex => codeIndex.id)
    if (!disabledId.length) return
    currentLibraryChecked.value.forEach((item, index) => {
      disabledId.includes(item) && currentLibraryChecked.value.splice(index, 1)
    })
  }
}

// libraryData libraryDataSource
export const libraryData = computed<Library[]>(() => {
  return store.state.masters.codeIndexes
    .filter(codeIndex => !codeIndex.moduleOnly || !codeIndex.newBlockDefault)
    .map(codeIndex => {
      return {
        key: codeIndex.id,
        label: codeIndex.name,
        disabled: codeIndex.disabled,
        classify: codeIndex.classify
      }
    })
})

export async function initDataLibrary() {
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode?.id) return
  const { id, type } = getMasterNavigationNodeIdAndType(currentMasterNode.id)
  if (type !== MasterNodeType.master) return
  const completeMaster = masterDataSource.getCompleteMaster(id)
  if (!completeMaster.modelId) return
  await store.dispatch('masters/queryCodeIndexesByModelIdFromDB', completeMaster.modelId)
  const choseCodeIndexes = Object.values(completeMaster.codeIndexes).filter((codeIndex: ChoseCodeIndex) => codeIndex.value).map((codeIndex: ChoseCodeIndex) => codeIndex.name)
  const codeIndexes = store.state.masters.codeIndexes.filter(codeIndex => choseCodeIndexes.includes(codeIndex.name))
  currentLibraryChecked.value = codeIndexes.map(codeIndex => codeIndex.id)
  getClassliesByModelId(completeMaster.modelId)
}

export function clearInitDataLibrary() {
  store.commit('masters/updateCodeIndexes', [])
  libraryDefaultChecked.value = []
  libraryChecked.value = []
  selectDefaultChecked.value = []
  currentLibraryChecked.value = []
}
