<template>
  <el-dialog title="导入数据" :width="800" v-model="dialog.visible" destroy-on-close>
    <el-table ref="tableDom" v-show="data.value" border :data="data.value" :max-height="600">
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="column in props.columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :fixed="column.fixed"
        :width="tableColumnWidth"
      >
        <template #default="scope">{{scope.row[column.prop] || '暂无数据'}}</template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button  v-show="data.value" @click="closeDialog">取 消</el-button>
      <el-button v-show="data.value" type="primary" @click="ImportData" :loading="loading">导 入</el-button>
    </template>
    <el-empty v-show="!data.value">
      <template #image><el-icon><loading /></el-icon></template>
      <template #description>映射文件载入中</template>
    </el-empty>
  </el-dialog>
</template>
<script setup lang=ts name="ImportDialog">
import { ref, watch, nextTick } from 'vue'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { dialog, data } from '../combination/dialog'
import { ArrayToString, tableColumnWidth } from '@shared/dataModelTypes/dataInputs'
import { useStore } from 'vuex'
import { getModelNavigationNodeIdAndType } from '@/utils'
const store = useStore()
const props = defineProps<{ columns: any }>()
const tableDom = ref<null | HTMLElementAny>(null)
const loading = ref(false)
const closeDialog = () => {
  dialog.visible = false
  loading.value = false
}

const ImportData = async () => {
  loading.value = true
  const modelId = store.state.dataInputs.currentDataModelNode.id
  const selection = tableDom.value && tableDom.value.store.states.selection._rawValue
  const blockKey = props.columns.map((item:any) => item.prop)
  const path = 'dataInputs/importDataInputsFilesWithDBSync'
  selection.forEach((element:any) => {
    const blockVal = [] as string[]
    blockKey.forEach((item:string) => blockVal.push(element[item]))
    console.log('modelId', modelId)

    element.modelId = getModelNavigationNodeIdAndType(modelId).id
    element.blockId = undefined
    element.blockKey = blockKey.join(ArrayToString)
    element.blockVal = blockVal.join(ArrayToString)
  })
  const { code } = await store.dispatch(path, selection)
  !code && closeDialog()
}

watch(() => data.value, (value) => {
  nextTick(() =>
    value.forEach((item:any) =>
      tableDom.value &&
    tableDom.value.toggleRowSelection(item, true)))
})
</script>
<style>
#data-input-view .el-dialog__body {
  padding: 10px 10px 0 10px;
  overflow: visible;
}
</style>
