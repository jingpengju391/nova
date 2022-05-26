/**
 * Single select but modelValue is in format of array
 * Mainly used for Projection Basic Settings Form
 */
<template>
  <el-select :model-value="selectValue" placeholder="请选择（单选）" clearable @change="onChange">
    <slot></slot>
  </el-select>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  emits: ['update:modelValue', 'change'],
  props: {
    modelValue: {
      type: Object as PropType<number[] | string[] | boolean[] | object []>,
      required: true
    }
  },
  computed: {
    selectValue(): number | string | boolean | object | null {
      return this.modelValue.length > 0 ? this.modelValue[0] : null
    }
  },
  methods: {
    onChange(value: number | string | boolean | object) {
      if (value !== '') {
        this.$emit('update:modelValue', [value])
        this.$emit('change', [value])
      } else {
        this.$emit('update:modelValue', [])
        this.$emit('change', [])
      }
    }
  }
})
</script>
