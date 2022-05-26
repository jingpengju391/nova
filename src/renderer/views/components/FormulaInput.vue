<template>
  <div class="formula-input">
    <div class="formula-preview">{{ modelValue !== "" ? modelValue : "(无)" }}</div>
    <el-button class="edit-button" type="text" @click="$emit('edit')">{{ disabled ? "查看" : "编辑" }}</el-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  emits: ['edit'],
  props: {
    modelValue: {
      type: String,
      required: false,
      default: ''
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    }
  }
})
</script>

<style lang="scss" scoped>
.formula-input {
  display: flex;
  flex-flow: row column;

  .edit-button {
    opacity: 0;
  }

  &:hover {
    .edit-button {
      transition-delay: 0.3s;
      opacity: 1;
    }
  }

  .formula-preview {
    max-width: 150px;
    margin-right: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
