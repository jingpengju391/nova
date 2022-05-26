<template>
  <el-form
    ref="form"
    :rules="formRules"
    :model="currentModelNode"
    @submit.prevent
  >
    <el-form-item label="名称" prop="name">
      <!-- auto focus the name input when this is a new model -->
      <el-input
        v-if="currentModelNode.id === 0"
        v-focus
        v-model="currentModelNode.name"
        placeholder="请输入模块/子模块名称"
        :disabled="$route.path === '/product'"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentModelNode.name"
        placeholder="请输入模块/子模块名称"
        maxlength="inputNameLength"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        type="textarea"
        :rows="3"
        maxlength="inputTextLength"
        v-model="currentModelNode.description"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="标签">
      <tags-input
        v-model="currentModelNode.tags"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="数组模块">
      <el-select
        v-model="currentModelNode.copyType"
        :disabled="$route.path === '/product'"
      >
        <el-option
          v-for="item in $options.copyTypeBlockOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="$route.path === '/product'"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="currentModelNode.copyType === 'data'" label="分组标签">
      <el-select v-model="currentModelNode.groupSeparators" multiple>
        <el-option
          v-for="option in groupSeparatorOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
          :disabled="$route.path === '/product'"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="currentModelNode.copyType === 'fixed'" label="数组大小">
      <el-input-number
        v-model="currentModelNode.copySize"
        :min="1"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="允许调整数组大小">
      <el-checkbox
        v-model="currentModelNode.allowManualResize"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.copyType === 'dynamic'"
      label="数组大小函数"
    >
      <formula-input
        v-model="currentModelNode.copySizeFunctionLines"
        @edit="
          editFormula(
            currentModelNode.copySizeFunctionLines,
            'copySizeFunctionLines'
          )
        "
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="产品">
      <el-radio-group
        v-model="currentModelNode.isProductMask"
        :disabled="!!isProductDisabled"
      >
        <el-radio :label="1">是</el-radio>
        <el-radio :label="0">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="起点重置">
      <el-radio-group
        v-model="currentModelNode.rebaseNeeded"
        :disabled="$route.path === '/product'"
      >
        <el-radio label="yes">是</el-radio>
        <el-radio label="no">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.rebaseNeeded === 'yes'"
      label="关联重置"
    >
      <formula-input
        v-model="currentModelNode.runAfterRebaseFormula"
        @edit="
          editFormula(
            currentModelNode.runAfterRebaseFormula,
            'runAfterRebaseFormula'
          )
        "
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item
      v-if="currentModelNode.rebaseNeeded === 'yes'"
      label="基准情景"
    >
      <formula-input
        v-model="currentModelNode.rebaseBaseFunctionLines"
        @edit="
          editFormula(
            currentModelNode.rebaseBaseFunctionLines,
            'rebaseBaseFunctionLines'
          )
        "
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="滑动窗口">
      <el-checkbox
        v-model="currentModelNode.slidingWindow"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="初始化函数">
      <formula-input
        v-model="currentModelNode.initializeFormula"
        @edit="
          editFormula(currentModelNode.initializeFormula, 'initializeFormula')
        "
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="结束函数">
      <formula-input
        v-model="currentModelNode.finalizeFormula"
        @edit="editFormula(currentModelNode.finalizeFormula, 'finalizeFormula')"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <el-form-item label="程序变量定义">
      <formula-input
        v-model="currentModelNode.definitions"
        @edit="editFormula(currentModelNode.definitions, 'definitions')"
        :disabled="$route.path === '/product'"
      />
    </el-form-item>
    <!-- <el-form-item label="Share">
      <el-radio-group v-model="currentModelNode.share">
        <el-radio :label="true">true</el-radio>
        <el-radio :label="false">false</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="Static">
      <el-radio-group v-model="currentModelNode.static">
        <el-radio :label="true">true</el-radio>
        <el-radio :label="false">false</el-radio>
      </el-radio-group>
    </el-form-item> -->
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { modelNodeMixin, copyTypeBlockOptionsMixin } from './mixins'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

export default defineComponent({
  mixins: [modelNodeMixin, copyTypeBlockOptionsMixin]

})
</script>
