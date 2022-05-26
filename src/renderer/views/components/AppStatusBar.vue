<template>
  <div id="status-bar">
    <el-button class="bar-item console" type="text" @click="$emit('toggle-console')">信息台</el-button>
    <span>{{name}}{{version}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import config from '../../../../package.json'

export default defineComponent({

  data: function() {
    return {
      name: config.name,
      version: config.version
    }
  },
  emits: ['toggle-console']
})
</script>

<style lang="scss" scoped>
$activeColor: cornflowerblue;

#status-bar {
  border-top: 1px solid #D0D0D0;
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-flow: row nowrap;
  padding: 0;
  span{
    margin-right: 20px;
  }
}
.bar-item {
  margin-right: 20px;
  padding: 0 10px;
}
.console {
  min-height: 26px;
  color: #606266;
  border: none;
  border-radius: 0;
  &:focus {
    color: #606266;
  }
  &:hover {
    color: white;
    background: $activeColor;
  }
  &:active {
    background: lighten($activeColor, 5%);
  }
}
</style>
