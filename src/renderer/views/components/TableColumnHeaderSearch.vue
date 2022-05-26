<template>
  <div class="column-header-search" @click.stop>
    <el-popover
      trigger="click"
      v-model="visble"
      placement="bottom-start"
      :width="160"
    >
      <div class="down-serch" v-if="column.filterType === 'txt'">
        <el-input
          v-model="conditions.value1"
          class="w-50 m-2"
          placeholder="请输入..."
          @input="handelConfirm"
          style="font-size: 12px"
          maxlength="inputNameLength"
        >
          <template #prefix>
            <el-icon class="el-input__icon"><search /></el-icon>
          </template>
        </el-input>
      </div>
      <template #reference>
        <span :style="selected ? 'color: #409eff' : ''">
          {{ column.label }}
          <el-icon style="margin-left: 5px"><arrow-down /></el-icon
        ></span>
      </template>
    </el-popover>
  </div>
</template>

<script lang="ts" >
import { defineComponent, ref, reactive } from 'vue'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
export default defineComponent({
  props: {
    column: {
      type: Object
    }
  },
  data() {
    return {
      filterName: '',
      conditions: {
        value1: '',
        value2: ''
      },
      visble: false,
      selected: false
    }
  },
  methods: {
    async handelConfirm() {
      this.$emit('handelFilter', {
        value: this.conditions,
        prop: this.column.prop,
        filterType: this.column.filterType
      })
      if (this.column.filterType === 'txt' && this.conditions.value1) {
        this.selected = true
      } else {
        this.selected = false
      }
    }
  }

})
</script>

<style lang="scss" >
.column-header-search {
  z-index: 999;
}
.down-serch {
  padding: 10px 5px;
  &:deep(.el-input--prefix .el-input__inner) {
    font-size: 12px;
  }
}
</style>
