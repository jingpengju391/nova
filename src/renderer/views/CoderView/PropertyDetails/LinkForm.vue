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
        placeholder="请输入链接名称"
        :disabled="isFieldDisabled || disabledProduct"
        maxlength="inputNameLength"
      />
      <el-input
        v-else
        v-model="currentProperty.name"
        placeholder="请输入链接名称"
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
    <el-form-item label="目标">
      <!-- v-model="currentProperty.target" -->
      <!-- value-key="maskName" -->
      <el-select
        v-model="this.currentProperty.target.maskName"
        clearable
        :disabled="
          isFieldDisabled || currentProperty.id === '0' || disabledProduct
        "
        @change="onSelectTarget"
      >
        <el-option
          v-for="item in targetOptions"
          :key="item.maskName"
          :label="item.maskName"
          :value="item.maskName"
          :disabled="disabledProduct"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="来源">
      <el-select
        v-model="currentProperty.source"
        @change="onSourceChange"
        :disabled="isFormulaDisabled || disabledProduct"
      >
        <el-option
          v-for="item in sourceOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
          :disabled="
            (!currentModelNode.isProductMask &&
              item.value === LinkSource.codeIndex) ||
            disabledProduct
          "
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="isCalcFormulaVisible" label="公式">
      <formula-input
        v-model="currentProperty.calcFormula"
        @edit="editFormula(currentProperty.calcFormula, 'calcFormula')"
        :disabled="isFormulaDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item label="数组对应">
      <el-checkbox
        v-model="currentProperty.matchCopy"
        :disabled="isFormulaDisabled || disabledProduct"
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
import { propertyMixin, linkSourceOptionsMixin } from './mixins'
import { LinkSource } from '@shared/dataModelTypes/models/helpers'
import { ElSelectV2 } from 'element-plus'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
export default defineComponent({
  data() {
    return {
      LinkSource
    }
  },
  mixins: [propertyMixin, linkSourceOptionsMixin],
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
