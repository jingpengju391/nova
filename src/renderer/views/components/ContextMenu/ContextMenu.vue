<template>
  <ul :style="{ top: actualY + 'px', left: actualX + 'px' }" class='nova-context-menu'>
    <li class="nova-context-menu-item-container" v-for='(item, index) in menuItems' :key='index'>
      <context-menu-item :menuItem='item'></context-menu-item>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import ContextMenuItem from './ContextMenuItem.vue'
import type { ContextMenuItemProps, ScreenPosition } from './types'
import useWindowWidthAndHeight from '../../composables/useWindowWidthAndHeight'

export default defineComponent({
  components: { ContextMenuItem },
  props: {
    screenPosition: {
      type: Object as PropType<ScreenPosition>,
      required: true
    },
    menuItems: {
      type: Array as PropType<Array<ContextMenuItemProps>>,
      required: true
    }
  },
  setup(props) {
    const { windowHeight, windowWidth } = useWindowWidthAndHeight()
    const threshold = 20
    // top and bottom padding is 10px
    // menuItem height is 32px
    const menuHeight = 32 * props.menuItems.length + 10 + 10
    const menuWidth = 160
    const actualY = ref(props.screenPosition.y + menuHeight > windowHeight.value - threshold
      ? windowHeight.value - threshold - menuHeight : props.screenPosition.y)
    const actualX = ref(props.screenPosition.x + menuWidth > windowWidth.value - threshold
      ? windowWidth.value - threshold - menuWidth : props.screenPosition.x)

    return { actualX, actualY }
  }
})
</script>
<style lang="scss" scoped>
.nova-context-menu {
  position: absolute;
  width: 160px;
  background: #FAFAFA;
  padding: 10px 0;
  margin: 0;
  border: 1px solid #E8E8E8;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.15);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}
.nova-context-menu-item-container {
  list-style-type: none;
  padding: 0;
}
</style>
