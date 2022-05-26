<template>
  <div :class="['step-button', position, { completed, current }]" @click.capture.stop="onClick">
    <el-icon v-if="completed"><check /></el-icon>
    <span v-else class="index">{{index + 1}}</span>
    <span class="title">{{title}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, inject, ref, onMounted, onBeforeUnmount, computed } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    // could be 'start', 'middle' or 'end'
    position: {
      type: String,
      required: false,
      default: 'middle'
    }
  },
  setup(props, { emit }) {
    const parent = inject('RibbonSteps')
    const currentInstance = getCurrentInstance()

    const index = ref(0)
    const setIndex = val => (index.value = val)

    const current = ref(false)
    const setCurrent = val => (current.value = val)

    const completed = ref(false)
    const setCompleted = val => (completed.value = val)

    const stepButtonState = {
      uid: computed(() => currentInstance.uid),
      setIndex,
      setCurrent,
      setCompleted
    }

    onMounted(() => {
      setIndex(parent.stepButtons.value.length)
      if (index.value < parent.currentIndex.value) {
        setCurrent(false)
        setCompleted(true)
      } else if (index.value === parent.currentIndex.value) {
        setCurrent(true)
        setCompleted(false)
      } else {
        setCurrent(false)
        setCompleted(false)
      }
      parent.stepButtons.value = [...parent.stepButtons.value, stepButtonState]
    })

    onBeforeUnmount(() => {
      parent.stepButtons.value = parent.stepButtons.value.filter(item => item.uid !== currentInstance.uid)
    })

    const onClick = () => {
      parent.currentIndex.value = index.value
    }

    return {
      index,
      current,
      completed,
      onClick
    }
  }
})
</script>

<style lang="scss" scoped>
@use "sass:math";
$buttonWidth: 200px;
$buttonHeight: 40px;
$buttonBgColor: #eaeff7;
$buttonHoverBgColor: #70b8ff;
$activeColor: #409EFF;
$indexIconSize: 24px;

.step-button {
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 12px;
  height: $buttonHeight;
  width: $buttonWidth;
  background: $buttonBgColor;
  color: black;
  user-select: none;
  cursor: pointer;

  .index, .title {
    display: inline-block;
  }
  .index {
    margin-right: 8px;
    width: $indexIconSize;
    height: $indexIconSize;
    line-height: $indexIconSize;
    border-radius: math.div($indexIconSize, 2);
    border: 1px solid black;
  }
  &:hover {
    color: white;
    background: $buttonHoverBgColor;
    .index {
      border-color: white;
    }
  }
  &:active {
    background: $activeColor;
  }
}

.completed {
  background: $buttonBgColor;
  color: $activeColor;
  .index {
    border-color: $activeColor;
  }
  &.start {
    border-left-color: $buttonBgColor;
  }
}

.current {
  background: $activeColor;
  color: white;

  .index {
    border-color: white;
  }

  &.start::after {
    border-left-color: $activeColor;
  }

  &.middle::before {
    border-top-color: $activeColor;
    border-right-color: $activeColor;
    border-bottom-color: $activeColor;
  }
  &.middle::after {
    border-left-color: $activeColor;
  }

  &.end::after {
    border-top-color: $activeColor;
    border-bottom-color: $activeColor;
  }
}

.start {
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    top: 0;
    right: math.div($buttonHeight, -2);
    border-top: math.div($buttonHeight, 2) solid transparent;
    border-left: math.div($buttonHeight, 2) solid $buttonBgColor;
    border-bottom: math.div($buttonHeight, 2) solid transparent;
  }

  &:hover::after {
    border-left-color: $buttonHoverBgColor;
  }

  &:active::after {
    border-left-color: $activeColor;
  }
}

.middle {
  &::before {
    content: '';
    position: absolute;
    border-left: math.div($buttonHeight, 2) solid transparent;
    border-top: math.div($buttonHeight, 2) solid $buttonBgColor;
    border-bottom: math.div($buttonHeight, 2) solid $buttonBgColor;
    left: math.div($buttonHeight, -2);
    top: 0;
    background: transparent;
  }
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    top: 0;
    right: math.div($buttonHeight, -2);
    border-top: math.div($buttonHeight, 2) solid transparent;
    border-left: math.div($buttonHeight, 2) solid $buttonBgColor;
    border-bottom: math.div($buttonHeight, 2) solid transparent;
  }
  &:hover {
    &::after {
      border-left-color: $buttonHoverBgColor;
    }
    &::before {
      border-top-color: $buttonHoverBgColor;
      border-bottom-color: $buttonHoverBgColor;
    }
  }

  &:active {
    &::after {
      border-left-color: $activeColor;
    }
    &::before {
      border-top-color: $activeColor;
      border-right-color: $activeColor;
      border-bottom-color: $activeColor;
    }
  }
}

.end {
  &::after {
    content: '';
    position: absolute;
    border-left: math.div($buttonHeight, 2) solid transparent;
    border-top: math.div($buttonHeight, 2) solid $buttonBgColor;
    border-bottom: math.div($buttonHeight, 2) solid $buttonBgColor;
    left: math.div($buttonHeight, -2);
    top: 0;
    background: transparent;
  }

  &:hover::after {
    border-top-color: $buttonHoverBgColor;
    border-bottom-color: $buttonHoverBgColor;
  }

  &:active::after {
    border-top-color: $activeColor;
    border-bottom-color: $activeColor;
  }
}

</style>
