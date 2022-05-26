import { ref, reactive } from 'vue'
import store from '@/store'
import { currentLibraryChecked } from '../config'
export const productFormulas:any = reactive([])
export const currtenPtroductFormulas = ref<string>('all')

export function getClassliesByModelId(modelId:number | undefined) {
  productFormulas.length = 0
  if (!modelId) return
  const classifyList = store.state.models.classifyList
  productFormulas.push({
    label: '全部',
    value: 'all',
    modelId: modelId
  })
  productFormulas.push(...classifyList.map((classly:any) => {
    return {
      label: classly.name,
      value: classly.name,
      modelId: classly.modelId
    }
  }).filter((classly:any) => classly.modelId === modelId))
}

export function handleNewProductDefault() {
  const codeIndexes = store.state.masters.codeIndexes
  currentLibraryChecked.value.push(...codeIndexes.filter(codeIndex => codeIndex.newProductDefault).map(codeIndex => codeIndex.id))
}
