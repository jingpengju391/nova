<template>
  <div class="component-box">
    <!-- <component :is="componentId"></component> -->
    <Property v-show="isProperty"/>
    <Indicator v-show="!isProperty" />
  </div>
</template>
<script setup lang=ts name="Navigation">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import Indicator from './Indicator.vue'
import Property from './Property.vue'
const route = useRoute()
const store = useStore()
// const componentId = computed(() => {
//   const currentModelNode = store.state.models.currentModelNode
//   if (currentModelNode) {
//     return currentModelNode.modelId ? Property : Indicator
//   }
//   return Indicator
// })
const isProperty = computed(() => {
  const currentModelNode = store.state.models.currentModelNode

  if (route.path === '/product') {
    return true
  }

  if (currentModelNode) {
    return !!currentModelNode.modelId
  }
  return false
})
</script>
<style lang="scss" scoped>
.component-box {
  height: 100%;
  overflow: hidden;
}
</style>
