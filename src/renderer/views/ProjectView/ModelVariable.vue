<template>
  <div id = "model-variable">
    <div id = "header">
      <span>模型变量</span>
    </div>
    <div>
      <el-table :data="modelSource" border style="width: 100%">
        <el-table-column prop="name" label="变量名称"/>
        <el-table-column prop="source" label="类型"/>
      </el-table>
    </div>
  </div>
</template>

<script lang = "ts">
import { defineComponent } from 'vue'
export default defineComponent({
  data() {
    return {
      modelSource: []
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#model-variable{
  height: 100%;
  border-top :1px solid var(--nova-border-color);
  border-left: 1px solid var(--nova-border-color);
  padding: 10px;
  #header{
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    align-content: center;
    span{
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}
</style>
