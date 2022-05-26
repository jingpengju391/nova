<template>
  <div
    id="target-sereis-variables-settings"
    ref="targetSereisVariablesSettings"
  >
    <div class="title">
      <h4>已选变量/序列设置</h4>
      <el-button type="primary" @click="changeTable" size="small" plain>{{
        generalButton
      }}</el-button>
    </div>
    <el-table
      id="settings-table"
      :height="tableHeight"
      v-loading="loading"
      :lazy="false"
      :data="loadData"
      :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
    >
      <el-table-column prop="name" label="名称" />
      <el-table-column
        v-for="column in targetColumnsList"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
      >
        <template #default="scopedProps">
          <el-input
            class="number-input"
            size="small"
            v-model.number="scopedProps.row[column.prop]"
            @change="onSettingsChange(scopedProps)"
            @contextmenu="onTargetVariablesRightClick(scopedProps, $event)"
            maxlength="20"
          />
        </template>
      </el-table-column>
      <!-- <el-table-column prop="shouldOutput" label="是否输出">
        <template #default="scopedProps">
          <el-select
            class="should-output-select"
            size="small"
            v-model="scopedProps.row.shouldOutput"
            @change="onSettingsChange(scopedProps)"
            @contextmenu="onTargetVariablesRightClick(scopedProps, $event)"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </template>
      </el-table-column> -->
      <el-table-column
        v-for="column in outputColumnList"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
      >
        <template #default="scopedProps">
          <el-select
            class="should-output-select"
            size="small"
            v-model="scopedProps.row[column.prop]"
            @change="onSettingsChange(scopedProps)"
            @contextmenu="onTargetVariablesRightClick(scopedProps, $event)"
          >
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import currentTargetMixin from './mixins'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { ElTable } from 'element-plus'
export default defineComponent({
  mixins: [currentTargetMixin],
  data() {
    return {
      tableHeight: 0,
      generalButton: '常规设置',
      targetColumnsList: [],
      outputColumnList: [],
      curpageSize: 30
    }
  },
  targetColumns: [
    { prop: 'periodFrom', label: '开始时点', isShow: true },
    { prop: 'periodTo', label: '结束时点', isShow: true },
    { prop: 'periodOutputFrom', label: '模型点存储开始', isShow: false },
    { prop: 'periodOutputTo', label: '模型点存储结束', isShow: false }
  ],
  outputColumn: [
    { prop: 'shouldOutput', label: '是否存储至模型点', isShow: false }
  ],

  methods: {
    tableColumnItems() {
      if (this.generalButton === '高级设置') {
        this.generalButton = '常规设置'
        this.targetColumnsList = this.$options.targetColumns
        this.outputColumnList = this.$options.outputColumn
      } else if (this.generalButton === '常规设置') {
        this.targetColumnsList = this.$options.targetColumns.filter(item => { return item.isShow })
        this.outputColumnList = this.$options.outputColumn.filter(item => { return item.isShow })
        this.generalButton = '高级设置'
      }
    },
    changeTable() {
      this.tableColumnItems()
    },
    onSettingsChange(scoped: typeof ElTable) {
      this.currentTarget.variablesAndSeries[scoped.$index][scoped.column.property] = scoped.row[scoped.column.property]
      this.onCurrentTargetChange(false)
    },
    setTableHeight() {
      const Erd = ElementResizeDetectorMaker()
      Erd.listenTo(this.$refs.targetSereisVariablesSettings as HTMLElement, (element: HTMLElement) => {
        this.tableHeight = element.offsetHeight - 60
      })
    },
    setTabaleScroll() {
      const elScroll = document.getElementsByClassName('el-table__body-wrapper')[0] as HTMLElement
      elScroll.onscroll = () => {
        const tbody = document.getElementsByTagName('tbody')[0] as HTMLElement
        const thead = document.getElementsByTagName('thead')[0] as HTMLElement
        const tbH = tbody.offsetHeight
        const thH = thead.offsetHeight
        const ssT = elScroll.scrollTop
        const elc = elScroll.clientHeight
        const elsh = elScroll.scrollHeight

        const reserveH = this.pageSize / 2 // rules for simple simulation of the size of a single page of data
        if (this.tableHeight + ssT + thH + reserveH >= tbH) {
          const dataParagraph = this.cacheData.splice(0, this.pageSize)

          dataParagraph.length > 0 && this.loadData.push(...dataParagraph)
        }
      }
    },
    setScroll() {
      const elScroll = document.getElementsByClassName('el-table__body-wrapper')[0] as HTMLElement
      const ssT = elScroll.scrollTop
      const elc = elScroll.clientHeight
      const elsh = elScroll.scrollHeight
      if (elsh - elc - ssT <= 0) {
        let curpageSizes = this.pageSize
        const dataParagraph = this.cacheData.splice(0, curpageSizes += 5)
        dataParagraph.length > 0 && this.loadData.push(...dataParagraph)
      }
    },
    onTargetVariablesRightClick(loadSeriesData, event) {
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: [
          {
            title: '设置所有',
            onClick: () => {
              this.TargetVariablesSeriesReplace(loadSeriesData)
            }
          }

        ]
      })
    },
    TargetVariablesSeriesReplace(loadSeriesData) {
      this.loadData.forEach(item => {
        if (loadSeriesData.column.property === 'periodFrom') {
          if (item.periodFrom !== loadSeriesData.row.periodFrom || item.periodFrom === loadSeriesData.row.periodFrom) {
            item.periodFrom = loadSeriesData.row.periodFrom
          }
        }
        if (loadSeriesData.column.property === 'periodOutputFrom') {
          if (item.periodOutputFrom !== loadSeriesData.row.periodOutputFrom || item.periodOutputFrom === loadSeriesData.row.periodOutputFrom) {
            item.periodOutputFrom = loadSeriesData.row.periodOutputFrom
          }
        }
        if (loadSeriesData.column.property === 'periodOutputTo') {
          if (item.periodOutputTo !== loadSeriesData.row.periodOutputTo || item.periodOutputTo === loadSeriesData.row.periodOutputTo) {
            item.periodOutputTo = loadSeriesData.row.periodOutputTo
          }
        }
        if (loadSeriesData.column.property === 'periodTo') {
          if (item.periodTo !== loadSeriesData.row.periodTo || item.periodTo === loadSeriesData.row.periodTo) {
            item.periodTo = loadSeriesData.row.periodTo
          }
        }
        if (loadSeriesData.column.property === 'shouldOutput') {
          if (item.shouldOutput !== loadSeriesData.row.shouldOutput || item.shouldOutput === loadSeriesData.row.shouldOutput) {
            item.shouldOutput = loadSeriesData.row.shouldOutput
          }
        }
      })
      this.currentTarget.variablesAndSeries = this.loadData
      this.onCurrentTargetChange(false)
    }
  },
  watch: {
    scopedRow: {
      handler(newVal) {
        console.log(newVal, 'newVal')
      },
      deep: true
    }
  },
  created() {
    this.tableColumnItems()
  },
  mounted() {
    this.setTableHeight()
    // this.curpageSize = this.pageSize
    // window.addEventListener('scroll', this.setScroll, true)
    // this.setTabaleScroll()
  }
})
</script>

<style lang="scss" scoped>
#target-sereis-variables-settings {
  padding: 20px;
  height: 100%;
}
.title {
  display: flex;
  justify-content: space-between;
}
#settings-table {
  margin-top: 9px;
  &:deep(.el-table__cell) {
    background: transparent !important;
  }
}

.number-input {
  &:deep(.el-input__inner) {
    border: none;
  }
  &:deep(.el-input__inner:hover) {
    border: 1px solid #409eff;
  }
}

.should-output-select {
  &:deep(.el-input__inner) {
    border: none;
  }
  &:deep(.el-input__suffix) {
    opacity: 0;
  }
  &:deep(.el-input__inner:hover) {
    border: 1px solid #409eff;
    & + .el-input__suffix {
      opacity: 1;
    }
  }
}
</style>
