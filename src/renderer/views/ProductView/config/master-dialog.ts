
import { initDataLibrary, clearInitDataLibrary } from '../config'
import { ref } from 'vue'

export const isShowMasterDialog = ref<boolean>(false)

export const dialogMasterLoading = ref<boolean>(false)

export const isShowProductDialog = ref<boolean>(false)

export const dialogProductLoading = ref<boolean>(false)

export function closeMasterDialog() {
  isShowMasterDialog.value = false
  clearInitDataLibrary()
}

export function openMasterDialog() {
  isShowMasterDialog.value = true
  initDataLibrary()
}

export function closeLoading() {
  dialogMasterLoading.value = false
}

export function openLoading() {
  dialogMasterLoading.value = true
}

export function closeProductDialog() {
  isShowProductDialog.value = false
}

export function openProductDialog() {
  isShowProductDialog.value = true
}

export function closeProductLoading() {
  isShowProductDialog.value = false
}

export function openProductLoading() {
  dialogProductLoading.value = true
}
