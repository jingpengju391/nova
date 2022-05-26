<template>
  <div class="navi-con">
    <el-tree
      ref="modelNaviTree"
      :node-key="nodeKey"
      :data="treeData"
      :current-node-key="active"
      :props="defaultProps"
      class="navi-tree-navi"
      :expand-on-click-node="false"
      empty-text="无匹配结果"
      :check-on-click-node="false"
      :highlight-current="true"
      default-expand-all
      @node-click="onClickRunnerNaviNode"
    >
      <template #default="{ node }">
        <span>
          <el-icon class="icon"><document /></el-icon>
          {{node.data.label}}
        </span>
      </template>
    </el-tree>
  </div>
</template>
<script setup lang=ts name="RunnerNavigation">
import { defaultProps, nodeKey, treeData, onClickRunnerNaviNode, active } from '../config'
</script>
<style lang="scss" scoped>
.navi-con {
  display: flex;
  height: 100%;
  width: 100%;
  padding: 10px;
  background-color: #f4f9fd;
  border-right: 1px solid #d0d0d0;
  .navi-tree-navi {
    width: 100%;
    background-color: transparent;
    &:deep(.is-current > .el-tree-node__content){
        background: #CCE9FF;
    }
    &:deep(.el-tree-node__content){
      height: 32px;
    }
    &:deep(.is-current > .el-tree-node__content span){
      color: #000;
      font-weight: 500;
    }
    &:deep(.is-current > .el-tree-node__content .el-icon-caret-right:before ){
    content: "\e791";
    }
  }
}
</style>
