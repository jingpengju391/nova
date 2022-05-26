<template>
  <el-tabs class="tabs-box" v-model="currtenPtroductFormulas" tab-position="left">
    <el-tab-pane v-for="item in productFormulas" :key="item.value" :label="item.label" :name="item.value"></el-tab-pane>
  </el-tabs>
</template>
<script setup lang=ts name="IndicatorClassify">
import { productFormulas, currtenPtroductFormulas } from '../../config'
</script>
<style lang="scss" scope>
.tabs-box{
  height: 100%;
}
</style>
