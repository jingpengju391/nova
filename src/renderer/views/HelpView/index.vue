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
          @hanldeChangecurListButton="hanldeChangecurListButton"
        ></model-navigation>
      </template>
      <template #side>
        <DocumentDetails :curList="currList" />
      </template>
    </split-panel>
    <!-- @toggle-console="toggleConsoleDisplay" -->
    <app-status-bar />
  </div>
</template>
<script setup lang=ts name="helpView">
import { SplitPanel } from '@/views/components'
import ModelNavigation from './ModelNavigation/index.vue'
import DocumentDetails from './DocumentDetails/index.vue'
import AppToolBar from '../components/AppToolBar.vue'
import AppStatusBar from '../components/AppStatusBar.vue'
import { reactive, computed } from 'vue'
import { useStore } from 'vuex'
import { TreeDataType } from './types'
const currList: any = reactive({})
const store = useStore()
const hideAssumptionView = computed(() => store.getters['assumptionVar/gettersHideAssumptionView'])
const toggleAssumptionViewDisplay = () => store.commit('assumptionVar/toggleAssumptionViewDisplay')
const toggleConsoleDisplay = () => store.commit('assumptionVar/toggleConsoleDisplay')

const hanldeChangecurListButton = (curList: TreeDataType) => {
  // console.log(curList)
  currList.value = curList
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
