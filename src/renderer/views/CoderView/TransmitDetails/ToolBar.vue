<template>
  <div class="tool-bar">
    <icon-button
      class="tool-bar-item"
      v-for="button in buttons"
      :key="button.tooltip"
      :tooltip="button.tooltip"
      :icon-class="button.iconClass"
      @click="button.onClick"
    />
  </div>
</template>
<script lang="ts" setup name="ToolBar">
import { IconButton } from '@/views/components'
import { buttons } from '../config'
</script>
<style lang="scss" scoped>
@import '../scss/tool-bar.scss';
</style>
