<template>
  <div class="tool-box">
    <el-tooltip
      class="tool-bar"
      v-for="tool in toolButtons"
      :key="tool.value"
      :effect="tool.effect"
      :content="tool.content"
      :placement="tool.placement"
    >
      <el-icon v-if="tool.componentId" :class="tool.isShowClass" @click="tool.click">
        <component :is="tool.componentId"></component>
      </el-icon>
      <h5 v-else>{{tool.title}}</h5>
    </el-tooltip>
  </div>
</template>
<script lang=ts setup name="ToolBar">
import { isShowMasterDialog, addNewMaster, openMasterDialog } from '../config'
import { ToolsTypes } from '../types'
const { toolButtons } = defineProps<{ toolButtons: ToolsTypes }>()
</script>
<style lang="scss" scoped>
@import "../scss/tool-bar.scss";
</style>
