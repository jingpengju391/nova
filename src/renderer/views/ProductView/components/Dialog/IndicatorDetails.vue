<template>
  <el-transfer
    class="transfer-box"
    v-model="currentLibraryChecked"
    ref="transferRef"
    filterable
    :left-default-checked="libraryDefaultChecked"
    :right-default-checked="selectDefaultChecked"
    :render-content="filterRenderContent"
    :titles="['Library 库', '选中的']"
    :format="{
      noChecked: '${total}',
      hasChecked: '${checked}/${total}',
    }"
    :data="libraryData"
    :filter-method="filterMethod"
    @left-check-change="currentLibraryCheckedChange"
    @change="(a, b, c) => transferRef.leftChecked.push(...c)"
  >
  </el-transfer>
</template>

<script lang="ts" setup name="IndicatorDetails">
import { ref, watch, computed } from 'vue'
import { ElTransfer } from 'element-plus'
import {
  libraryDefaultChecked, selectDefaultChecked, currentLibraryChecked, libraryData, filterRenderContent,
  currentLibraryCheckedChange, libraryChecked, currtenPtroductFormulas
} from '../../config'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { Library } from '../../types'
const transferRef = ref<HTMLElementAny>()
watch(() => libraryChecked.value, newArray =>
  transferRef.value && transferRef.value.leftChecked.push(...newArray), { deep: true })

const filterMethod = computed(
  () => (val: string, codeIndex: Library) =>
    (currtenPtroductFormulas.value === 'all' ||
      !codeIndex.classify ||
      codeIndex.classify === currtenPtroductFormulas.value) &&
    (!val || codeIndex.label.toLowerCase().includes(val.toLowerCase())))

</script>
<style lang="scss">
.transfer-box {
  display: flex;
  align-items: center;
  flex: 1;
  height: 100%;
  .el-transfer-panel {
    flex: 1;
    height: 100%;
  }
  .el-transfer-panel__body {
    height: calc(100% - 40px);
  }
  .el-transfer-panel__list.is-filterable {
    height: calc(100% - 60px);
  }
}
</style>
