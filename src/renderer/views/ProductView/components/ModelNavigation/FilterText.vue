<template>
  <el-input
    style="margin-bottom: 10px"
    v-model="modelFilterText"
    placeholder="输入关键字过滤"
    maxlength="inputNameLength"
    :prefix-icon="Search"
  />
</template>
<script lang=ts setup name="FilterText">
import { Search } from '@element-plus/icons-vue'
import { modelFilterText } from '../../config'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
