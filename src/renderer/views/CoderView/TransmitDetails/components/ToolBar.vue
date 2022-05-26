<template>
  <div class="tool-bar">
    <!-- <el-button type="danger"  @click="deleteTransmit()" plain >删除</el-button>
    <el-button type="primary" @click="addTransmit()"  plain>添加</el-button> -->
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
import { buttons, addTransmit, deleteTransmit } from '../../config'
</script>
<style lang="scss" scoped>
@import '../../scss/tool-bar.scss';
</style>
