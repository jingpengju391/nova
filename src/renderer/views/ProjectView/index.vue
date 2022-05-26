<template>
  <div id="project-view">
    <split-panel
      class="project-panes"
      auto-hide="main"
      adsorbent
      :mainPaneMinimumRatio="0.1"
      split-direction="horizontal"
    >
      <template #main>
        <project-navigation></project-navigation>
      </template>
      <template #side>
        <project-output-view v-if="showOutPutView" />
        <split-panel
          v-else
          split-direction="horizontal"
          :mainPaneMinimumRatio="0.4"
          :mainPaneDefaultRatio="0.6"
          style="height: 100%"
        >
          <template #main>
            <project-code v-if="formulaItemShow"></project-code>
            <el-empty style="height: 100%" v-else description="公式区域" />
          </template>
          <template #side>
            <split-panel
              style="height: 100%"
              :main-pane-default-ratio="0.4"
              :hide-main-pane="hideModelNaviView"
              split-direction="vertical"
            >
              <template #main>
                <data-variable></data-variable>
              </template>
              <template #side>
                <model-variable></model-variable>
              </template>
            </split-panel>
          </template>
        </split-panel>
      </template>
    </split-panel>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SplitPanel from '../components/SplitPanel.vue'
import ProjectNavigation from './ProjectNavigation.vue'
import ProjectCode from './ProjectCode.vue'
import ModelVariable from './ModelVariable.vue'
import DataVariable from './DataVariable.vue'
import ProjectOutputView from './ProjectOutputView.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations } = createNamespacedHelpers('project/')

export default defineComponent({
  components: {
    ProjectNavigation,
    ModelVariable,
    ProjectCode,
    SplitPanel,
    DataVariable,
    ProjectOutputView
  },
  computed: {
    ...mapState(['showOutPutView', 'formulaItemShow', 'hideModelNaviView'])
  }
})
</script>

<style lang="scss" scoped>
#project-view {
  width: 100%;
  height: 100%;
  .project-panes {
    width: 100%;
    height:100%;
  }
}
.project-panes{
   width: 100%;
    height:100%;
}
</style>
