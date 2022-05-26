<template>
  <!-- <div class="bar-box">
    <el-icon class="bar-icon-delete" @click="store.commit('tasks/clearPrintLines')">
      <delete />
    </el-icon>
  </div> -->
  <div class="console-box">
    <console />
  </div>
</template>
<script setup lang="ts">
import Console from '@/views/components/Console.vue'
import { useStore } from 'vuex'
const store = useStore()
</script>
<style lang="scss" scoped>
// .bar-box{
//   display: flex;
//   width: 100%;
//   padding: 5px;
//   flex-direction: row-reverse;
//   .bar-icon-delete{
//     color: #8a8a8a;
//   }
//   .bar-icon-delete:hover{
//     color: #232323;
//   }
// }
.console-box {
  height: calc(100% - 40px);
}
#tabs {
  position: relative;
  height: 100%;
  background: #fff;
  &:deep(.el-tabs__nav) {
    margin: 0 12px;
  }
  &:deep(.el-tabs__content) {
    height: calc(100% - 40px - 15px);
    .el-tab-pane {
      height: 100%;
    }
  }

  &:deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  &:deep(.el-tabs__item) {
    font-size: 80% !important;
  }
  &:deep(.el-tabs__nav:first-of-type) {
    margin-left: 20px;
  }
}
#tabs::before {
  content: "";
  position: absolute;
  display: block;
  width: 100%;
  height: 1px;
  background: #d0d0d0;
  top: -1px;
}
</style>
