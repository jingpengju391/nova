<template>
  <el-collapse :model-value="modelValue" ref="collapseRef" accordion
    @change="$emit('update:modelValue', $event)">
    <slot></slot>
  </el-collapse>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, provide, computed } from 'vue'

export default defineComponent({
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  setup(props, ctx) {
    const contentHeight = ref(30)
    const collapseRef = ref(null)
    const collapseParentHeight = ref(0)
    const collapseItemHeaderHeight = 48 // value set by elment-ui

    const onWidthOrHeightChange = () => {
      const collapse = collapseRef.value.$el as HTMLElement
      collapseParentHeight.value = collapse.getBoundingClientRect().height
    }
    onMounted(() => {
      onWidthOrHeightChange()
      window.addEventListener('resize', onWidthOrHeightChange)
    })
    onUnmounted(() => window.removeEventListener('resize', onWidthOrHeightChange))

    const collapseItemContentHeight = computed(() => collapseParentHeight.value - ctx.slots.default().length * collapseItemHeaderHeight)

    provide('CollapseItemContentHeight', collapseItemContentHeight)

    return { contentHeight, collapseRef }
  }
})
</script>
