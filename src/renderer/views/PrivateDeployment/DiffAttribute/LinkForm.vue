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
        placeholder="请输入链接名称"
        disabled
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentProperty.name"
        placeholder="请输入链接名称"
        disabled
        maxlength="inputNameLength"
      />
    </el-form-item>
    <el-form-item
      v-if="isOverrideVisible"
      label="Override"
      :class="currentDiffKey === 'override' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentProperty.override" disabled />
    </el-form-item>
    <el-form-item
      v-if="!currentProperty?.isDirect"
      label="Defining"
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
      label="目标"
      :class="currentDiffKey === 'target' ? 'diff-label' : ''"
    >
      <el-select
        v-model="currentProperty.target"
        value-key="maskName"
        clearable
        disabled
      >
        <el-option
          v-for="item in targetOptions"
          :key="item.maskName"
          :label="item.maskName"
          :value="item"
        />
      </el-select>
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
      v-if="isCalcFormulaVisible"
      label="公式"
      :class="currentDiffKey === 'calcFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentProperty.calcFormula }}</span>
    </el-form-item>
    <el-form-item
      label="Match Copy"
      :class="currentDiffKey === 'matchCopy' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentProperty.matchCopy" disabled />
    </el-form-item>
    <el-form-item
      label="选择分类"
      :class="currentDiffKey === 'classify' ? 'diff-label' : ''"
    >
      <el-select
        v-model="currentProperty.classify"
        disabled
        placeholder="请选择分类"
      >
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
<script setup lang="ts" name="LinkForm">
import {
  isOverrideVisible, sourceOptions, isCalcFormulaVisible,
  currentClassIfy, targetOptions, currentProperty, currentDiffKey
} from '../config'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
