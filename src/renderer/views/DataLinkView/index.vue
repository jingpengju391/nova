<template>
  <div class="dataLink-view">
    <split-panel
      class="dataLink-panes"
      auto-hide="main"
      :mainPaneMinimumRatio="0.1"
      split-direction="horizontal"
    >
      <template #main>
        <data-link-navigation />
      </template>
      <template #side>
        <data-link-list></data-link-list>
        <!-- <split-panel
          style="height: 100%"
          :main-pane-default-ratio="0.99"
          split-direction="horizontal"
        >
          <template #main>
            <data-link-list></data-link-list>
          </template>
          <template #side>
            <data-property></data-property>
          </template>
        </split-panel> -->
      </template>
    </split-panel>

  </div>
</template>

<script lang = 'ts'>
import { defineComponent } from 'vue'
import AppToolBar from '../components/AppToolBar.vue'
import AppStatusBar from '@/views/components/AppStatusBar.vue'
import SplitPanel from '../components/SplitPanel.vue'
import DataLinkNavigation from './DataLinkNavigation.vue'
import DataLinkList from './DataLinkList.vue'
import DataProperty from './DataProperty.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('dataLink/')

export default defineComponent({
  components: {
    SplitPanel,
    DataLinkList,
    DataLinkNavigation,
    DataProperty
  }
})
</script>

<style lang="scss" scoped>
.dataLink-view {
  width: 100%;
  height: 100%;
  .container {
    height: 100%;
  }
  .dataLink-panes {
    height:100%;
  }
}
</style>
