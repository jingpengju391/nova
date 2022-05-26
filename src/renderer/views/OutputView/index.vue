<template>
  <div class="output-view">
    <!-- <app-tool-bar
      v-if="!currentRunner"
      @left-toggle-click="toggleOutputNaviDisplay"
    /> -->
    <split-panel
      class="output-panes"
      style="width: 100%"
      auto-hide="main"
      adsorbent
      :mainPaneMinimumRatio="0.1"
      @toggleViewDisplay="toggleOutputNaviDisplay"
      :hide-main-pane="hideOutputNavi"
      splitDirection="horizontal"
      :mainPaneDefaultRatio="0.3"
    >
      <template v-if="!currentRunner" #main>
        <ouput-navigator />
        <!-- <collapse v-model="activeName" id="navigator" class="out-box">
          <ouput-navigator />
          <result-navigator />
        </collapse> -->
      </template>
      <template #side>
        <output-settings
          v-if="currentOutput && activeName === 'outputSettings'"
        />
        <result-details
          :filename="currentFileName"
          v-else-if="currentFileName && activeName === 'resultFiles'"
        />
        <el-empty v-else style="height: 100%" />
      </template>
    </split-panel>
    <!-- <app-status-bar v-if="!currentRunner" /> -->
  </div>
  <!-- // .ant-cascader-menus -->
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SplitPanel from '@/views/components/SplitPanel.vue'
import Collapse from '@/views/components/Collapse/index.vue'
import OuputNavigator from './OutputNavigator.vue'
import ResultNavigator from './ResultNavigator.vue'
import OutputSettings from './OutputSettings.vue'
import { createNamespacedHelpers } from 'vuex'
import AppToolBar from '../components/AppToolBar.vue'
import AppStatusBar from '../components/AppStatusBar.vue'
import ResultDetails from './ResultDetails/ResultDetails.vue'
import { UnsavedOutputExistsError } from '@/errors'

const { mapState, mapMutations, mapGetters, mapActions } = createNamespacedHelpers('outputs/')
const offset = 65
export default defineComponent({
  components: { SplitPanel, Collapse, OuputNavigator, ResultNavigator, OutputSettings, AppToolBar, AppStatusBar, ResultDetails },
  props: {
    currentRunner: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      activeName: 'outputSettings',
      previousHide: false
    }
  },
  computed: {
    ...mapState(['currentOutput', 'hideOutputNavi', 'currentFileName']),
    ...mapGetters(['outputNaviTree'])
  },
  methods: {
    ...mapMutations([
      'toggleOutputNaviDisplay'
    ]),
    ...mapActions(['createNewOutput', 'updateCurrentOutput']),
    initData(flag: boolean) {
      this.previousHide = flag ? false : this.hideOutputNavi
      if (!this.hideOutputNavi && this.currentRunner) this.toggleOutputNaviDisplay()
      if (!this.currentRunner) return false
      const { modelId } = this.currentRunner
      this.createNewOutput(modelId)
    }
  },
  unmounted() {
    if (this.previousHide !== this.hideOutputNavi && this.currentRunner) {
      this.toggleOutputNaviDisplay()
    }
  },
  created() {
    this.currentRunner && this.initData(false)
  },
  watch: {
    currentRunner: {
      handler(val) {
        val && this.initData(true)
      },
      deep: true
    }
  }
})
</script>

<style lang="scss" scoped>
.output-view {
  overflow: hidden;
  width: 100%;
  height: 100%;
  .coder-panes {
    width: 100%;
    height: 100%;
  }
}
#navigator {
  border-right: 1px solid var(--nova-border-color);
  height: 100%;
  background: #f4f9fd;
}
.output-panes {
  height: 100%;
}
.out-box {
  &:deep(.el-collapse-item__header) {
    background: #cce9ff;
  }
}
</style>
