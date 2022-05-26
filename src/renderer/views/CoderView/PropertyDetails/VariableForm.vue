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
        placeholder="请输入变量名称"
        :disabled="isFieldDisabled || disabledProduct"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentProperty.name"
        v-focus
        placeholder="请输入变量名称"
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
    <el-form-item v-if="currentModelNode.parentId" label="定义">
      <el-checkbox
        v-model="currentProperty.isDefining"
        :disabled="isDefiningDisabled || disabledProduct"
        @change="onDefiningChange"
      />
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        type="textarea"
        :rows="3"
        v-model="currentProperty.description"
        :disabled="isFieldDisabled || isFormulaDisabled || disabledProduct"
        maxlength="inputTextLength"
      />
    </el-form-item>
    <el-form-item label="数据类型">
      <el-select
        v-model="currentProperty.type"
        :disabled="isFieldDisabled || disabledProduct"
      >
        <el-option
          v-for="item in typeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="数组类型">
      <el-select
        v-model="currentProperty.copyType"
        :disabled="isFormulaDisabled || disabledProduct"
      >
        <el-option
          v-for="item in $options.copyTypeOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="currentProperty.copyType === 'fixed'" label="数组大小">
      <el-input-number
        v-model="currentProperty.copySize"
        :disabled="isFormulaDisabled || disabledProduct"
        :min="1"
      />
    </el-form-item>
    <el-form-item label="允许调整数组大小">
      <el-checkbox
        v-model="currentProperty.allowManualResize"
        :disabled="isFormulaDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item
      v-if="currentProperty.copyType === 'dynamic'"
      label="数组大小公式"
    >
      <formula-input
        v-model="currentProperty.copyFormula"
        :disabled="isFormulaDisabled || disabledProduct"
        @edit="editFormula(currentProperty.copyFormula, 'copyFormula')"
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
          :disabled="
            !currentModelNode.isProductMask &&
            item.value === VariableSource.codeIndex
          "
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="isValueInputVisible" label="默认值">
      <el-input
        v-model="currentProperty.valueInput"
        :disabled="isFormulaDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item v-if="isCalcFormulaVisible" label="公式">
      <formula-input
        v-model="currentProperty.calcFormula"
        :disabled="isFormulaDisabled || disabledProduct"
        @edit="editFormula(currentProperty.calcFormula, 'calcFormula')"
      />
    </el-form-item>
    <el-form-item label="起点重置类型">
      <el-select
        v-model="currentProperty.rebaseType"
        placeholder="请选择起点重置类型"
        :disabled="isFormulaDisabled || disabledProduct"
      >
        <el-option
          v-for="option in rebaseTypeOptions"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :disabled="isFormulaDisabled"
        />
      </el-select>
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
          :disabled="disabledProduct"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { propertyMixin, copyTypeOptionsMixin } from './mixins'
import { VariableType, VariableSource } from '@shared/dataModelTypes/models/helpers'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

export default defineComponent({
  mixins: [propertyMixin, copyTypeOptionsMixin],
  data() {
    return {
      VariableSource
    }
  },
  computed: {
    typeOptions() {
      return Object.values(VariableType).map(type => {
        if (type === 'integer') {
          return { label: '整数', value: type }
        }
        if (type === 'double') {
          return { label: '浮点数', value: type }
        }
        if (type === 'string') {
          return { label: '字符', value: type }
        }
        if (type === 'table') {
          return { label: '表格', value: type }
        }
        return { label: type, value: type }
      })
    },
    rebaseTypeOptions() {
      return [
        {
          label: '无',
          value: 0
        },
        {
          label: '重置',
          value: 1
        }
      ]
    },
    route() {
      return this.$route
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
