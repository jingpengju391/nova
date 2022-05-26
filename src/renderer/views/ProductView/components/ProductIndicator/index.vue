<template>
  <splitpanes horizontal class="master-panes">
    <pane
      v-for="pane in paneConfig"
      :key="pane.id"
      :min-size="pane.minSize"
      :size="pane.size"
      :id="pane.id"
    >
      <component :is="pane.componentId"></component>
    </pane>
  </splitpanes>
</template>
<script setup lang=ts name>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import CodeNavigation from '@/views/CoderView/CodeNavigation/index.vue'
import UtilityViews from '@/views/CoderView/UtilityViews/index.vue'
import NoFormula from './Empty.vue'
const store = useStore()
const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)
const paneConfig = computed(() => {
  const basePane = [
    {
      id: 1,
      size: '60',
      minSize: '20',
      componentId: currentFormulaItem.value ? CodeNavigation : NoFormula
    },
    {
      id: 2,
      size: '40',
      minSize: '10',
      componentId: UtilityViews,
      hide: store.state.models.hideConsole
    }
  ]
  return basePane.filter((pane:any) => !pane.hide)
})
</script>
<style lang="scss">
.master-panes .el-tabs--border-card{
  border: none !important;
}
.master-panes .top-box .icon-box{
  height: 39px;
  border-top: none !important;
}
</style>
