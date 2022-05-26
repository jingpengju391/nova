<template>
  <li class="filter-menu-item" :data-title="menuItem.title">
    <span :class="['title', { 'checked': menuItem.checked || menuItem.isDefault }]">
      {{menuItem.title}}
    </span>
    <span v-if="menuItem.isDefault" class="checked">(默认)</span>
    <span v-else><el-icon  v-show="menuItem.checked"><check /></el-icon></span>
  </li>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
  props: {
    menuItem: {
      // eslint-disable-next-line no-undef
      type: Object as PropType<FilterMenuItemType>,
      required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.filter-menu-item {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  padding: 0 10px;
  height: 34px;
  line-height: 34px;
  user-select: none;
  cursor: pointer;

  &:hover {
    background: #F5F7FA;
  }

  .title {
    color: #606266;
  }
  .checked {
    color: #1D8BFA;
  }
  .icon {
    font-weight: 800;
  }
}
</style>
