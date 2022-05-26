<template>
  <el-form id="target-basic-setting-form" label-width="80px" @submit.prevent>
    <el-form-item label="名称">
      <el-input
        v-if="currentTarget.id === 0"
        v-focus
        v-model="currentTarget.name"
        @change="onCurrentTargetChange(false)"
      />
      <el-input
        v-else
        v-model="currentTarget.name"
        @change="onCurrentTargetChange(false)"
      />
    </el-form-item>
    <el-form-item label="模型">
      <el-input disabled :model-value="modelName" />
    </el-form-item>
    <el-form-item label="目标链接">
      <link-chain-select
        v-model="currentTarget.linkChain"
        :root-block-id="modelRootBlockId"
        @change="onCurrentTargetChange(true)"
      />
    </el-form-item>
    <el-form-item label="变量/序列">
      <el-checkbox
        class="option-checkbox"
        label="全 选"
        :model-value="checkAll"
        :indeterminate="isIndeterminate"
        @change="handleSelect"
      />
      <el-input
        class="filter-input"
        prefix-icon="search"
        placeholder="输入关键字过滤"
        v-model="filterText"
      />
      <variables-and-series-select
        v-model="currentTarget.variablesAndSeries"
        :select-options="filterTextData"
        @change="onCurrentTargetChange(false)"
      />
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VariablesAndSeriesSelect, { SelectOption } from '@/views/components/VariablesAndSeriesSelect.vue'
import LinkChainSelect from '@/views/components/LinkChainSelect.vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { Target, TargetVSItemType } from '@shared/dataModelTypes/runs/targets'
import currentTargetMixin from './mixins'
import { createNamespacedHelpers } from 'vuex'
import { equals } from '@shared/functional'
const { mapState } = createNamespacedHelpers('models/')
export default defineComponent({
  components: { VariablesAndSeriesSelect, LinkChainSelect },
  mixins: [currentTargetMixin],
  data() {
    return {
      modelRootBlockId: 0,
      filterText: ''
    }
  },
  computed: {
    ...mapState(['currentModelNode']),
    modelName(): string {
      return modelsDataSource.getModel(this.currentTarget.modelId).name
    },
    currentRootBlocklId() {
      return this.currentModelNode?.rootBlockId ? this.currentModelNode.rootBlockId : this.modelRootBlockId
    },
    filterTextData(): SelectOption[] {
      if (this.filterText.length) {
        const list = this.variablesAndSeriesOptions.filter(item => {
          return item.name.toLowerCase().includes(this.filterText.toLowerCase())
        })
        return list
      }
      return this.variablesAndSeriesOptions
    }
  },
  created() {
    if (!this.currentTarget) return
    const rootId = modelsDataSource.getModel(this.currentTarget.modelId).rootBlockId ?? 0
    this.modelRootBlockId = rootId
  },
  watch: {
    currentRootBlocklId(newVal) {
      const flag = newVal && this.currentModelNode?.id === this.currentTarget.modelId && newVal !== this.modelRootBlockId
      if (flag) {
        this.modelRootBlockId = modelsDataSource.getModel(this.currentTarget.modelId).rootBlockId ?? 0
      }
    },
    currentTarget(newVal: Target, oldVal: Target) {
      if (!newVal) return
      const flag = newVal.modelId !== oldVal.modelId
      if (flag) {
        this.modelRootBlockId = modelsDataSource.getModel(newVal.modelId).rootBlockId ?? 0
      }
      if (newVal !== oldVal) {
        this.filterText = ''
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@use "sass:math";
$checkboxSize: 20px;
.filter-input {
  width: 80%;
}
#target-basic-setting-form {
  height: 100%;
  padding: 20px;
  border-right: 1px solid var(--nova-border-color);
  overflow-y: scroll;
}
.option-checkbox {
  flex: 0 0 auto;
  margin-left: 20px;
  width: calc(100% - 20px);
  flex-flow: row-reverse;
  &:deep(.el-checkbox__input) {
    padding-left: 10px;
  }
  &:deep(.el-checkbox__inner) {
    width: $checkboxSize;
    height: $checkboxSize;
    border-radius: math.div($checkboxSize, 2);
    border-color: #81858d;
  }
  &:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: #409eff;
    background-color: #409eff;
  }
  &:deep(.el-checkbox__inner:hover) {
    border-color: #409eff;
  }

  &:deep(.el-checkbox__inner::after) {
    width: math.div($checkboxSize, 4);
    height: math.div($checkboxSize, 2);
    top: 2px;
    left: 6px;
  }
}
</style>
