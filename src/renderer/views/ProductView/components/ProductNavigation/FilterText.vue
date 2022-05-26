<template>
  <el-input
    style="margin-bottom: 10px"
    v-model="filterText"
    maxlength="inputNameLength"
    placeholder="输入关键字过滤"
    :prefix-icon="Search"
  />
</template>
<script lang=ts setup name="FilterText">
import { Search } from '@element-plus/icons-vue'
import { filterText } from '../../config'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
