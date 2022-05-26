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
        placeholder="请输入序列名称"
        :disabled="isFieldDisabled || disabledProduct"
        maxlength="inputNameLength"
      />

      <el-input
        v-else
        v-model="currentProperty.name"
        placeholder="请输入序列名称"
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
      <!-- :disabled="isFieldDisabled" -->
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
          :disabled="disabledProduct"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="currentProperty.copyType === 'fixed'" label="数组大小">
      <el-input-number
        v-model="currentProperty.copySize"
        :min="1"
        :disabled="disabledProduct"
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
    <el-form-item label="自动求和">
      <el-radio-group
        v-model="currentProperty.isAutoSum"
        :disabled="isFormulaDisabled || disabledProduct"
      >
        <el-radio :label="true">是</el-radio>
        <el-radio :label="false">否</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="currentProperty.isAutoSum" label="自动求和层级">
      <el-input
        v-model="currentProperty.autoSumLevel"
        :disabled="isFormulaDisabled || disabledProduct"
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
            (!currentModelNode.isProductMask &&
              item.value === SeriesSource.codeIndex) ||
            disabledProduct
          "
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="isCalcFormulaVisible" label="公式">
      <formula-input
        v-model="currentProperty.calcFormula"
        :disabled="isFormulaDisabled || disabledProduct"
        @edit="editFormula(currentProperty.calcFormula, 'calcFormula')"
      />
    </el-form-item>
    <el-form-item label="基准情景">
      <el-checkbox
        v-model="currentProperty.returnPeerModelValueBfRebase"
        :disabled="isFormulaDisabled || disabledProduct"
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
          :disabled="isFormulaDisabled || disabledProduct"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="滑动窗口">
      <el-checkbox
        v-model="currentProperty.slidingWindow"
        :disabled="isFormulaDisabled || disabledProduct"
      />
    </el-form-item>
    <el-form-item v-if="currentProperty.slidingWindow" label="窗口大小">
      <el-input-number
        v-model="currentProperty.slidingWindowChunks"
        :min="1"
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
          :disabled="isFormulaDisabled || isFieldDisabled || disabledProduct"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { SeriesSource } from '@shared/dataModelTypes/models/helpers'
import modelsDataSource from '../../../store/modules/modelsDataSource'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import { getPropertyType } from '../../../utils'
import { propertyMixin, copyTypeOptionsMixin, seriesSourceOptionsMixin } from './mixins'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'

export default defineComponent({
  mixins: [propertyMixin, copyTypeOptionsMixin, seriesSourceOptionsMixin],
  data() {
    return {
      SeriesSource
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
  },
  computed: {
    sourceOptions() {
      const modelBlockType = modelsDataSource.getModelBlockType(this.currentModelNode.id)
      const options = Object.values(SeriesSource).filter(type => {
        const noProduct = this.$route.path !== '/product'
        if (noProduct) {
          return type !== SeriesSource.codeIndexFormula
        }
        return type
      })
        .filter(type => {
          if (modelBlockType === ModelBlockType.masks) {
            return type !== SeriesSource.parent
          } else {
            const parentModelBlock = modelsDataSource.getCompleteModelBlock(this.currentModelNode.parentId)!
            const propertyType = getPropertyType(this.currentProperty)
            const parentProperty = parentModelBlock[propertyType][this.currentProperty.id] as any
            if (parentProperty && parentProperty.source === 'toDefine') {
              return type !== SeriesSource.toDefine && type !== SeriesSource.parent
            } else if (parentProperty && this.currentProperty.isDefining) {
              return type !== SeriesSource.toDefine && type !== SeriesSource.parent
            } else if (parentProperty) {
              return type !== SeriesSource.toDefine
            } else {
              return type !== SeriesSource.toDefine && type !== SeriesSource.parent
            }
          }
        })
        .map(type => {
          if (type === 'calculated') {
            return { label: '公式', value: type }
          }
          if (type === 'parent') {
            return { label: '父级', value: type }
          }
          if (type === 'toDefine') {
            return { label: '空白', value: type }
          }
          if (type === 'default') {
            return { label: '默认', value: type }
          }
          if (type === 'transmit') {
            return { label: '传递', value: type }
          }
          if (type === 'data') {
            return { label: '数据', value: type }
          }
          if (type === 'assumption') {
            return { label: '假设', value: type }
          }
          if (type === 'codeIndex' || type === 'codeIndexFormula') {
            return { label: '索引', value: type }
          }
          return { label: type, value: type }
        })

      return options
    },
    rebaseTypeOptions() {
      return [
        {
          label: '无',
          value: 0
        },
        {
          label: '重置时点下期',
          value: 1
        },
        {
          label: '重置时点当期',
          value: 2
        },
        {
          label: '重置所有时点',
          value: 3
        }
      ]
    }
  }
})
</script>
