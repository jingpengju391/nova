<template>
  <div id="ribbon-steps">
    <ribbon-step-button v-for="(step, index) in steps" :key="step + index"
      class="ribbon-step-button" :position="positions[index]" :title="step"/>
  </div>

</template>

<script lang="ts">
import { defineComponent, ref, watch, provide, PropType } from 'vue'
import RibbonStepButton from './RibbonStepButton.vue'

export default defineComponent({
  emits: ['update:active'],
  components: { RibbonStepButton },
  props: {
    steps: {
      type: Object as PropType<string[]>,
      required: true
    },
    active: {
      type: Number,
      required: true
    }
  },
  setup(props, { emit }) {
    const stepButtons = ref([])

    watch(stepButtons, () => {
      stepButtons.value.forEach((button, index) => {
        button.setIndex(index)
      })
    })

    const currentIndex = ref(props.active)
    watch(() => props.active, (newValue) => {
      currentIndex.value = newValue
    })
    watch(currentIndex, () => {
      stepButtons.value.forEach((button, index) => {
        if (index < currentIndex.value) {
          button.setCurrent(false)
          button.setCompleted(true)
        } else if (index === currentIndex.value) {
          button.setCurrent(true)
          button.setCompleted(false)
        } else {
          button.setCurrent(false)
          button.setCompleted(false)
        }
      })
      emit('update:active', currentIndex.value)
    })

    provide('RibbonSteps', { stepButtons, currentIndex })

    const positions = props.steps.map((_, index) => {
      if (index === 0) {
        return 'start'
      } else if (index === props.steps.length - 1) {
        return 'end'
      } else {
        return 'middle'
      }
    })

    return { positions }
  }
})
</script>

<style lang="scss" scoped>
#ribbon-steps {
  display: flex;
  flex-flow: row nowrap;

  .ribbon-step-button {
    flex: 1;
    margin-left: 44px;
    &:first-of-type {
      margin-left: 0;
    }
  }
}
</style>
