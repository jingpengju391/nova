<template>
  <el-collapse-item class="collapse-item" :name="name">
    <template #title>
      <slot name="title">{{title}}</slot>
    </template>
    <div class="collapse-content" :style="{ height: contentHeight + 'px' }">
      <slot></slot>
    </div>
  </el-collapse-item>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue'

export default defineComponent({
  name: 'CollapseItem',
  props: {
    title: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      required: true
    }
  },
  setup() {
    const contentHeight = inject('CollapseItemContentHeight')
    return { contentHeight }
  }
})
</script>

<style lang="scss" scoped>
.collapse-item {
  &:deep(.el-collapse-item__arrow) {
    order: -1;
    margin: 0 4px 0 6px;
    font-size: 110%;
  }

  &:deep(.el-collapse-item__header:hover) {
    .collapse-title > .tool-sets {
      opacity: 1;
    }
  }

  &:deep(.el-collapse-item__header.is-active) {
    border-bottom-color: rgb(235, 238, 245);
  }

  &:deep(.el-collapse-item__wrap) {
    background-color: transparent !important;
    .el-collapse-item__content {
      padding: 0;
    }
  }
}
.collapse-content {
  display: flex;
}
</style>
