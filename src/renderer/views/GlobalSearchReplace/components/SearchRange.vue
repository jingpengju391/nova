<template>
  <div class="range-box">
    <el-select
      v-model="rangeValue"
      :multiple="selects[0].multiple"
      :placeholder="selects[0].placeholder"
    >
      <el-option
        v-for="item in selects[0].options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-select
      v-model="objectValue"
      :multiple="selects[1].multiple"
      :placeholder="selects[1].placeholder"
    >
      <el-option
        v-for="item in selects[1].options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
<script setup lang=ts>
import { rangeValue, objectValue, selects } from '../config'
</script>
<style lang="scss" scope>
.range-box{
  width: 100%;
  height: 100%;
  background: #f2f2f2;
  .el-select{
    margin: 10px 0 0 0;
  }
}
</style>
