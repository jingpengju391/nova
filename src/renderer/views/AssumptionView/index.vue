<template>
  <div class="assumption-box">
    <app-tool-bar @left-toggle-click="toggleAssumptionViewDisplay" />
    <split-panel
      class="coder-panes"
      adsorbent
      :mainPaneMinimumRatio="0.1"
      @toggleViewDisplay="toggleAssumptionViewDisplay"
      :hide-main-pane="hideAssumptionView"
    >
      <template #main>
        <model-navigation
          @hanldeChangeNodeButton="hanldeChangeNodeButton"
          @hanldeChangeNavigation="hanldeChangeNavigation"
        ></model-navigation>
      </template>
      <template #side>
        <property-navigation :currModel="currModel" :selectNav="selectNav" />
      </template>
    </split-panel>
    <!-- @toggle-console="toggleConsoleDisplay" -->
    <app-status-bar />
  </div>
</template>
<script setup lang=ts name="outputview">
import { SplitPanel } from '@/views/components'
import ModelNavigation from './ModelNavigation/index.vue'
import PropertyNavigation from './PropertyNavigation/index.vue'
import AppToolBar from '../components/AppToolBar.vue'
import AppStatusBar from '../components/AppStatusBar.vue'
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { modelFile } from './types'
const currModel: any = reactive({})
const selectNav: any = reactive({})
const store = useStore()
const hideAssumptionView = computed(() => store.getters['assumptionVar/gettersHideAssumptionView'])
const toggleAssumptionViewDisplay = () => store.commit('assumptionVar/toggleAssumptionViewDisplay')
const toggleConsoleDisplay = () => store.commit('assumptionVar/toggleConsoleDisplay')

const hanldeChangeNodeButton = (node: modelFile) => {
  currModel.value = node
}

const hanldeChangeNavigation = (calbackSelect: any) => {
  selectNav.name = calbackSelect.slotName
}

</script>
<style lang="scss" scoped>
.assumption-box {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .coder-panes {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
}
</style>
