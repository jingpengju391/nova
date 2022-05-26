<!-- eslint-disable vue/no-v-model-argument  -->
<template>
  <div id="runner-view">
    <app-tool-bar />
    <!-- <ribbon-steps id="ribbon-steps" :steps="steps" v-model:active="active" /> -->
    <split-panel
      class="runner-panes"
      auto-hide="main"
      adsorbent
      :mainPaneMinimumRatio="0"
      :main-pane-default-ratio="0"
      split-direction="horizontal"
    >
      <!-- <template #main>
        <runner-navigation></runner-navigation>
      </template> -->
      <template #side>
        <el-tabs type="border-card" v-model="activeName">
          <el-tab-pane
            v-for="item in treeData"
            :key="item.name"
            :name="item.name"
            :label="item.label"
          >
            <keep-alive>
              <component
                id="step-detail"
                :is="item.name"
                v-if="activeName === item.name"
              />
            </keep-alive>
          </el-tab-pane>
        </el-tabs>
      </template>
    </split-panel>
    <app-status-bar @toggle-console="toggleConsole" />
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import RibbonSteps from '../components/RibbonSteps/index.vue'
import DataLinks from '@/views/DataLinkView/index.vue'
import Projects from '@/views/ProjectView/index.vue'
import ProjectionsSettings from './ProjectionsSettings/index.vue'
import AppToolBar from '@/views/components/AppToolBar.vue'
import AppStatusBar from '@/views/components/AppStatusBar.vue'
import SplitPanel from '../components/SplitPanel.vue'
import { useStore } from 'vuex'

export default defineComponent({
  components: { DataLinks, AppToolBar, AppStatusBar, Projects, SplitPanel },
  data() {
    return {
      activeName: 'DataLinks',
      treeData: [
        {
          id: 1,
          label: '清洗数据',
          name: 'DataLinks'
        },
        {
          id: 2,
          label: '清洗项目',
          name: 'Projects'
        }
      ]
    }
  },
  setup() {
    const steps = ['目标设置', '运行设置', '任务设置']
    const active = ref(1)
    const currentStepDetailView = computed(() => {
      if (active.value === 1) {
        return DataLinks
      } else {
        return Projects
      }
    })
    const store = useStore()
    const toggleConsole = () => {
      store.commit('tasks/setConsoleHide', !store.state.tasks.hideConsole)
    }
    return {
      steps,
      active,
      currentStepDetailView,
      toggleConsole
    }
  }
})
</script>

<style lang="scss" scoped>
#runner-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  flex-flow: column nowrap;
  #ribbon-steps {
    padding: 20px 50px;
    flex: 0;
    border-bottom: 1px solid #d0d0d0;
  }
  #step-detail {
    flex: 1;
    height: calc(100%);
    // overflow-y: auto;
  }
  overflow: hidden;
  &:deep(.el-tab-pane) {
    height: calc(100%);
  }
  &:deep(.el-tabs--border-card) {
    height: 100%;
  }
  &:deep(.el-tabs--border-card > .el-tabs__content) {
    height: calc(100% - 39px);
    padding: 0;
  }
}
.runner-panes {
  height: calc(100% - 66px);
}
</style>
<style>
.ant-cascader-menus {
  /* run output z-index min-size 2503  */
  z-index: 2503 !important;
}
</style>
