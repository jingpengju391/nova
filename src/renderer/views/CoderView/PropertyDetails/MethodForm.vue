<template>
  <el-form
    ref="form"
    :rules="formRules"
    :model="currentProperty"
    @submit.prevent
  >
    <el-form-item label="名称" prop="name">
      <el-input
        v-if="currentProperty.id === '0'"
        v-focus
        v-model="currentProperty.name"
        placeholder="请输入方法名称"
        :disabled="isFieldDisabled || disabledProduct"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentProperty.name"
        placeholder="请输入方法名称"
        :disabled="isFieldDisabled || disabledProduct"
        maxlength="inputNameLength"
      />
    </el-form-item>
    <el-form-item v-if="isOverrideVisible" label="重写">
      <el-checkbox
        v-model="currentProperty.override"
        :disabled="isOverrideDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item v-if="!currentProperty?.isDirect" label="定义">
      <el-checkbox
        v-model="currentProperty.isDefining"
        :disabled="disabledProduct"
        @change="onDefiningChange"
      />
      <!-- :disabled="isDefiningDisabled" -->
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        type="textarea"
        :rows="3"
        v-model="currentProperty.description"
        :disabled="isFieldDisabled || disabledProduct"
        maxlength="inputTextLength"
      />
    </el-form-item>
    <el-form-item label="参数">
      <el-input
        v-model="currentProperty.parameter"
        :disabled="isFieldDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item label="返回类型">
      <el-input
        v-model="currentProperty.returnType"
        :disabled="isFieldDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item label="来源">
      <el-select
        v-model="currentProperty.source"
        :disabled="isFormulaDisabled || disabledProduct"
        @change="onSourceChange"
      >
        <el-option
          v-for="item in sourceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="函数体">
      <formula-input
        v-model="currentProperty.calcFormula"
        :disabled="isFormulaDisabled || disabledProduct"
        @edit="editFormula(currentProperty.calcFormula, 'calcFormula')"
      />
    </el-form-item>
    <el-form-item label="选择分类">
      <el-select
        v-model="currentProperty.classify"
        placeholder="请选择分类"
        :disabled="isFormulaDisabled || isFieldDisabled || disabledProduct"
        clearable
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
<script lang="ts">
import { defineComponent } from 'vue'
import { propertyMixin } from './mixins'
import { MethodSource } from '@shared/dataModelTypes/models/helpers'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

export default defineComponent({
  mixins: [propertyMixin],
  data() {
    return {
      MethodSource
    }
  },
  watch: {
    $route: {
      handler() {
        this.disabledProduct = this.$route.path === '/product'
      },
      immediate: true,
      deep: true
    }
  }
})
</script>
