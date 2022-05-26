<template>
  <split-panel split-direction='horizontal' adsorbent :mainPaneMinimumRatio="0.1" @toggleViewDisplay="toggleTargetNaviViewDisplay" :hide-main-pane='hideTargetNaviView'>
    <template #main >
      <target-navigator />
    </template>
    <template #side>
      <split-panel v-if="currentTarget" split-direction='horizontal' :mainPaneDefaultRatio="0.3"
        style="height: 100%">
        <template #main>
          <target-basic-settings />
        </template>
        <template #side>
          <target-variables-series-settings />
        </template>
      </split-panel>
      <el-empty v-else description="选择或新建一个目标" style="height: 100%;"/>
    </template>
  </split-panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SplitPanel from '@/views/components/SplitPanel.vue'
import TargetNavigator from './TargetNavigator.vue'
import TargetBasicSettings from './TargetBasicSettings.vue'
import TargetVariablesSeriesSettings from './TargetVariablesSeriesSettings.vue'
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapMutations, mapActions } = createNamespacedHelpers('runs/')

export default defineComponent({
  components: { SplitPanel, TargetNavigator, TargetBasicSettings, TargetVariablesSeriesSettings },
  computed: {
    ...mapState(['hideTargetNaviView', 'currentTarget', 'runners'])
  },
  props: {
    currentRunner: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      previousHide: false
    }
  },
  methods: {
    ...mapMutations([
      'toggleTargetNaviViewDisplay'
    ]),
    ...mapActions(['createNewTarget']),
    initData(flag:boolean) {
      this.previousHide = flag ? false : this.hideTargetNaviView
      if (!this.hideTargetNaviView && this.currentRunner) this.toggleTargetNaviViewDisplay()
      const { modelId } = this.currentRunner
      this.createNewTarget(modelId)
    }
  },
  unmounted() {
    if (this.previousHide !== this.hideTargetNaviView && this.currentRunner) {
      this.toggleTargetNaviViewDisplay()
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
