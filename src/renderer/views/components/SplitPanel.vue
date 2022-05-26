<template>
  <div
    ref="container"
    class="container"
    v-bind:style="{ flexDirection: containerFlexDirection }"
  >
    <div
      v-if="!hideMainPane"
      class="mainPane"
      ref="mainPane"
      v-bind:style="mainPaneStyle"
    >
      <slot name="main" ref="tt"></slot>
    </div>
    <div
      v-if="!(hideSidePane || hideMainPane)"
      v-bind:class="{
        horizontalSplitHandle: isHorizontal,
        verticalSplitHandle: !isHorizontal,
      }"
      ref="splitHandle"
      @mousedown="onMouseDown"
      @mouseup="mainPaneContinue = false"
      v-bind:style="splitHandleStyle"
    >
      <div class="activeHandle"></div>
    </div>
    <div
      v-if="!hideSidePane"
      ref="sidePane"
      class="sidePane"
      v-bind:style="sidePaneStyle"
    >
      <slot name="side"></slot>
    </div>
  </div>
</template>
<script lang=ts>
import { defineComponent, ref, computed } from 'vue'

// Make this value larger will make the mouse easier to find the handle
const SplitHandleEffectiveSize = 16
export default defineComponent({
  props: {
    hideMainPane: {
      type: Boolean,
      default: false,
      required: false
    },
    hideSidePane: {
      type: Boolean,
      default: false,
      required: false
    },
    splitDirection: {
      type: String,
      default: 'horizontal',
      required: false
    },
    mainPaneDefaultRatio: {
      type: Number,
      default: 0.2,
      required: false
    },
    mainPaneMinimumRatio: {
      type: Number,
      default: 0.2,
      required: false
    },
    sidePaneMinimumRatio: {
      type: Number,
      default: 0.2,
      required: false
    },
    adsorbent: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  setup(props) {
    // make sure mainPaneWeight is between [0, 1]
    const mainPaneContinue = ref(false)
    const mainPaneRatio = ref(Math.max(0, Math.min(props.mainPaneDefaultRatio, 1)))
    const mainPaneRatioCSSValue = computed(() => mainPaneRatio.value * 100 + '%')
    const sidePaneRatioCSSValue = computed(() => 100 - mainPaneRatio.value * 100 + '%')
    const mainPaneStyle = computed(() => {
      if (props.splitDirection === 'horizontal') {
        return { width: mainPaneRatioCSSValue.value, height: '100%' }
      } else {
        return { height: mainPaneRatioCSSValue.value, width: '100%' }
      }
    })
    const sidePaneStyle = computed(() => {
      if (props.splitDirection === 'horizontal') {
        return { width: sidePaneRatioCSSValue.value, height: '100%' }
      } else {
        return { height: sidePaneRatioCSSValue.value, width: '100%' }
      }
    })
    const splitHandleStyle = computed(() => {
      if (props.splitDirection === 'horizontal') {
        return { left: 'calc(' + mainPaneRatioCSSValue.value + ' - 8px)', top: '0', width: SplitHandleEffectiveSize + 'px' }
      } else {
        return { top: 'calc(' + mainPaneRatioCSSValue.value + ' - 8px)', left: '0', height: SplitHandleEffectiveSize + 'px' }
      }
    })

    return {
      isHorizontal: props.splitDirection === 'horizontal',
      containerFlexDirection: props.splitDirection === 'horizontal' ? 'row' : 'column',
      mainPaneRatio,
      mainPaneStyle,
      sidePaneStyle,
      splitHandleStyle,
      mainPaneContinue
    }
  },
  methods: {
    onMouseDown(event: MouseEvent) {
      event.preventDefault()

      const startClientX = event.clientX
      const startClientY = event.clientY

      const mainPane = this.$refs.mainPane as HTMLElement
      const mainPaneStartWidth = mainPane.getBoundingClientRect().width
      const mainPaneStartHeight = mainPane.getBoundingClientRect().height

      const container = this.$refs.container as HTMLElement
      const containerWidth = container.getBoundingClientRect().width
      const containerHeight = container.getBoundingClientRect().height

      const { adsorbent, handlAdsorbent } = this
      adsorbent && handlAdsorbent()

      let onMouseMove: (event: MouseEvent) => void
      if (this.isHorizontal) {
        onMouseMove = (event: MouseEvent) => {
          const deltaX = event.clientX - startClientX
          let newMainPaneWidth = mainPaneStartWidth + deltaX
          const sidePaneMinimumWidth = Math.round(this.sidePaneMinimumRatio * containerWidth)
          if (newMainPaneWidth <= this.mainPaneMinimumRatio * containerWidth) {
            newMainPaneWidth = this.mainPaneMinimumRatio * containerWidth
          } else if (newMainPaneWidth >= containerWidth - sidePaneMinimumWidth) {
            newMainPaneWidth = containerWidth - sidePaneMinimumWidth
          }
          this.mainPaneRatio = Math.round(newMainPaneWidth / containerWidth * 100) / 100
        }
      } else {
        onMouseMove = (event: MouseEvent) => {
          const deltaY = event.clientY - startClientY
          let newMainPaneHeight = mainPaneStartHeight + deltaY
          const sidePaneMinimumHeight = Math.round(this.sidePaneMinimumRatio * containerHeight)
          if (newMainPaneHeight <= this.mainPaneMinimumRatio * containerHeight) {
            newMainPaneHeight = this.mainPaneMinimumRatio * containerHeight
          } else if (newMainPaneHeight >= containerHeight - sidePaneMinimumHeight) {
            newMainPaneHeight = containerHeight - sidePaneMinimumHeight
          }
          this.mainPaneRatio = Math.round(newMainPaneHeight / containerHeight * 100) / 100
        }
      }
      document.addEventListener('mousemove', onMouseMove)

      const onMouseUp = (event: MouseEvent) => {
        document.removeEventListener('mouseup', onMouseUp)
        document.removeEventListener('mousemove', onMouseMove)
        this.mainPaneContinue = false
      }
      document.addEventListener('mouseup', onMouseUp)
    },
    handlAdsorbent() {
      const { $emit } = this
      this.mainPaneContinue = true
      this.mainPaneRatio === this.mainPaneMinimumRatio &&
        setTimeout(() => this.mainPaneContinue &&
          this.mainPaneRatio === this.mainPaneMinimumRatio &&
          $emit('toggleViewDisplay'), 500)
    }
  },
  watch: {
    mainPaneStyle() {
      const { adsorbent, handlAdsorbent } = this
      adsorbent && handlAdsorbent()
    }
  }
})
</script>

<style lang='scss' scoped>
$activeHandleWidthOrHeight: 4px;
.container {
  position: relative;
  display: flex;
  padding: 0;
}
.mainPane {
  flex-grow: 1;
  overflow: hidden;
}
.sidePane {
  flex-grow: 1;
  // z-index: 1;
}
.activeHandle {
  position: absolute;
  opacity: 0;
  background: lightgray;
  transition-delay: 0s;
}

.horizontalSplitHandle {
  position: absolute;
  z-index: 10;
  height: 100%;
  cursor: col-resize;

  .activeHandle {
    width: $activeHandleWidthOrHeight;
    height: 100%;
    left: 5px;
  }

  &:hover {
    .activeHandle {
      opacity: 1;
      transition-delay: 0.3s;
    }
  }
  &:active {
    .activeHandle {
      opacity: 1;
      transition-delay: 0.3s;
    }
  }
}

.verticalSplitHandle {
  position: absolute;
  z-index: 2;
  width: 100%;
  cursor: row-resize;

  .activeHandle {
    width: 100%;
    height: $activeHandleWidthOrHeight;
    top: 5px;
  }

  &:hover {
    .activeHandle {
      opacity: 1;
      transition-delay: 0.3s;
    }
  }
  &:active {
    .activeHandle {
      opacity: 1;
      transition-delay: 0.3s;
    }
  }
}
</style>
