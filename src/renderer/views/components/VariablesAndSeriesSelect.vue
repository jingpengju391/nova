<template>
  <ul v-if="selectOptions.length > 0" id="select-list" >
    <li class="select-option" v-for="option in selectOptions" :key="option.id">
      <span :class="['option-label', { checked: shouldOptionChecked(option.id) }]">
        <el-icon class="icon"><document /></el-icon>
        {{option.name}}
      </span>
      <el-checkbox :model-value="shouldOptionChecked(option.id)" class="option-checkbox" @change="onOptionSelectChange(option)($event)"/>
    </li>
  </ul>
  <div v-else id="empty">无序列</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { TargetVSItem, TargetVSItemType } from '@shared/dataModelTypes/runs/targets'
import { OutputSeriesItem } from '@shared/dataModelTypes/runs/outputs'

export interface SelectOption {
  id: string
  name: string
  type?: TargetVSItemType
}

export default defineComponent({
  emits: ['update:modelValue', 'change'],
  props: {
    selectOptions: {
      type: Object as PropType<SelectOption[]>,
      required: true
    },
    modelValue: {
      type: Object as PropType<TargetVSItem[] | OutputSeriesItem[]>,
      required: true
    }

  },
  methods: {
    shouldOptionChecked(optionId: string): boolean {
      return !!this.modelValue.find(item => item.id === optionId)
    },
    onOptionSelectChange(option: SelectOption) {
      return (value: boolean) => {
        let newModelValue: TargetVSItem[] | OutputSeriesItem
        if (value) {
          if (option.type) {
            newModelValue = [
              ...this.modelValue,
              {
                ...option,
                periodFrom: 0,
                periodTo: 1,
                periodOutputFrom: 0,
                periodOutputTo: 1,
                shouldOutput: false
              }
            ]
          } else {
            newModelValue = [...this.modelValue, { ...option }]
          }
        } else {
          newModelValue = this.modelValue.filter(item => item.id !== option.id)
        }
        this.$emit('update:modelValue', newModelValue)
        this.$emit('change', newModelValue)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@use "sass:math";

.filter-input{
  width: 80%;
}
#select-list {
  list-style: none;
  padding: 0;
  user-select: none;
  width:100%;
  .label {
    color: #606266;
  }
  .checked {
    color: #409EFF;
  }
}

#empty {
  color: #909399;
}

$checkboxSize: 20px;
.select-option {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  .option-label {
    flex: 1 1 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 0;
  }
  .option-checkbox {
    flex: 0 0 auto;
    margin-left: 20px;

    &:deep(.el-checkbox__inner) {
      width: $checkboxSize;
      height: $checkboxSize;
      border-radius: math.div($checkboxSize, 2);
      border-color: #81858d;
    }
    &:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: #409EFF;
    background-color: #409EFF;
    }
    &:deep(.el-checkbox__inner:hover){
    border-color: #409EFF;
    }
    &:deep(.el-checkbox__inner::after) {
      width: math.div($checkboxSize, 4);
      height: math.div($checkboxSize, 2);
      top: 2px;
      left: 6px;
    }
  }
}
</style>
