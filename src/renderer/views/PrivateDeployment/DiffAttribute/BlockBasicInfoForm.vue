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
        placeholder="请输入模块/子模块名称"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentModelNode.name"
        disabled
        placeholder="请输入模块/子模块名称"
        maxlength="inputNameLength"
      />
    </el-form-item>
    <el-form-item
      label="描述"
      :class="currentDiffKey === 'description' ? 'diff-label' : ''"
    >
      <el-input
        type="textarea"
        :rows="3"
        disabled
        v-model="currentModelNode.description"
        maxlength="inputTextLength"
      />
    </el-form-item>
    <el-form-item
      label="标签"
      :class="currentDiffKey === 'tags' ? 'diff-label' : ''"
    >
      <el-tag class="tag" v-for="tag in currentModelNode.tags" :key="tag">
        {{ tag }}
      </el-tag>
    </el-form-item>
    <el-form-item
      label="数组模块"
      :class="currentDiffKey === 'copyType' ? 'diff-label' : ''"
    >
      <el-select v-model="currentModelNode.copyType" disabled>
        <el-option
          v-for="item in $options.copyTypeBlockOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.copyType === 'data'"
      label="分组标签"
      :class="currentDiffKey === 'groupSeparators' ? 'diff-label' : ''"
    >
      <el-select
        v-model="currentModelNode.groupSeparators"
        filterable
        multiple
        disabled
      >
        <el-option
          v-for="option in groupSeparatorOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.copyType === 'fixed'"
      disabled
      label="数组大小"
      :class="currentDiffKey === 'copySize' ? 'diff-label' : ''"
    >
      <el-input-number v-model="currentModelNode.copySize" :min="1" />
    </el-form-item>
    <el-form-item
      label="允许调整数组大小"
      :class="currentDiffKey === 'allowManualResize' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentModelNode.allowManualResize" />
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.copyType === 'dynamic'"
      disabled
      label="数组大小函数"
      :class="currentDiffKey === 'copySizeFunctionLines' ? 'diff-label' : ''"
    >
      <span>{{ currentModelNode.copySizeFunctionLines }}</span>
    </el-form-item>
    <el-form-item
      label="起点重置"
      :class="currentDiffKey === 'rebaseNeeded' ? 'diff-label' : ''"
    >
      <el-radio-group v-model="currentModelNode.rebaseNeeded" disabled>
        <el-radio label="yes">是</el-radio>
        <el-radio label="no">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.rebaseNeeded === 'yes'"
      label="关联重置"
      :class="currentDiffKey === 'runAfterRebaseFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentModelNode.runAfterRebaseFormula }}</span>
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.rebaseNeeded === 'yes'"
      label="基准模型"
      :class="currentDiffKey === 'rebaseBaseFunctionLines' ? 'diff-label' : ''"
    >
      <span>{{ currentModelNode.rebaseBaseFunctionLines }}</span>
    </el-form-item>
    <el-form-item
      label="滑动窗口"
      :class="currentDiffKey === 'slidingWindow' ? 'diff-label' : ''"
    >
      <el-checkbox v-model="currentModelNode.slidingWindow" disabled />
    </el-form-item>
    <el-form-item
      label="初始化函数"
      :class="currentDiffKey === 'initializeFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentModelNode.initializeFormula }}</span>
    </el-form-item>
    <el-form-item
      label="结束函数"
      :class="currentDiffKey === 'finalizeFormula' ? 'diff-label' : ''"
    >
      <span>{{ currentModelNode.finalizeFormula }}</span>
    </el-form-item>
    <el-form-item
      label="程序变量定义"
      :class="currentDiffKey === 'definitions' ? 'diff-label' : ''"
    >
      <span>{{ currentModelNode.definitions }}</span>
    </el-form-item>
    <!-- <el-form-item label="Share" :class="currentDiffKey === 'share' ? 'diff-label' :''">
      <el-radio-group v-model="currentModelNode.share" disabled>
        <el-radio :label="true">true</el-radio>
        <el-radio :label="false">false</el-radio>
      </el-radio-group>
    </el-form-item> -->
    <!-- <el-form-item label="Static" :class="currentDiffKey === 'static' ? 'diff-label' :''">
      <el-radio-group v-model="currentModelNode.static" disabled>
        <el-radio :label="true">true</el-radio>
        <el-radio :label="false">false</el-radio>
      </el-radio-group>
    </el-form-item> -->
  </el-form>
</template>
<script setup lang="ts" name="BlockBasicInfoForm">
import { groupSeparatorOptions, currentModelNode, currentDiffKey } from '../config'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
</script>
