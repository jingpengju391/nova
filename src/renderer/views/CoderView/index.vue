<template>
  <div class="coder-view" id="coder-view">
    <app-tool-bar
      @left-toggle-click="toggleModelNaviViewDisplay"
      @right-toggle-click="togglePropertyViewDisplay"
      @save-button-click="saveCurrentFormula"
    />
    <input
      style="display: none"
      ref="filElem"
      type="file"
      accept="application/vnd.ms-excel"
      maxlength="inputNameLength"
    />

    <split-panel
      class="coder-panes"
      auto-hide="main"
      adsorbent
      :mainPaneMinimumRatio="0.1"
      split-direction="horizontal"
    >
      <template #main>
        <split-panel
          style="height: 100%"
          :main-pane-default-ratio="0.4"
          :hide-main-pane="hideModelNaviView"
          split-direction="vertical"
        >
          <template #main>
            <model-navigation />
          </template>
          <template #side>
            <split-panel
              v-show="displayModelTreeNavi"
              style="height: 100%"
              :main-pane-default-ratio="0.4"
              :hide-main-pane="hideModelNaviView"
              split-direction="vertical"
            >
              <template #main>
                <ModelTreeLinksAndBlocks />
              </template>
              <template #side>
                <PropertyNavigation />
              </template>
            </split-panel>
            <PropertyNavigation v-show="!displayModelTreeNavi" />
          </template>
        </split-panel>
      </template>
      <template #side>
        <split-panel
          style="height: 100%"
          :main-pane-default-ratio="0.7"
          :hide-side-pane="hidePropertyView"
          split-direction="horizontal"
          class="splitPanelDeBox"
        >
          <template #main>
            <split-panel
              class="coding-pane"
              :main-pane-default-ratio="mainPaneDefaultRatio"
              :hide-side-pane="hideConsole"
              split-direction="vertical"
            >
              <template #main>
                <code-navigation
                  v-if="openedFormulaItems.length && currentFormulaItem"
                />
                <el-empty style="height: 100%" v-else description="公式区域" />
              </template>
              <template #side>
                <utility-views />
              </template>
            </split-panel>
          </template>
          <template #side>
            <!-- <property-details /> -->
            <collapse-navigation />
          </template>
        </split-panel>
        <div
          v-show="dependencyViewVisible"
          class="el-drawer-box"
          ref="splitPanelDeBox"
        >
          <div class="el-drawer-inner-box">
            <el-drawer
              custom-class="dependency-drawer"
              :model-value="dependencyViewVisible"
              direction="rtl"
              lock-scroll
              :size="dependencyW"
              :modal="true"
              title="引用视图"
              :before-close="handleDependencyViewClose"
            >
              <dependency-view></dependency-view>
            </el-drawer>
          </div>
        </div>
      </template>
    </split-panel>
    <app-status-bar @toggle-console="toggleConsoleDisplay" />
  </div>
</template>

<script lang=ts>
import { defineComponent } from 'vue'
import SplitPanel from '../components/SplitPanel.vue'
import CodeNavigation from './CodeNavigation/index.vue'
import ModelNavigation from './ModelNavigation/index.vue'
import PropertyNavigation from './PropertyNavigation/index.vue'
import ModelTreeLinksAndBlocks from './ModelTreeLinksAndBlocks/index.vue'
import AppStatusBar from '../components/AppStatusBar.vue'
import AppToolBar from '../components/AppToolBar.vue'
import DependencyView from './DependencyView/index.vue'
import elementResizeDetectorMaker from 'element-resize-detector'
import UtilityViews from './UtilityViews/index.vue'
import CollapseNavigation from './CollapseNavigation/index.vue'
import { createNamespacedHelpers } from 'vuex'
import eventBus, { SaveCurrentFormulaChannel } from './eventBus'
import { inputNameLength } from '@shared/commonUtils'

const { mapState, mapMutations } = createNamespacedHelpers('models/')

export default defineComponent({
  components: {
    SplitPanel,
    CodeNavigation,
    AppToolBar,
    ModelNavigation,
    PropertyNavigation,
    ModelTreeLinksAndBlocks,
    AppStatusBar,
    UtilityViews,
    DependencyView,
    CollapseNavigation
  },
  data() {
    return {
      dependencyW: '1000'
    }
  },
  computed: {
    ...mapState(['hideModelNaviView', 'hidePropertyView', 'hideConsole', 'displayModelTreeNavi', 'panelComponent', 'mainPaneDefaultRatio', 'dependencyViewVisible', 'openedFormulaItems', 'currentFormulaItem'])
  },
  mounted() {
    const self = this
    const erd = elementResizeDetectorMaker()
    erd.listenTo(document.getElementsByClassName('splitPanelDeBox'), function (element) {
      var width = element.offsetWidth
      self.dependencyW = width
      self.$refs.splitPanelDeBox.style.width = width + 'px'
    })
  },
  methods: {
    ...mapMutations([
      'toggleModelNaviViewDisplay',
      'togglePropertyViewDisplay',
      'toggleConsoleDisplay',
      'hideDependencyView'
    ]),
    saveCurrentFormula() {
      eventBus.emit(SaveCurrentFormulaChannel)
    },
    handleDependencyViewClose(done: any) {
      this.hideDependencyView()
      done()
    }
  }
})
</script>

<style lang='scss' scoped>
.coder-view {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.coder-panes {
  width: 100%;
  height: calc(100% - 36px - 27px);
}
.navi-pane {
  height: 100%;
}
.coding-pane {
  height: 100%;
}
</style>

<style lang='scss'>
.dependency-drawer {
  .el-drawer__header {
    padding-top: 10px;
    margin-bottom: 10px;
  }
  .el-drawer__body {
    height: calc(100% - 43px);
    padding: 0 !important;
  }
}
.el-drawer-box {
  background: #fff;
  height: 100%;
  width: 90%;
  min-width: 30%;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 999;
  border-right: 1px solid #eeeeee;
  .el-drawer-inner-box {
    width: 100%;
    position: relative;
    height: 100%;
    .el-overlay {
      width: 100%;
      position: absolute;
      background-color: rgba(0, 0, 0, 0);
    }
    .dependency-drawer {
      width: 100%;
      .el-drawer__header {
        padding-top: 10px;
        margin-bottom: 10px;
      }
      .el-drawer__body {
        height: calc(100% - 43px);
        padding: 0 !important;
      }
    }
  }
}
</style>
