<template>
  <!-- <el-table
    class="result-details"
    :data="extendedData"
    :row-class-name="setRowClass"
    @cell-click="cellClick"
    border
    v-loading="loading"
    element-loading-text="拼命加载中"
    element-loading-spinner="loading"
    height="tableHeight"
    :cell-style="cellStyle"
    :cell-class-name="setCellClass"
    :header-cell-style="headerStyle"
  >
    <el-table-column
      v-for="{ field, label, index } in extendedHeader"
      :ref="`rd_col_${index}`"
      :fixed="index == 0 ? 'left' : false"
      :resizable="true"
      :min-width="colWidth"
      :class-name="`rd-col-${index}`"
      :key="index"
      :label="label"
      :prop="field"
    />
  </el-table> -->
  <vxe-table
    :data="previewTableData"
    :loading="loading"
    style="font-size: 12px"
    ref="xGrid"
    size="small"
    @scroll="orderScroll"
    show-overflow
    keep-source
    :columns="previewTableHeaders"
    round
    border
    :height="tableHeight"
    class="mytable-scrollbar"
    :edit-config="{
      trigger: 'click',
      icon: 'fa fa-pencil',
      showStatus: true,
      mode: 'cell',
    }"
  >
    >
    <vxe-column
      v-for="(col, index) in previewTableHeaders"
      :key="index"
      :field="col.field"
      :title="col.title"
      :fixed="col.fixed"
      width="200"
      align="center"
      header-class-name="header_name"
    >
    </vxe-column>
  </vxe-table>
</template>
<script lang=ts>
import { defineComponent } from 'vue'
import { useDataInputsAPIs } from '../../../hooks/apis'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('outputs/')
export default defineComponent({
  props: {
    filename: String,
    minColumns: {
      type: Number,
      default: 15
    },
    minRows: {
      type: Number,
      default: 30
    }
  },
  mounted() {
    this.tableHeight = this.$parent?.$el.offsetHeight - 1
    window.addEventListener('resize', () => {
      this.tableHeight = this.$parent?.$el.offsetHeight - 1
    })
    if (this.filename) {
      this.loadData(this.filename, this.limit)
    }
    window.addEventListener('scroll', this.scrollBottom)
  },
  data() {
    return {
      tableHeight: 0,
      loading: false,
      headerStyle: {
        background: '#eef1f6',
        color: '#606266',
        border: '0.1px solid #b0b2b6',
        textAlign: 'center'
      },
      cellStyle: {
        height: '30px',
        border: '0.1px solid #d0d2d6'
      },
      colWidth: '100px',
      previewTableHeaders: [] as string[],
      previewTableData: [] as string[],
      previewData: [] as string[], // contains both the table header and the table cell data
      tableHeader: [] as string[],
      limit: 120
    }
  },
  watch: {
    filename() {
      if (this.filename) {
        this.loadData(this.filename, this.limit)
      }
    }
  },
  methods: {
    orderScroll() {
      if (this.$refs.xGrid.getScroll().scrollTop > (this.limit * 48) - this.tableHeight) {
        this.limit += 120
        this.loadData(this.filename, this.limit)
        this.$refs.xGrid.scrollTo(0, ((this.limit - 120) * 48) - this.tableHeight)
      }
    },
    cellClick(row, column, cell, event) {
      // console.log('tablesize:', this.nRows, this.nColumns)
      // console.log(row, column)
      // const refname = `rd_col_${column.no}`
      // console.log(refname, this.$refs, this.$refs[refname])
    },
    setCellClass({ row, column, rowIndex }) {
      return 'rd-table-cell'
    },
    setRowClass({ row, rowIndex }) {
      return 'rd-table-row'
    },
    parseData() {
      // const start = Date.now()
      if (this.previewData.length > 0) {
        const tableHeaders = this.previewData[0].split(',')
        this.tableHeader = []
        tableHeaders.map((item, index) => {
          if (index < 2) {
            this.tableHeader.push({
              field: item, title: item, fixed: 'left'
            })
          } else {
            this.tableHeader.push({
              field: item, title: item
            })
          }
          // if (index === tableHeaders.length - 1) {
          //   this.tableHeader.push({
          //     field: item, title: item
          //   })
          // } else {
          //   this.tableHeader.push({ field: item, title: item })
          // }
        })
        this.previewTableHeaders = this.tableHeader
        const dataPointsArray = this.previewData.slice(1).map(
          line => line.split(',')
        )
        const tableData = dataPointsArray.map(data => {
          const dataSourcePoint = {} as any
          data.forEach((item, itemIndex) => {
            dataSourcePoint[tableHeaders[itemIndex]] = item
          })
          return dataSourcePoint
        })
        this.previewTableData = tableData

        this.$refs.xGrid.loadData(this.previewTableData)
      }
      // console.log('parsing passed:', Date.now() - start)
    },
    async loadData(fname: string, limit: number) {
      this.loading = true
      // const start = Date.now()
      const d = await useDataInputsAPIs().getDataInputMorePreview(
        fname, limit
      )
      // console.log('loading ts:', Date.now() - start)
      this.previewData = d
      // console.log('assign ts:', Date.now() - start)
      this.parseData()
      // console.log('parsing ts:', Date.now() - start)
      this.loading = false
      // console.log('loading finish:', Date.now() - start)
    }
  },
  computed: {
    ...mapState(['currentFileName']),
    extendedHeader() {
      const eh = this.previewTableHeaders.map((v, i) => {
        return {
          field: v,
          label: v,
          index: i
        }
      })
      const N = this.nColumns
      for (let i = eh.length; i < N; ++i) {
        eh.push({
          field: '',
          label: '',
          index: i
        })
      }
      return eh
    },
    extendedData() {
      const dt = [...this.previewTableData]
      const N = this.nRows
      for (let i = dt.length; i < N; ++i) {
        dt.push({})
      }
      return dt
    },
    nColumns() {
      return Math.max(this.previewTableHeaders.length, this.minColumns)
    },
    nRows() {
      return Math.max(this.previewTableData.length, this.minRows)
    }
  }
})
</script>
<style lang="scss" scoped>
.result-details {
  border: none;
  width: 100%;
  &:deep(.rd-col-0) {
    background-color: #eef1f6;
    color: #606266;
    text-align: right;
  }
  &:deep(.rd-table-cell .cell) {
    max-width: 100%;
  }
}
</style>
