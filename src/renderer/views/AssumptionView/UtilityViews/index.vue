<template>
  <el-tabs class="tabs-box" v-model="activeName">
    <el-tab-pane label="信息台" name="Console">
      <component :is="Console" />
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts" name="UtilityViews">
import { ref } from 'vue'
import Console from './Console.vue'
const activeName = ref('Console')
</script>
<style lang="scss" scoped>
.el-tabs__nav-scroll{
  padding-left: 10px;
}
.tabs-box{
  &:deep(.el-tabs__nav:first-of-type) {
    margin-left: 10px;
  }
  &:deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  &:deep(.el-tabs__content) {
    margin-left: 10px;
  }
}
</style>
