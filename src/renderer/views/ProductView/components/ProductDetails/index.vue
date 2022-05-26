
<template>
  <component :is="componentId" class="master-collapse-navigation"></component>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import CollapseNavigation from '@/views/CoderView/CollapseNavigation/index.vue'
import MasterAndProduct from './MasterAndProduct.vue'
import { getMasterNavigationNodeIdAndType, getModelNodeType, MasterNodeType, ModelNodeType } from '@/utils'
const store = useStore()
const currentMasterNode = computed(() => store.state.masters.currentMasterNode)
const currentModelNode = computed(() => store.state.models.currentModelNode)
const currentProperty = computed(() => store.state.models.currentProperty)
const componentId = computed(() => {
  const currentModelNodeType = getModelNodeType(currentModelNode.value)
  const flag = currentModelNodeType !== ModelNodeType.modelBlocks && !currentProperty.value
  if (!currentMasterNode.value) return flag ? MasterAndProduct : CollapseNavigation
  const { type, id } = getMasterNavigationNodeIdAndType(currentMasterNode.value.id)
  return (type === MasterNodeType.master || type === MasterNodeType.product) && flag ? MasterAndProduct : CollapseNavigation
})
</script>
<style lang="scss">
  .master-collapse-navigation{
    height: 100%;
    .collapse-navigation{
      border: none !important;
    }
  }
</style>
