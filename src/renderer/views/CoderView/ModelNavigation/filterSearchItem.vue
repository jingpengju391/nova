<template>
  <li class="filter-menu-item" :data-title ="menuItem.title">
    <span :class="{ 'checked': menuItem.checked || menuItem.isDefault }"><el-icon><check /></el-icon></span>
    <span :class="['title', { 'checked': menuItem.checked || menuItem.isDefault }]">
      {{menuItem.title}}
    </span>
  </li>
</template>

<script>
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    menuItem: {
      // eslint-disable-next-line no-undef
      type: Object
      // required: true
    }
  }
})
</script>

<style lang="scss" scoped>
.filter-menu-item {
  display: flex;
  flex-flow: row nowrap;
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
    margin-left :24px;
  }
  .checked {
    color: #1D8BFA;
  }
  .icon {
    font-weight: 800;
  }
}
</style>
