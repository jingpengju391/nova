<template>
  <div class="result-details">
    <el-empty v-show="filename === ''" style="height: 100%" />
    <div class="task-console-box" v-show="contentIsTXT">
        <p v-for="(item, index) in consoleInfo" :key="index">
          {{ item }}
        </p>
    </div>
    <vxe-table
      v-if="!contentIsTXT"
      :data="previewTableData"
      :loading="loading"
      style="font-size: 12px; height: 100%"
      ref="xGrid"
      size="small"
      @scroll="orderScroll"
      show-overflow
      keep-source
      :columns="previewTableHeaders"
      round
      :height="tableHeight + 'px'"
      border
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
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useDataInputsAPIs, useTasksAPIs } from '../../../hooks/apis'
import { createNamespacedHelpers } from 'vuex'
import {
  VxeTablePropTypes,
  VxeTableInstance,
  VxeButtonEvents
} from 'vxe-table'
import ElementResizeDetectorMaker from 'element-resize-detector'
const { mapState, mapMutations } = createNamespacedHelpers('outputs/')
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
    const that = this
    this.$nextTick(() => {
      that.tableHeight = that.$parent?.$el.offsetHeight - 1
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
      limit: 120,
      contentIsTXT: false,
      consoleInfo: ''
    }
  },
  watch: {
    filename() {
      this.tableHeight = this.$parent?.$el.offsetHeight - 1
      if (this.filename) {
        if (this.filename.indexOf('.txt') > 1) {
          this.contentIsTXT = true
          this.loadTxtData(this.filename)
        } else {
          this.contentIsTXT = false
          this.limit = 120
          this.loadData(this.filename, this.limit)
        }
      }
    }
  },
  methods: {
    orderScroll() {
      if (
        this.$refs.xGrid.getScroll().scrollTop >=
        this.limit * 36 - this.tableHeight
      ) {
        this.limit += 120
        this.loadData(this.filename, this.limit)
        this.$refs.xGrid.scrollTo(
          0,
          (this.limit - 120) * 36 - this.tableHeight
        )
      }
    },
    async loadTxtData(filename) {
      this.consoleInfo = ''
      const readResult = await useTasksAPIs().readConsoleFile(filename)

      const startReg = /starts\.$/gm
      const str = readResult.match(startReg)

      this.consoleInfo = readResult.split('\r\n')
    },
    cellClick(row, column, cell, event) {},
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
              field: item,
              title: item,
              fixed: 'left'
            })
          } else {
            this.tableHeader.push({
              field: item,
              title: item
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
        const dataPointsArray = this.previewData
          .slice(1)
          .map((line) => line.split(','))
        const tableData = dataPointsArray.map((data) => {
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
      const d = await useDataInputsAPIs().getDataInputMorePreview(fname, limit)
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
  height: 100%;
  padding: 0px 10px;
  overflow-y: scroll;
  &:deep(.rd-col-0) {
    background-color: #eef1f6;
    color: #606266;
    text-align: right;
  }
  &:deep(.rd-table-cell .cell) {
    max-width: 100%;
  }
  .task-console-box {
    padding: 10px;
    width: 100%;
    // overflow-y: scroll;
    // height: 100%;
    // overflow-y: scroll;
    p {
      margin: 0;
      font-size: 12px;
    }
  }
}
</style>
