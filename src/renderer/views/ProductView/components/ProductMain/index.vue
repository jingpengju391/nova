<template>
  <splitpanes class="main-box">
    <pane
       v-for="pane in paneConfig"
       :key="pane.id"
       :min-size="pane.minSize"
       :size="pane.size"
       :id="pane.id"
    >
      <splitpanes v-if="Array.isArray(pane.componentId)" horizontal>
        <pane
          v-for="child in pane.componentId"
          :key="child.id"
          :min-size="child.minSize"
          :size="child.size"
        >
          <component :is="child.componentId"></component>
        </pane>
      </splitpanes>
      <component v-else :is="pane.componentId"></component>
    </pane>
  </splitpanes>
</template>
<script setup lang=ts name="main">
import { computed } from 'vue'
import { useStore } from 'vuex'
import {
  ProductDetails, ProductIndicator, ProductNavigation, IndicatorNavigation as PropertyNavigation, LinkandBlocks, ModelNavigation
} from '../../components'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
// import { debounce } from 'lodash'
const store = useStore()
const paneConfig = computed(() => {
  const basePane = [
    {
      id: 1,
      minSize: '10',
      size: '20',
      hide: store.state.masters.hideMasterNaviView,
      componentId: ProductNavigation
    },
    {
      id: 1,
      minSize: '10',
      size: '20',
      hide: store.state.masters.hideMasterNaviView,
      componentId: [
        {
          id: 4,
          size: '33.3',
          minSize: '10',
          componentId: ModelNavigation
        },
        {
          id: 5,
          size: '33.3',
          minSize: '10',
          componentId: PropertyNavigation
        }
      ]
    },
    {
      id: 2,
      size: '60',
      minSize: '20',
      componentId: ProductIndicator
    },
    {
      id: 3,
      size: '20',
      minSize: '10',
      componentId: ProductDetails,
      hide: store.state.masters.hidePropertyView
    }
  ]
  return basePane.filter((pane:any) => !pane.hide)
})

</script>
<style lang=scss scoped>
@import '../../scss/main.scss';
</style>
