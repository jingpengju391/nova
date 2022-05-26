<template>
  <el-steps
    id="steps"
    ref="stepsRef"
    :active="modelValue"
    direction="vertical"
    @click="onStepClick"
  >
    <el-step
      v-for="(option, index) in stepOptions"
      :key="option.label + index"
      :title="option.label"
      icon="arrow-down"
      :class="option.status === 'error' ? 'reddd' : ''"
    />
  </el-steps>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue'

export default defineComponent({
  props: {
    stepOptions: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Number,
      required: true
    }
  },
  setup(props, ctx) {
    const stepsRef = ref(null)

    const onStepClick = (event: MouseEvent) => {
      const stepElement = stepsRef.value.$el as HTMLElement
      const { y: stepElementY, height: stepElementHeight } = stepElement.getBoundingClientRect()
      const newActiveStep = Math.floor((event.clientY - stepElementY) / stepElementHeight * props.stepOptions.length)
      ctx.emit('update:modelValue', newActiveStep)
    }

    return { stepsRef, onStepClick }
  }
})
</script>

<style lang="scss" scoped>
$isProcessColor: #409eff;
$hoverColor: rgb(121, 187, 255);
$inactiveColor: #c0c4cc;

#steps {
  height: 100%;
  .el-step.is-vertical {
    color: red;
  }
  &:deep(.el-step.is-vertical) {
    width: 100px;
    flex-direction: row-reverse;
  }
  .reddd {
    color: red;
    &:deep(.el-step__main) {
      margin-right: 10px;
    }

    &:deep(.el-step__title.is-process) {
      color: red;
    }
    &:deep(.el-step__title) {
      color: red;
      font-weight: bold;
    }
  }
  &:deep(.el-step__main) {
    margin-right: 10px;
  }
  &:deep(.el-step__icon-inner) {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 15px;
    border-radius: 50%;
    border: 1px solid $inactiveColor;
    color: $inactiveColor;
  }
  &:deep(.el-step:hover .el-step__icon-inner) {
    background: $hoverColor;
    border-color: $hoverColor;
    color: white;
  }
  &:deep(.el-step__head.is-process > .el-step__icon > .el-step__icon-inner) {
    background: $isProcessColor;
    border-color: $isProcessColor;
    color: white;
  }
  &:deep(.el-step__title) {
    user-select: none;
    color: $inactiveColor;
  }
  &:deep(.el-step:hover .el-step__title) {
    color: $hoverColor;
  }
  &:deep(.el-step__title.is-process) {
    color: $isProcessColor;
  }
}
</style>
