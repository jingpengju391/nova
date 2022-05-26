<template>
  <span>
    <icon-button :iconClass="compileButtonClass" :disabled="compileDisabled"
      @click="$emit('update:isCompiling', true)" />
    <icon-button :iconClass="runButtonClass" :disabled="runDisabled"
      @click="$emit('update:isRunning', true)" />
  </span>
</template>
<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue'
import IconButton from './IconButton.vue'

export default defineComponent({
  components: { IconButton },
  emits: ['update:isCompiling', 'update:isRunning'],
  props: {
    isCompiling: {
      type: Boolean,
      required: false,
      boolean: false
    },
    isRunning: {
      type: Boolean,
      required: false,
      boolean: false
    }
  },
  setup(props) {
    const { isCompiling, isRunning } = toRefs(props)
    const compileButtonClass = computed(() => {
      return isCompiling.value ? 'video-pause' : 'help'
    })
    const compileDisabled = computed(() => {
      return isRunning.value
    })

    const runButtonClass = computed(() => {
      return isRunning.value ? 'video-pause' : 'video-play'
    })
    const runDisabled = computed(() => {
      return isCompiling.value
    })

    return {
      compileButtonClass,
      compileDisabled,
      runButtonClass,
      runDisabled
    }
  }
})
</script>
