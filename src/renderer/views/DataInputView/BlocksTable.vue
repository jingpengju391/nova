<template>
  <el-table class="blocks-table" border :data="rows">
    <el-table-column
    :prop="column.prop"
    :label="column.label"
    v-for="column in columns"
    :key="column.prop"></el-table-column>
  </el-table>
</template>
<script lang="ts">

import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('dataInputs/')

export default defineComponent({

  computed: {
    ...mapGetters(['dataMappingItems']),
    columns() {
      const dataMappingItems = this.dataMappingItems ? buildColumnData(this.dataMappingItems) : []
      const columns = [
        {
          prop: 'field',
          label: '模块名称'
        },
        ...dataMappingItems
      ]
      return columns
    },
    rows() {
      if (this.dataMappingItems) return buildTableData(this.dataMappingItems)
      return []
    }
  }
})

function buildColumnData(items) {
  if (items) {
    return items.map((item, index) => {
      return { label: item.block, prop: `c-${index}` }
    })
  }
}

function buildTableData(items) {
  if (items) {
    const mapper = fn => items.reduce((acc, item, index) => {
      acc[`c-${index}`] = fn(item)
      return acc
    }, {})

    return [
      { field: '变量名称', ...mapper(item => item.name) },
      { field: '变量类型', ...mapper(item => item.type) }// ,
      // { field: '是否必填', ...mapper(item => item.required ? '必填' : '否') }
    ]
  }
}
</script>
