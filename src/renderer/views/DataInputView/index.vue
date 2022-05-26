<template>
  <div class="data-input-view" id="data-input-view">
    <app-tool-bar
      v-if="!currentRunner"
      @left-toggle-click="toggleDataNaviViewDisplay"
    />
    <split-panel
      class="data-panes"
      auto-hide="main"
      adsorbent
      :mainPaneMinimumRatio="0.1"
      @toggleViewDisplay="toggleDataNaviViewDisplay"
      :hide-main-pane="hideDataNaviView"
      split-direction="horizontal"
    >
      <template v-if="!currentRunner" #main>
        <model-navigation />
      </template>
      <template #side>
        <aside class="side-pane-body">
          <el-tabs v-model="componentId">
            <el-tab-pane
              v-for="item in tabsData"
              :key="item.value"
              :label="item.label"
              :name="item.value"
              :disabled="!currentDataModelNode"
            >
            </el-tab-pane>
          </el-tabs>
          <component
            v-if="currentDataModelNode"
            :is="componentId"
            :componentId="componentId"
          ></component>
        </aside>
      </template>
    </split-panel>
    <app-status-bar v-if="!currentRunner" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SplitPanel from '../components/SplitPanel.vue'
import DataInputManagement from './DataInputManagement.vue'
import DataInputMappingManagement from './DataInputMappingManagement.vue'
import ModelNavigation from './ModelNavigation/index.vue'
import AppStatusBar from '../components/AppStatusBar.vue'
import AppToolBar from '../components/AppToolBar.vue'
import { createNamespacedHelpers } from 'vuex'
import { ElMessageBox, ElMessage } from 'element-plus'
import { tabsData } from './config'
import { getModelNavigationNodeIdAndType } from '@/utils'
const { mapMutations, mapState, mapGetters } = createNamespacedHelpers('dataInputs/')

export default defineComponent({
  components: { SplitPanel, ModelNavigation, DataInputManagement, DataInputMappingManagement, AppToolBar, AppStatusBar },
  setup() {
    return { tabsData }
  },
  props: {
    currentRunner: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      componentId: '',
      previousHide: false,
      flag: true
    }
  },
  computed: {
    ...mapState(['hideDataNaviView', 'currentDataModelNode']),
    ...mapGetters(['dataNaviTree', 'getFiles'])
  },
  methods: {
    ...mapMutations([
      'toggleDataNaviViewDisplay',
      'switchModel'
    ]),
    initData() {
      this.previousHide = this.hideDataNaviView
      if (!this.hideDataNaviView && this.currentRunner) this.toggleDataNaviViewDisplay()
      const res = this.dataNaviTree.find((item: any) => {
        const { id, type } = getModelNavigationNodeIdAndType(item.id)
        return id === this.currentRunner.modelId
      })
      this.switchModel(res)
    },
    isMappingMessage(callback?: any) {
      const findFile = this.getFiles.find((file: any) =>
        file.blockVal.split(',').findIndex((item: string) => item === '') !== -1)
      if (!findFile) {
        callback && callback()
        return
      }
      ElMessageBox.confirm(
        '映射未完成，是否离开当前页面？',
        'Warning',
        {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        }
      ).then(({ value }) => {
        callback && callback()
      }).catch(() => {
        this.componentId = 'DataInputMappingManagement'
      })
    }
  },
  unmounted() {
    if (this.previousHide !== this.hideDataNaviView && this.currentRunner) {
      this.toggleDataNaviViewDisplay()
    }
  },
  created() {
    this.currentRunner && this.initData()
    this.$router.beforeEach((to, from, next) => {
      if (from.path === '/data-input') {
        this.isMappingMessage(next)
      } else {
        next()
      }
    })
  },
  watch: {
    currentRunner: {
      handler(val) {
        val && this.initData()
      },
      deep: true
    },
    currentDataModelNode: {
      handler(val) {
        this.componentId = this.componentId || 'DataInputManagement'
      },
      deep: true
    },
    componentId() {
      this.componentId === 'DataInputManagement' &&
        this.isMappingMessage()
    }
  }
})
</script>

<style lang="scss" scoped>
.data-input-view {
  background-color: white;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .data-panes {
    height: calc(100% - 63px);
  }
  .side-pane-body {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 10px;
    .empty-box {
      flex: 1;
    }
  }
  &:deep(.el-tabs__content) {
    height: calc(100% - 44px);
  }
  &:deep(.el-tabs__header) {
    margin: 0;
  }
}
</style>
