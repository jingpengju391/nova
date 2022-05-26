<template>
  <splitpanes class="main-box" horizontal>
    <pane
      v-for="pane in paneConfig"
      :key="pane.id"
      :min-size="pane.minSize"
      :size="pane.size"
    >
      <component :is="pane.componentId" :formulaItem="currentFormulaItem"></component>
    </pane>
  </splitpanes>
</template>
<script setup lang="ts" name="CodeFormula">
import { reactive, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import CodeEditor from '@/views/components/CodeEditor.vue'
import NoFormula from './NoFormula.vue'
import { currentRowKey } from '../config'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import Indicator from './Indicator.vue'
const store = useStore()
const route = useRoute()
const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)

const paneConfig = computed(() => {
  const code = {
    id: 1,
    size: '50',
    minSize: '10',
    componentId: CodeEditor
  }
  const noFormula = {
    id: 1,
    size: '50',
    minSize: '10',
    componentId: NoFormula
  }

  const codeIndex = {
    id: 2,
    size: '50',
    minSize: '10',
    componentId: Indicator
  }
  return currentFormulaItem.value && currentFormulaItem.value?.breadcrumb.at(-1) === 'productFormulas' && route.path !== '/product'
    ? currentRowKey.value !== -1 ? [code, codeIndex] : [noFormula, codeIndex] : [code]
})
</script>
<style lang="scss" scoped>
.main-box{
  display: flex;
  width: 100%;
  height: calc(100% - 74px);
  flex: 1;
}
</style>
