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
        placeholder="请输入变量名称"
        disabled
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentProperty.name"
        v-focus
        placeholder="请输入变量名称"
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
      label="类型"
      :class="currentDiffKey === 'type' ? 'diff-label' : ''"
    >
      <el-select v-model="currentProperty.type" disabled>
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="数组"
      :class="currentDiffKey === 'copyType' ? 'diff-label' : ''"
    >
      <el-select v-model="currentProperty.copyType" disabled>
        <el-option
          v-for="item in $options.copyTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="currentProperty.copyType === 'fixed'"
      label="数组大小"
      :class="currentDiffKey === 'copySize' ? 'diff-label' : ''"
    >
      <el-input-number v-model="currentProperty.copySize" disabled :min="1" />
    </el-form-item>
    <el-form-item
      label="允许调整数组大小"
      :class="currentDiffKey === 'allowManualResize' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentProperty.allowManualResize" />
    </el-form-item>
    <el-form-item
      v-if="currentProperty.copyType === 'dynamic'"
      label="数组大小公式"
      :class="currentDiffKey === 'copyFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentProperty.copyFormula }}</span>
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
      v-if="isValueInputVisible"
      label="Value Input"
      :class="currentDiffKey === 'valueInput' ? 'diff-label' : ''"
    >
      <el-input v-model="currentProperty.valueInput" disabled />
    </el-form-item>
    <el-form-item
      v-if="isCalcFormulaVisible"
      label="公式"
      :class="currentDiffKey === 'calcFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentProperty.calcFormula }}</span>
    </el-form-item>
    <el-form-item
      label="起点重置类型"
      :class="currentDiffKey === 'rebaseType' ? 'diff-label' : ''"
    >
      <el-select
        v-model="currentProperty.rebaseType"
        placeholder="请选择起点重置类型"
        disabled
      >
        <el-option
          v-for="option in rebaseTypeOptions"
          :key="option.value"
          :value="option.value"
          :label="option.label"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="选择分类"
      :class="currentDiffKey === 'classify' ? 'diff-label' : ''"
    >
      <el-select
        disabled
        v-model="currentProperty.classify"
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
<script setup lang="ts" name="VariableForm">
import {
  rebaseTypeOptions, typeOptions, isOverrideVisible, sourceOptions,
  isValueInputVisible, isCalcFormulaVisible, currentClassIfy,
  currentProperty, currentDiffKey
} from '../config'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
