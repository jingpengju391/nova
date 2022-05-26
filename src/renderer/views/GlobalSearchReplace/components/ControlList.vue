<template>
  <div class="check-ignore">
    <em>Check Or Ignore</em>
    <el-switch class="turnoff" v-model="switchSource" inline-prompt  active-text="C" inactive-text="I"></el-switch>
  </div>
  <el-scrollbar class="scrollbar-box" :height="sheight">
    <div v-for="item in cl" :key="item.value" @click="setSourceControl(item)">
      <em :class="item?.status ? 'check' : ''">{{ item.label }}</em>
      <el-icon v-if="item.status"><check /></el-icon>
    </div>
  </el-scrollbar>
</template>
<script setup lang="ts" name="control-list">
import { ControlList as cl, setSourceControl, checkSource, switchSource, variableHeight } from '../config'
import { watch, computed, reactive, onMounted } from 'vue'
import { code, ignore, codeLable } from '@shared/PrivateDeployment'
const sheight = computed(() => variableHeight.value - 100)
function initData() {
  const sourceData = checkSource(code, codeLable)
  cl.push(...sourceData)
}
initData()
</script>
<style lang="scss" scoped>
@import "../scss/control-list.scss";
</style>
