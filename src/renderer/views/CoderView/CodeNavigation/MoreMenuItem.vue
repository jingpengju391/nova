<template>
  <div :class="className" :style="menuItemStyle">
    <span>{{ menuItem.name }}</span>
    <span>{{ menuItem.shortcut }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('models/')
export default defineComponent({
  props: {
    menuItem: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapState(['currentFormulaItem']),
    className() {
      const arr = ['more-menu-item']
      this.currentFormulaItem.name ===
        this.menuItem.name &&
        arr.push('active')
      this.menuItem.flex &&
        arr.push('flex-box')
      return arr.join(' ')
    },
    menuItemStyle() {
      const obj: any = {}
      const st = '1px solid #e4e7ed'
      const sk = this.menuItem.flex === 'top' ? 'borderBottom' : 'borderTop'
      obj[this.menuItem.flex] = 0
      obj[sk] = this.menuItem.flex ? st : ''
      return obj
    }
  }
})
</script>

<style lang="scss" scoped>
.more-menu-item {
  width: 100%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0 10px;
  height: 34px;
  line-height: 34px;
  user-select: none;
  cursor: pointer;
  background: #fff;
  span {
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span:last-child {
    text-align: right;
    color: #bdbdbd;
  }
  &:hover {
    background: #f5f7fa;
  }

  .title {
    color: #606266;
  }
  .checked {
    color: #1d8bfa;
  }
  .icon {
    font-weight: 800;
  }
}
.active {
  background: #f5f7fa;
}
.flex-box {
  border-top: 1px solid #e4e7ed;
  position: fixed;
}
</style>
