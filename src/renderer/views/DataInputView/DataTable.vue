<template>
  <el-table border class="data-table" :data="rows" :show-header="false" @cell-click="onCellClick" @cell-dblclick="onCellDblClick" @row-click="getHeaderList">
    <el-table-column prop="name" label="名称"></el-table-column>
    <el-table-column :label="column.label" v-for="(column, index) in columns" :key="index">
      <template #default="scope">
        <el-select v-focus clearable v-if="editIndex[0] == scope.row.index && editIndex[1] == index" v-model="scope.row.values[index]">
          <el-option
            v-for="(field) in fields"
            :key="field"
            :label="field"
            :value="field">
          </el-option>
        </el-select>
        <div v-else>
          {{scope.row.values[index]}}
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { range } from '@shared/functional'
import type { DataInputMetaItem } from '@shared/dataModelTypes'
import { createNamespacedHelpers } from 'vuex'
import { useDataInputsAPIs } from '../../hooks/apis'
const { mapGetters, mapState } = createNamespacedHelpers('dataInputs/')

export default defineComponent({

  emits: ['change', 'preview'],

  data() {
    return { editIndex: [-1, -1], dataItems: [], fileds: [] }
  },
  computed: {
    ...mapGetters(['dataMappingItems', 'getFiles', 'csvDataMetas']),
    ...mapState(['metaFiles', 'files']),
    // dataItems() {
    //  const res = this.files ? buildDataItems(this.files, this.columnCount) : null
    //  return res
    // },
    columnCount() {
      if (this.dataMappingItems) return this.dataMappingItems.length
      return 0
    },
    columns() {
      return buildColumnData(this.columnCount)
    },
    rows() {
      return buildTableData(this.dataItems, this.columnCount)
    }
  },
  watch: {
    getFiles(newValue) {
      console.log('newValuenewValue', newValue)
      this.dataItems = this.files ? buildDataItems(this.files, this.columnCount) : null
    }
  },

  methods: {
    onCellClick(row, column) {
      this.editIndex = [row.index, column.rawColumnKey]
    },
    onCellDblClick(row, column) {
      if (column.property === 'name') {
        this.$emit('preview', row.index)
      }
    },

    onSelectChange(value) {
      const [row, column] = this.editIndex
      this.rows[row].values[column] = value

      // const next = this.modelValue.slice()
      // next[row].values[column] = value
      this.editIndex = [-1, -1]

      this.$emit('change', value)
    },

    onSelectBlur() {
      setTimeout(() => {
        this.editIndex = [-1, -1]
      }, 100)
    },

    async getHeaderList(scope) {
      if (this.files) {
        const Item = this.files[scope.index]
        try {
          this.fields = await useDataInputsAPIs().readCsvFileMeta(Item.absolutePath)
        } catch (err) {
          return false
        }
        return false
      }
    }
  }
})

function buildColumnData(count) {
  return range(0, count).map(index => {
    return { label: `c-${index}`, index }
  })
}
// function getCsvDataMetas(count): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const res = buildDataItems(this.csvDataMetas, this.columnCount)
//     resolve(res)
//   })
// }
function buildTableData(items, count) {
  if (items) {
    return items.map((item, index) => {
      return {
        index,
        name: item.name,
        fields: item.fields,
        values: item.values,
        path: item.path
      }
    })
  }
}

function buildDataItems(csvMetas: DataInputMetaItem[], columnCount): DataInputMetaItem[] {
  if (csvMetas) {
    const result = []
    csvMetas.forEach(meta => {
      const values = range(0, columnCount).map(() => null)
      result.push({
        name: meta.name,
        fields: '',
        values
      })
    })
    return result
  }
}
</script>
