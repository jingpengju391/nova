<template>
  <div ref="tableHeightDom" class="table-box">
    <el-table
      border
      :data="loadData"
      :height="height"
      :header-cell-style="{
        background: '#eef1f6',
        color: '#606266',
        textAlign: 'center',
      }"
    >
      <el-table-column
        v-for="(item, index) in columns"
        :key="index"
        :label="item"
        :prop="item"
      />
      <el-table-column fixed="right" width="35">
        <template #header>
          <el-icon @click="handleClosePreviewOpen"><close /></el-icon>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang=ts name="datapreview">
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useDataInputsAPIs } from '../../hooks/apis'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
const props = defineProps<{ dataPreview: any }>()
const emits = defineEmits(['handleClosePreviewOpen'])
const columns = computed(() => props.dataPreview.value.row.blockVal.filter((item: string, index: number) => item && index))
const loadData = reactive([]) as any
const height = ref(0)
const handleClosePreviewOpen = () => emits('handleClosePreviewOpen')
const tableHeightDom = ref<null | HTMLElementAny>(null)
const addLoadData = () => {
  const path = props.dataPreview.value.row.absolutePath
  loadData.length = 0
  useDataInputsAPIs().getDataInputPreview(path).then(res => {
    const formAll = res.map(item => item.split(','))
    const formKey = formAll[0]
    const formVal = formAll.filter((item, index) => index)
    formVal.forEach((item: string[], index: number) => {
      const obj = {} as any
      item.forEach((iter: string, index: number) => {
        obj[formKey[index]] = iter
      })
      loadData.push(obj)
    })
  })
}
addLoadData()

onMounted(() => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(tableHeightDom.value, (element: HTMLElement) => {
    height.value = element.offsetHeight
  })
})

watch(() => props.dataPreview.row, (val) => {
  val.dataPreview.value.row && addLoadData()
})

</script>
<style scoped>
.table-box {
  width: 100%;
  height: 100%;
  z-index: 3;
}
</style>
