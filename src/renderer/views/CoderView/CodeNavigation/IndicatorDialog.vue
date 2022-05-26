<template>
  <el-dialog
    v-model="dialogVisible"
    :title="operation.label"
    width="30%"
    :before-close="handleClose"
  >
    <component :is="componentId"  ref="indicatorFormRef" :formDataSources="indicatorFormData" :formSources="productFormulas"></component>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="onSure">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang=ts name="IndicatorDialog">
import { ref, computed } from 'vue'
import {
  dialogVisible, indicatorFormData, productFormulas, loading,
  addProductFormula, handleClose, operation, deleteProductFormula, updateProductFormula, handleProductFormulas
} from '../config'
import { Form as IndicatorForm } from '@/views/components'
import Tips from './Tips.vue'

const indicatorFormRef = ref<HTMLElement>()
const componentId = computed(() => operation.id === 2 ? Tips : IndicatorForm)

function onSure() {
  handleProductFormulas(indicatorFormRef.value.form)
  switch (operation.id) {
    case 1:
      indicatorFormRef.value.validateFn(updateProductFormula())
      break
    case 2:
      deleteProductFormula()
      break
    default:
      indicatorFormRef.value.validateFn(addProductFormula())
  }
}
</script>
