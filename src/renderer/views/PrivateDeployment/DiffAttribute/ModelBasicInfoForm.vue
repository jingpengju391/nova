<template>
  <el-form ref="form" :model="currentModelNode" @submit.prevent>
    <el-form-item
      label="名称"
      prop="name"
      :class="currentDiffKey === 'name' ? 'diff-label' : ''"
    >
      <el-input
        v-if="currentModelNode.id === 0"
        disabled
        v-focus
        v-model="currentModelNode.name"
        placeholder="请输入模型名称"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        disabled
        v-model="currentModelNode.name"
        placeholder="请输入模型名称"
        maxlength="inputNameLength"
      />
    </el-form-item>
    <el-form-item label="根Block">
      <root-block-selector disabled v-model="currentModelNode.rootBlockId" />
    </el-form-item>
    <el-form-item
      label="描述"
      :class="currentDiffKey === 'description' ? 'diff-label' : ''"
    >
      <el-input
        type="textarea"
        disabled
        :rows="3"
        v-model="currentModelNode.description"
        maxlength="inputTextLength"
      />
    </el-form-item>
    <el-form-item
      label="标签"
      :class="currentDiffKey === 'tags' ? 'diff-label' : ''"
    >
      <span class="tag" v-for="tag in currentModelNode.tags" :key="tag">{{
        tag
      }}</span>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts" name="ModelBasicInfoForm">
import { currentModelNode, currentDiffKey } from '../config'
import RootBlockSelector from '../../components/RootBlockSelector.vue'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
