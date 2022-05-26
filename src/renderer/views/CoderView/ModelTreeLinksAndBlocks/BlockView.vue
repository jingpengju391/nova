<template>
  <div id="navigation-view">
    <tool-bar @onClickNewModelBlock="onClickNewModelBlock" />
    <block-navigation ref="blockNavigation" />
  </div>
</template>
<script lang=ts setup>
import ToolBar from './ToolBar.vue'
import BlockNavigation from './BlockNavigation.vue'
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { getModelNodeType } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
const store = useStore()
const blockNavigation = ref<HTMLElementAny>()
const currentModelNode = computed(() => store.state.models.currentModelNode)
function onClickNewModelBlock() {
  const type = getModelNodeType(currentModelNode.value)
  blockNavigation.value && blockNavigation.value.onClickNewModelBlock({
    id: type + NaviNodeIdDelimiter + currentModelNode.value.id,
    name: currentModelNode.value.name
  })
}

</script>

<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";
#navigation-view {
  padding-top: 1px;
  border-right: 1px solid var(--nova-border-color);
  border-top: 1px solid var(--nova-border-color);
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  background: $naviBgColor;
  .model-nav-tree {
    height: calc(100% - 30px);
  }
}
.model-nav-tree {
  &:deep(.el-dialog__body) {
    overflow: hidden;
  }
  &:deep(.el-dialog__footer) {
    text-align: center;
  }
}
</style>
