<template>
  <el-empty v-show="isEmpty" style="height: 100%" />
  <div class="class-box">
    <vxe-table
      :data="tableData.data"
      style="font-size: 12px"
      ref="xGrid"
      size="small"
      show-overflow="tooltip"
      show-header-overflow="tooltip"
      round
      :height="H"
      border
      :auto-resize="true"
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
        v-for="(col, index) in tableHeaderData.data"
        :key="col.field + index"
        :field="col.field"
        :title="col.title"
        align="center"
        min-width="80"
      >
      </vxe-column>
    </vxe-table>
  </div>
</template>

<script lang="ts" >
import { watch, defineComponent, reactive, onMounted, ref, nextTick, computed } from 'vue'
import { useTasksAPIs, useDataInputsAPIs, useModelsAPIs } from '../../../hooks/apis'
import { VxeTablePropTypes, VxeTableInstance, VxeButtonEvents } from 'vxe-table'
import elementResizeDetectorMaker from 'element-resize-detector'
import { asyncForEach } from '@shared/commonUtils'
export default defineComponent({
  props: {
    childrenData: {
      type: Object
    },
    type: {
      type: String
    }
  },
  setup(props) {
    const tableHeaderData = reactive({ data: [] })
    const tableData = reactive({ data: [] })
    const xGrid = ref({} as VxeTableInstance)
    let indexArr = []
    const H = computed(() => `${props?.childrenData?.resultBoxH}px` || '100%')
    const isEmpty = ref(true)
    watch(props, (newVal, oldVal) => {
      isEmpty.value = true
      loadDatad()
    })
    onMounted(() => {
      // loadDatad()
    })

    const loadDatad = () => {
      const indexNameArr = []
      indexArr = []
      loadTableHeaderData(props.childrenData.csvFileData)
    }

    const loadTableHeaderData = async (csvFileData) => {
      console.log(1)
      let curtableBlockId = props.childrenData.tableBlockId
      tableHeaderData.data = []
      tableHeaderData.data.length = 0
      tableData.data = []
      let tableHeader = []
      tableHeader.push({
        blockId: curtableBlockId,
        colsArr: [{
          field: 'time', title: 'time', index: 1, blockId: curtableBlockId, fixed: ''
        }]
      })
      props.childrenData.csvFileData.forEach((scvData, scvInd) => {
        if (scvData.blockId === curtableBlockId) {
          // tableHeader.push({
          //   blockId: scvData.blockId,
          //   colsArr: [{
          //     field: 'time', title: 'time', index: 1, blockId: curtableBlockId
          //   }]
          // })
        } else {
          tableHeader.push({
            blockId: scvData.blockId,
            colsArr: []
          })
        }
        let ReferencePreviewData = []
        if (props.type === 'prve') {
          ReferencePreviewData = props.childrenData.data.referringPropertiesList
        } else if (props.type === 'cur') {
          ReferencePreviewData = props.childrenData.data.currentPropertiesList
        } else if (props.type === 'next') {
          ReferencePreviewData = props.childrenData.data.referredPropertiesList
        }
        console.log(2)
        ReferencePreviewData.forEach(item => {
          if (scvData.blockId === curtableBlockId && item.blockId === curtableBlockId) {
            const ind = selectCurIndex(scvData.cols, item.name)
            tableHeader[0].colsArr.push({
              field: item.name, title: item.name, index: ind, blockId: item.blockId, fixed: ''
            })
          } else if (scvData.blockId === item.blockId && scvData.blockId !== curtableBlockId) {
            const ind = selectCurIndex(scvData.cols, item.name)
            let name = item.name + '(' + item.blockName + ')'
            tableHeader.map((tItem, tIndex) => {
              if (tItem.blockId === scvData.blockId) {
                tableHeader[tIndex].colsArr.push({
                  field: name, title: name, index: ind, blockId: item.blockId, fixed: ''
                })
              }
            })
            // tableHeader[scvInd].colsArr.push({
            //   field: name, title: name, index: ind, blockId: item.blockId, fixed: ''
            // })
          }
          console.log(3)
        })
      })
      console.log(4)
      // nextTick(() => {
      let tableheadArr = []
      for (let i = 0; i < tableHeader.length; i++) {
        tableheadArr.push(...tableHeader[i].colsArr)
      }
      tableHeaderData.data.push(...tableheadArr)
      if (tableHeader.length > 0) {
        isEmpty.value = false
        loadCurTableData(tableHeader)
        console.log(9)
      } else {
        isEmpty.value = true
      }
      // })
    }
    watch(() => tableHeaderData.data, (val) => {
      console.log(val, 9998881)
    }, { deep: true })
    const loadCurTableData = async (tableHeader) => {
      const rowsArr = []
      let curtableBlockId = props.childrenData.tableBlockId
      props.childrenData.csvFileData.forEach((scvData, scvInd) => {
        if (scvData.blockId === curtableBlockId) {
          const curHeaderArr = tableHeader.filter(item => { return item.blockId === curtableBlockId })
          scvData.rows.forEach(row => {
            let obj = {}
            curHeaderArr[0].colsArr.forEach(col => {
              if (col.index >= 0) {
                Object.defineProperty(obj, col.field, {
                  value: row.split(',')[col.index],
                  enumerable: true,
                  configurable: true
                })
              } else {
                Object.defineProperty(obj, col.field, {
                  value: '',
                  enumerable: true,
                  configurable: true
                })
              }
            })
            rowsArr.push(obj)
          })
        }
      })
      const dd = props.childrenData.csvFileData.filter(fit => fit.blockId !== curtableBlockId)
      console.log(5)
      dd.forEach((scvData, scvInd) => {
        let isCurRowsEmpty = false
        if (rowsArr.length) {
          isCurRowsEmpty = true
        } else if (scvInd === 0) {
          // tableHeader[0].colsArr.unshift({
          //   field: 'time', title: 'time', index: 1, blockId: scvData.blockId
          // })
          // tableHeaderData.data.unshift({
          //   field: 'time', title: 'time', index: 1, blockId: scvData.blockId
          // })
        } else {
          // tableHeaderData.data.unshift({
          //   field: 'time', title: 'time', index: 1, blockId: scvData.blockId
          // })
          isCurRowsEmpty = false
        }
        if (scvData.blockId !== curtableBlockId) {
          const curHeaderArr = tableHeader.filter(item => { return item.blockId === scvData.blockId })
          const curHeaderArr1 = tableHeader.filter(item => { return item.blockId === curtableBlockId })
          scvData.rows.forEach((row, rowInd) => {
            let obj = {}
            curHeaderArr[0].colsArr.forEach(col => {
              if (col.index >= 0) {
                Object.defineProperty(obj, col.field, {
                  value: row.split(',')[col.index],
                  enumerable: true,
                  configurable: true
                })
              } else {
                Object.defineProperty(obj, col.field, {
                  value: '',
                  enumerable: true,
                  configurable: true
                })
              }
            })

            if (isCurRowsEmpty) {
              if (curHeaderArr[0].colsArr.length && curHeaderArr1[0].colsArr.length === 1) {
                Object.defineProperty(obj, 'time', {
                  value: row.split(',')[1],
                  enumerable: true,
                  configurable: true
                })
                rowsArr[rowInd] = obj
                // rowsArr.push(obj)
              } else if (curHeaderArr[0].colsArr.length && curHeaderArr1[0].colsArr.length > 1) {
                //  rowsArr[rowInd] = Object.assign(rowsArr[rowInd], obj)

                Object.defineProperty(obj, 'time', {
                  value: row.split(',')[1],
                  enumerable: true,
                  configurable: true
                })
                rowsArr.push(obj)
              }
            } else {
              rowsArr.push(obj)
            }
            // if (isCurRowsEmpty) {
            //   rowsArr[rowInd] = Object.assign(rowsArr[rowInd], obj)
            // } else {
            //   rowsArr.push(obj)
            // }
            // rowsArr.push(obj)
          })
        }
      })
      console.log(6)
      // console.log(tableHeaderData.data)
      tableData.data = []// rowsArr
      tableData.data.push(...rowsArr)
      console.log(tableData.data, 44499999999)
      await xGrid?.value?.loadData(tableData.data.slice(0, 50))
      console.log(7)
      await xGrid?.value?.loadData(tableData.data)
    }

    const selectCurIndex = (columns, name) => {
      let ind = -1
      const reg = new RegExp('^(' + name + ')' + '(\\(\\d+\\))*$', 'gim')
      columns.map((col, index) => {
        if (col === name || reg.test(col)) {
          ind = index
        }
      })
      return ind
    }
    return {
      tableData,
      indexArr,
      tableHeaderData,
      xGrid,
      isEmpty,
      H,
      loadCurTableData,
      loadDatad,
      // initCsvData,
      selectCurIndex
    }
  }
})
</script>
<style lang="scss" scoped>
.class-box {
  height: 100%;
  // overflow-y: auto;
}
</style>
