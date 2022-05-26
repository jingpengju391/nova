<template>
  <el-form ref="form" :model="currentProperty" @submit.prevent>
    <el-form-item
      label="名称"
      prop="name"
      :class="currentDiffKey === 'name' ? 'diff-label' : ''"
    >
      <el-input
        v-if="currentProperty.id === '0'"
        v-focus
        v-model="currentProperty.name"
        placeholder="请输入方法名称"
        disabled
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentProperty.name"
        placeholder="请输入方法名称"
        disabled
        maxlength="inputNameLength"
      />
    </el-form-item>
    <el-form-item
      v-if="isOverrideVisible"
      label="重写"
      :class="currentDiffKey === 'override' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentProperty.override" disabled />
    </el-form-item>
    <el-form-item
      v-if="!currentProperty?.isDirect"
      label="定义"
      :class="currentDiffKey === 'isDefining' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentProperty.isDefining" disabled />
    </el-form-item>
    <el-form-item
      label="描述"
      :class="currentDiffKey === 'description' ? 'diff-label' : ''"
    >
      <el-input
        type="textarea"
        :rows="3"
        v-model="currentProperty.description"
        disabled
        maxlength="inputTextLength"
      />
    </el-form-item>
    <el-form-item
      label="参数"
      :class="currentDiffKey === 'parameter' ? 'diff-label' : ''"
    >
      <el-input v-model="currentProperty.parameter" disabled />
    </el-form-item>
    <el-form-item
      label="返回类型"
      :class="currentDiffKey === 'returnType' ? 'diff-label' : ''"
    >
      <el-input v-model="currentProperty.returnType" disabled />
    </el-form-item>
    <el-form-item
      label="来源"
      :class="currentDiffKey === 'source' ? 'diff-label' : ''"
    >
      <el-select v-model="currentProperty.source" disabled>
        <el-option
          v-for="item in sourceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="函数体"
      :class="currentDiffKey === 'calcFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentProperty.calcFormula }}</span>
    </el-form-item>
    <el-form-item
      label="选择分类"
      :class="currentDiffKey === 'classify' ? 'diff-label' : ''"
    >
      <el-select v-model="currentProperty.classify" placeholder="请选择分类">
        <el-option
          v-for="option in currentClassIfy"
          :key="option.name"
          :value="option.name"
          :label="option.name"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script setup lang="ts" name="MethodForm">
import { isOverrideVisible, sourceOptions, currentClassIfy, currentProperty, currentDiffKey } from '../config'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
