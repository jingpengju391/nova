<template>
  <div :class="['nova-context-menu-item', { disabled: !!menuItem.disabled }]" @click='menuItem.onClick'>
    <span>{{menuItem.title}}</span>
    <span>{{menuItem.shortCut}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import type { ContextMenuItemProps } from './types'

export default defineComponent({
  props: {
    menuItem: {
      type: Object as PropType<ContextMenuItemProps>,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.nova-context-menu-item {
  display: flex;
  justify-content: space-between;
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
  user-select: none;

  &:hover {
    background-color: #EEEEEE;
    color: #3B8BFF;
  }
}
.nova-context-menu-item.disabled {
  pointer-events: none;
  cursor: not-allowed;
  color: #C0C4CC;
}
</style>
