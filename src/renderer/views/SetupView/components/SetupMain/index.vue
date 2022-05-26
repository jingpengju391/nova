<template>
    <splitpanes class="main-box">
      <pane
       v-for="pane in paneConfig"
       :key="pane.id"
       :min-size="pane.minSize"
       :size="pane.size"
       :id="pane.id"
        >
       <component :is="pane.componentId"></component>
      </pane>
    </splitpanes>

</template>

<script setup lang=ts name="main">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Splitpanes, Pane } from 'splitpanes'
import SetupNavigation from '../SetupNavigation/index.vue'
import SetupDetails from '../SetupDetails/index.vue'

import 'splitpanes/dist/splitpanes.css'

const store = useStore()
const paneConfig = computed(() => {
  const basePane = [
    {
      id: 1,
      size: '20',
      minSize: '10',
      componentId: SetupNavigation
    },
    {
      id: 2,
      size: '80',
      minSize: '10',
      componentId: SetupDetails
    }

  ]
  return basePane.filter((pane:any) => !pane.hide)
})

</script>

<style lang=scss scoped>
@import '../../scss/main.scss';
</style>
