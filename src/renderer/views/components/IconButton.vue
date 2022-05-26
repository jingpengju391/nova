<template>
  <el-tooltip
    :offset="0"
    placement="bottom-start"
    :show-arrow="false"
    :disabled="!hasTooltip"
    :content="tooltip"
    :show-after="800"
  >
    <span class="button-container">
      <el-button
        :class="['button-item', { checkable, checked }]"
        :disabled="disabled"
        type="text"
        :icon="iconClass"
        @click="onClick"
      />
    </span>
  </el-tooltip>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch, computed } from 'vue'

export default defineComponent({
  emits: ['click', 'update:modelValue'],
  props: {
    tooltip: {
      type: String,
      required: false,
      default: ''
    },
    iconClass: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    // this prop will make the button to behave like a check box
    checkable: {
      type: Boolean,
      required: false,
      default: false
    },
    modelValue: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup(props) {
    const checked = ref(props.modelValue)
    const { modelValue } = toRefs(props)
    watch(modelValue, (newValue) => {
      checked.value = newValue
    })
    const toggleChecked = () => {
      checked.value = !checked.value
    }

    const hasTooltip = computed(() => props.tooltip !== '')

    return {
      checked,
      toggleChecked,
      hasTooltip
    }
  },
  methods: {
    onClick(event: MouseEvent) {
      this.toggleChecked()
      this.$emit('click', event)
      this.$emit('update:modelValue', this.checked)
    }
  }
})
</script>

<style lang="scss" scoped>
.button-container {
  margin-right: 8px;
}

.button-item {
  font-size: 20px;
  color: #606266;
  padding: 0;
  min-height: 30px;
  &:focus {
    color: #606266;
  }
  &:hover {
    color: #66b1ff;
  }
}
.button-item.checkable {
  color: #606266;
  &:focus {
    color: #606266;
  }
  &:hover {
    color: #606266;
  }
}
.button-item.checkable.checked {
  color: #66b1ff;
  &:focus {
    color: #66b1ff;
  }
  &:hover {
    color: #66b1ff;
  }
}
</style>
