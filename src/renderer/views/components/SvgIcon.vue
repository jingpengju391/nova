<template>
  <svg :style="{ width: size, height: size }" aria-hidden="true">
    <use :href="symbolId" :fill="color" :width="size" :height="size" />
  </svg>
</template>

<script>
import { defineComponent, computed } from 'vue'
export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#333'
    },
    size: {
      type: String,
      default: '24px'
    }
  },
  setup(props) {
    const symbolId = computed(() => `#${props.prefix}-${props.name}`)
    return { symbolId }
  }
})
</script>
