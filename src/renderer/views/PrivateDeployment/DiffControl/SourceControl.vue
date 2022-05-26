<template>
  <div class="control-box">
    <div class="control-title">{{scc.title}}</div>
    <icon-button class="tool-bar-item" tooltip="导入模型" icon-class="download" @click="importDiffModel" />
    <el-tooltip
      effect="dark"
      content="Refresh"
      placement="bottom"
    >
      <i class="control-btn iconfont" @click="setSourceControlCenter">&#xe641;</i>
    </el-tooltip>
    <el-tooltip
      effect="dark"
      content="views and More Action..."
      placement="bottom"
    >
      <div class="more-box">
        <el-popover
        :placement="scc.placement"
        :width="scc.width"
        :trigger="scc.trigger">
          <template #reference>
            <el-icon>
              <more-filled />
            </el-icon>
          </template>
          <control-list />
        </el-popover>
      </div>
    </el-tooltip>
  </div>
</template>
<script setup lang="ts" name="source-control">
import { ControlList } from '../DiffControl'
import { SourceControlConstant as scc, setSourceControlCenter, importDiffModel } from '../config'
import IconButton from '@/views/components/IconButton.vue'
</script>
<style lang="scss" scoped>
@import '../scss/source-control.scss';
</style>
