<template>
  <div class="class-box" ref="boxRef">
    <vxe-table
      :data="tableData.data"
      style="font-size: 12px"
      ref="xGrid"
      size="small"
      show-overflow="tooltip"
      show-header-overflow="tooltip"
      round
      border
      keep-source
      :height="H"
      :max-height="H"
      auto-resize
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
        :fixed="col.fixed"
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
import { clone } from '@shared/functional'
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
    const boxRef = ref<null | HTMLElement>(null)
    // const H = computed(() => `${props?.childrenData?.resultBoxH}px` || '100%')
    const H = ref(0)

    const isEmpty = ref(true)
    let he = 0

    watch(props.childrenData, (newVal, oldVal) => {
      isEmpty.value = true
      if (he === props?.childrenData?.resultBoxH || he === 0) {
        loadDatad()
        H.value = props?.childrenData?.resultBoxH + 'px'
      } else {
        H.value = props?.childrenData?.resultBoxH + 'px'
      }
      he = clone(newVal?.resultBoxH)
    })
    watch(props.childrenData.resultBoxH, (newVal, oldVal) => {
      isEmpty.value = true
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
      let curtableBlockId = props.childrenData.tableBlockId
      tableHeaderData.data = []
      // tableHeaderData.data.length = 0
      tableData.data = []
      let tableHeader = []
      tableHeader.push({
        blockId: curtableBlockId,
        colsArr: [{
          field: 'time', title: 'time', index: 1, blockId: curtableBlockId, fixed: 'left'
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
      })

      props.childrenData.csvFileData.forEach((scvData, scvInd) => {
        // if (scvData.blockId === curtableBlockId) {
        //   // tableHeader.push({
        //   //   blockId: scvData.blockId,
        //   //   colsArr: [{
        //   //     field: 'time', title: 'time', index: 1, blockId: curtableBlockId
        //   //   }]
        //   // })
        // } else {
        //   tableHeader.push({
        //     blockId: scvData.blockId,
        //     colsArr: []
        //   })
        // }
        let ReferencePreviewData = []
        if (props.type === 'prve') {
          ReferencePreviewData = props.childrenData.data.referringPropertiesList
        } else if (props.type === 'cur') {
          ReferencePreviewData = props.childrenData.data.currentPropertiesList
        } else if (props.type === 'next') {
          ReferencePreviewData = props.childrenData.data.referredPropertiesList
        }
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
        })
      })
      // nextTick(() => {
      let tableheadArr = []
      for (let i = 0; i < tableHeader.length; i++) {
        if (tableHeader[i].colsArr.length) {
          tableheadArr.push(...tableHeader[i].colsArr)
        }
      }
      tableHeaderData.data.push(...tableheadArr)
      if (tableHeader.length > 0) {
        isEmpty.value = false
        loadCurTableData(tableHeader)
      } else {
        isEmpty.value = true
      }
      // })
    }
    watch(() => tableHeaderData.data, (val) => {
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
          if (curHeaderArr[0].colsArr.length) {
            scvData.rows.forEach((row, rowInd) => {
              let obj = {}
              curHeaderArr[0].colsArr.forEach(col => {
                if (col.index >= 0) {
                  obj[col.field] = row.split(',')[col.index]
                } else {
                  obj[col.field] = ''
                }
              })
              if (isCurRowsEmpty) {
                obj.time = row.split(',')[1]
                const findIn = rowsArr.findIndex((fimdi) => fimdi.time === obj.time)
                if (findIn !== -1) {
                  rowsArr[findIn] = Object.assign(obj, rowsArr[findIn])
                } else {
                  rowsArr.push(obj)
                }
              } else {
                rowsArr.push(obj)
              }
            })
          }
        }
      })
      tableData.data.push(...sortByKey(rowsArr, 'time'))
      await xGrid?.value?.loadData(tableData.data.slice(0, 50))
      await xGrid?.value?.loadData(tableData.data)
    }
    function sortByKey(arr, key) {
      return arr.sort(function (a, b) {
        let x = parseInt(a[key])
        let y = parseInt(b[key])
        return (x < y) ? -1 : 1
      })
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
      boxRef,
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
