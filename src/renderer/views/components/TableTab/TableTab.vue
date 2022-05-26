<template>
  <div class="table-out-box" ref="tableOutBox">
    <!-- <button @click="exportDataEvent2">导出</button> -->

    <split-panel
      class="coding-pane"
      :main-pane-default-ratio="0.6"
      split-direction="vertical"
    >
      <!-- :hide-side-pane="hideConsole" -->
      <template #main>
        <!-- <div class="table-box" ref="tableBox"> -->
        <vxe-toolbar>
          <template #buttons>
            <vxe-button @click="resultToExcel()">保存</vxe-button>
          </template>
        </vxe-toolbar>
        <div class="table-box" ref="tableBox">
          <vxe-table
            :data="tableData"
            :loading="loading"
            ref="xGrid"
            :columns="tableColumn"
            round
            @cell-click="cellClickEvent"
            size="small"
            highlight-current-row
            border
            :height="HT + 'px'"
            keep-source
            show-overflow
            show-header-overflow
            @CellMouseleave="headerCellClickEvent"
            style="font-size: 12px"
            class="mytable-scrollbar"
            :edit-rules="tableRules"
            :edit-config="{
              trigger: 'click',
              mode: 'cell',
              showIcon: false,
              icon: 'fa fa-pencil',
              showStatus: true,
            }"
          >
            >
            <vxe-column
              v-for="(col, index) in tableColumn"
              :key="index"
              :field="col.field"
              :title="col.title"
              width="230"
              align="center"
              header-class-name="header_name_select"
              :edit-render="{
                name: 'input',
                attrs: { type: 'text' },
                events: {
                  change: isTableChangeValue
                },
              }"
              style="z-index: 99; display: flex"
            >
              <template #header="{ column }">
                <div class="header_select" style="z-index: 99">
                  <i v-if="index > 0" style="color: red">*</i>
                  <el-select
                    v-if="index > 0"
                    style="text-align: center; width: 95%"
                    v-model="column.title"
                    placeholder="Select"
                    @change="changeType(column, index)"
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                      :disabled="item.disabled"
                    >
                    </el-option>
                  </el-select>
                  <span v-else>{{ column.title }}</span>
                </div>
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </template>
      <template #side>
        <div style="height: 100%" ref="lookBox">
          <!-- <LookUp
            :lookList="lookList"
            :HTL="HTL"
            @handelInsertRowName="handelInsertRowName"
            @handelDeleteColName="handelDeleteColName"
            @handelInsertCol="handelInsertCol"
            @handelDeleteRowName="handelDeleteRowName"
            @handelUpdateRowName="handelUpdateRowName"
            @handelUpdateColName="handelUpdateColName"
          /> -->
          <look-up
            :lookList="lookList"
            @handelInsertRowName="handelInsertRowName"
            @handelDeleteColName="handelDeleteColName"
            @handelInsertCol="handelInsertCol"
            @handelDeleteRowName="handelDeleteRowName"
            @handelUpdateRowName="handelUpdateRowName"
            @handelUpdateColName="handelUpdateColName"
          ></look-up>
        </div>
      </template>
    </split-panel>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, provide, getCurrentInstance, PropType, onMounted, onDeactivated } from 'vue'
import { useDataInputsAPIs, useAssumptionVarPagesAPIs } from '../../../hooks/apis'
import { VxeTablePropTypes, VxeTableInstance, VxeButtonEvents, VxeTableEvents } from 'vxe-table'
import elementResizeDetectorMaker from 'element-resize-detector'
import { useStore, createNamespacedHelpers } from 'vuex'
import { ElMessageBox, ElMessage } from 'element-plus'
import LookUp from './LookUp.vue'
import SplitPanel from './../SplitPanel.vue'
import { sss } from '@/views/AssumptionView/config/copyFileNode'
const { mapState, mapMutations, mapGetters } = createNamespacedHelpers('assumptionTable/')
export default defineComponent({
  props: {
    filename: String,
    tableInfnH: Number,
    tabSitem: String
  },
  setup(props, components) {
    const tableData: Array = reactive([])
    const tableColumn: Array = reactive([])
    const store = useStore()
    const loading: boolean = ref(false)
    const tableShow: boolean = ref(false)
    // const xGrid: any = ref(null)
    const { proxy }: any = getCurrentInstance()
    const tableRules = ref({
      // data2: [
      //   { required: true, message: '不可为空' }
      // ]
    } as VxeTablePropTypes.EditRules)

    const test = (rowIndex) => {
      console.log(111)
    }

    const xGrid = ref({} as VxeTableInstance)
    const H: number = ref(props.tableInfnH)
    const tableBox = ref<null | HTMLElement>(null)
    const tableOutBox = ref(null)
    const clientHeight = ref('')
    const lookBox = ref<null | HTMLElement>(null)
    const options = ref([
      {
        value: 's',
        label: '字符'
      },
      {
        value: 'n',
        label: '数字'
      }
    ])

    const lookList = reactive({
      row_name_list: [],
      column_name_list: [],
      rowInsertIndexArr: [],
      columnInsertIndexArr: [],
      HTL: 0
    })
    const updateData = () => {
      console.log(xGrid.value.tableFullData)
    }
    const ChangeCurrentTagsStatus = mapMutations(['ChANGE_TAGS_SAVE_STATUS']).ChANGE_TAGS_SAVE_STATUS.bind({
      $store: store
    })
    const headerCellClickEvent: VxeTableEvents.CellMouseleave = ({ row, rowIndex, $rowIndex, column, columnIndex, $columnIndex, $event }) => {

    }
    // const cellMouseenterEvent: VxeTableEvents.CellMouseenter = ({ column }) => {
    //   console.log(`单元格鼠标进入${column.title}`)
    // }
    const fname: string = ref('')
    const selectC = ref('type')
    const LengthSet = reactive({
      rLen: 0,
      cLen: 0
    })
    const changeStatus = reactive<{ id: string, type: boolean }>({
      id: props.tabSitem,
      type: false
    })
    const cellClickEvent: VxeTableEvents.CellClick = ({ column }) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
    }
    const HT: Number = ref(0)
    const HTL: Number = ref(0)
    // HT = tableBox.getBoundingClientRect().height
    const loadDataE = async (fname: string) => {
      clearTableData()

      loading.value = true
      const d = useDataInputsAPIs().readCsvFile(fname, 5000)
      d.then(res => {
        formatLookList(res)
      })
    }
    const changeType = (val: any, index) => {
      tableColumn[index].title = val.title
      const currentColumnData = tableColumn[index]
    }
    // result, excelPath
    const resultToExcel = async () => {
      if (lookList.rowInsertIndexArr.length > 0) {
        lookList.rowInsertIndexArr.map((item, index) => {
          for (const r in tableData[item]) {
            if (tableData[item][r] === '') {
              proxy.$message({
                message: '数据不能为空',
                type: 'error'
              })
              return
            } else {

            }
          }
          lookList.rowInsertIndexArr.splice(index, 1)
          resultToExcel()
        })
      } else {
        if (lookList.columnInsertIndexArr.length > 0) {
          lookList.columnInsertIndexArr.map((item, index) => {
            for (let i: number = lookList.row_name_list.length; i < tableData.length; i++) {
              if (tableData[i][tableColumn[item].field] === '') {
                proxy.$message({
                  message: '数据不能为空',
                  type: 'error'
                })
                return false
              }
            }
            lookList.columnInsertIndexArr.splice(index, 1)
            resultToExcel()
          })
        } else {
          if (changeStatus.type) {
            proxy.$alert('文件有修改是否保存', '提示', {
              confirmButtonText: '保存',
              cancelButtonText: '不保存',
              showCancelButton: true
            }).then((data) => {
              SaveFile()
            }).catch(() => {
              changeStatus.type = false
              ChangeCurrentTagsStatus(changeStatus)
              const $table = xGrid.value
              load(props.filename)
              // $table.revertData()
            })
          } else {
            proxy.$message({
              message: '文件未改动',
              type: 'success'
            })
          }
        }
      }
    }
    const SaveFile = async () => {
      var headerObj: string = ''
      const headerArr: [] = []
      const filterArr: [] = []
      tableColumn.map((item, index) => {
        headerArr.push(item.title)
        filterArr.push(item.field)
      })
      var colname: string = ''
      lookList.column_name_list.map((item: string, index) => {
        headerArr[index] = item
      })
      headerArr.push('#')
      headerObj = '#,' + headerArr.join(',') + '\n'

      //  await useAssumptionVarPagesAPIs().outputExellFile(fname.value, headerObj)
      const dataArr = []

      await tableData.map((item, index) => {
        const arr = []
        // for (const i: string in item) {
        //   arr.push(item[i])
        // }
        filterArr.map((item1, index1) => {
          arr.push(item[item1])
        })
        if (index === 0) {
          if (lookList.column_name_list.length > 1) {
            for (var i: number = 0; i < lookList.column_name_list.length - 1; i++) {
              arr[i] = 'JZT'
            }
            arr[lookList.column_name_list.length - 1] = lookList.row_name_list[index]
          } else {
            arr[lookList.column_name_list.length - 1] = lookList.row_name_list[index]
          }
          if (lookList.row_name_list.length === 1) {
            arr.unshift('E')
            arr.push('#')
          } else {
            arr.unshift('C')
            arr.push('#')
          }
        } else if (index > 0 && index < lookList.row_name_list.length - 1) {
          arr[lookList.column_name_list.length - 1] = lookList.row_name_list[index]

          arr.unshift('C')
          arr.push('#')
        } else if (index === lookList.row_name_list.length - 1 && lookList.row_name_list.length > 1) {
          arr[lookList.column_name_list.length - 1] = lookList.row_name_list[index]
          arr.unshift('E')
          arr.push('#')
        } else {
          arr.unshift('R')
          arr.push('#')
        }
        dataArr.push(arr)
      })

      var dataStr: string = ''

      for (var i = 0; i < dataArr.length; i++) {
        dataStr += dataArr[i].join(',') + '\n'
      }
      const newObj = headerObj + dataStr

      await useAssumptionVarPagesAPIs().outputExellFile(fname.value, newObj)
      changeStatus.type = false
      ChangeCurrentTagsStatus(changeStatus)
      await load(props.filename)
    }

    defineExpose({ SaveFile })

    const shortCutKeySave = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        SaveFile()
        e.preventDefault()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', shortCutKeySave, false)
    })

    onDeactivated(() => {
      document.removeEventListener('keydown', shortCutKeySave, false)
    })

    const appenFile = async (str) => {
      await useAssumptionVarPagesAPIs().outputExellAppendFile(fname.value, str)
    }

    const delTagsView = mapMutations(['DEL_TAGS_VIEW']).DEL_TAGS_VIEW.bind({
      $store: store
    })

    const formatLookList = async (data) => {
      if (data.rows?.length === 0) {
        loading.value = false
        return false
      }

      lookList.column_name_list = []
      lookList.row_name_list = []
      const dataColumns = data.columns.slice(1, data.columns.length - 1)
      dataColumns.map((item, index) => {
        if (item.length > 1) {
          lookList.column_name_list.push(item)
        }
      })
      await data.rows.map((rowArr, index) => {
        if (rowArr[0] === 'C' || rowArr[0] === 'E') {
          lookList.row_name_list.push(rowArr[lookList.column_name_list.length])
        }
      })
      await insertColumn(data)
      await insertRow(data, data.columns)
    }

    const insertColumn = async (data) => {
      LengthSet.cLen = lookList.column_name_list.length
      const dataColumns = data.columns.slice(1, data.columns.length - 1)

      await dataColumns.map((item, index) => {
        if (index === 0) {
          tableColumn.push({ id: 1000 + index, fixed: 'left', field: 'data' + index, title: '类型' })
        } else if (index > 0 && index < LengthSet.cLen) {
          tableColumn.push({ id: 1000 + index, field: 'data' + index, title: lookList.column_name_list[index].slice(1, 2) })
        } else {
          tableColumn.push({ id: 1000 + index, field: 'data' + index, title: item })
        }
      })
      // await productRules(tableColumn)
      tableShow.value = true
      loading.value = false
    }
    const productRules = async (colunmArr) => {
      colunmArr.map((item, index) => {

      })
      tableRules as VxeTablePropTypes.EditRules
      xGrid.value.updateData()
    }

    const insertRow = async (data) => {
      data.rows.map((item, index) => {
        const tableDataObj = {}
        const itemList = item.slice(1, item.length)
        LengthSet.rLen = lookList.row_name_list.length
        LengthSet.cLen = lookList.column_name_list.length
        if (index === 0) {
          itemList.map((item1, index1) => {
            if (index1 < LengthSet.cLen - 1) {
              tableDataObj['data' + index1] = lookList.column_name_list[index1].slice(5)
            } else if (index1 === LengthSet.cLen - 1) {
              tableDataObj['data' + index1] = lookList.column_name_list[LengthSet.cLen - 1].slice(5) + '/' + item1.slice(5)
              // tableDataObj['data' + index1] = item1.slice(5)
            } else {
              tableDataObj['data' + index1] = item1
            }
          })
        } else if (index > 0 && index < LengthSet.rLen) {
          itemList.map((item1, index1) => {
            if (index1 === LengthSet.cLen - 1) {
              tableDataObj['data' + index1] = item1.slice(5)
            } else {
              tableDataObj['data' + index1] = item1
            }
          })
        } else {
          itemList.map((item1, index1) => {
            tableDataObj['data' + index1] = item1
          })
        }
        tableData.push(tableDataObj)
      })

      if (xGrid) {
        await xGrid.value?.loadData(tableData.slice(0, 50))
        await xGrid.value?.loadData(tableData)
      }
      loading.value = false
    }

    const clearTableData = () => {
      tableData.splice(0, tableData.length)
      tableColumn.splice(0, tableColumn.length)
      LengthSet.cLen = 0
      LengthSet.rLen = 0
      // xGrid.value.updateData()
      lookList.row_name_list = []
      lookList.column_name_list = []
    }
    const handelInsertCol = async (columnName: String, columnList) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
      LengthSet.cLen = lookList.column_name_list.length
      LengthSet.rLen = lookList.row_name_list.length
      tableColumn.splice(LengthSet.cLen, 0, { fixed: 'left', field: 'data' + tableColumn.length, title: columnList.type })
      const currentField = tableColumn[LengthSet.cLen - 1].field
      tableData.map((item, index) => {
        if (index === 0) {
          const temp = item[currentField]
          item[currentField] = temp.split('/')[0]
          item['data' + (tableColumn.length - 1)] = columnName + '/' + temp.split('/')[1]
        } else if (index > 0 && index < LengthSet.rLen) {
          item['data' + (tableColumn.length - 1)] = item[currentField]
          item[currentField] = 'JZT'
        } else {
          item['data' + (tableColumn.length - 1)] = ''
        }
      })

      const columnNameStr = formatLookListStr(columnName, columnList)
      lookList.column_name_list.push(columnNameStr)
      lookList.columnInsertIndexArr.push(LengthSet.cLen)
      await xGrid.value.loadData(tableData.slice(0, 50))
      await xGrid.value.loadData(tableData)
    }

    const handelDeleteColName = async (columnname: String, columnList) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
      const colStr = formatLookListStr(columnname, columnList)
      var delInd: any = 0
      lookList.column_name_list.map((item, index) => {
        if (item === colStr) {
          delInd = index
        }
      })
      if (delInd === 0) {
        tableColumn[1].title = '类型'
        tableData.map((item, index) => {
          delete item[tableColumn[0].field]
        })
      } else if (delInd === lookList.column_name_list.length - 1) {
        tableData.map((item, index) => {
          if (index === 0) {
            item[tableColumn[delInd - 1].field] = item[tableColumn[delInd - 1].field] + '/' + item[tableColumn[delInd].field].split('/')[1]
            delete item[tableColumn[delInd].field]
          } else if (index > 0 && index < lookList.row_name_list.length) {
            item[tableColumn[delInd - 1].field] = item[tableColumn[delInd].field]
            delete item[tableColumn[delInd].field]
          } else {
            delete item[tableColumn[delInd].field]
          }
        })
      } else {
        tableData.map((item, index) => {
          delete item[tableColumn[delInd].field]
        })
      }
      if (lookList.columnInsertIndexArr.length > 0) {
        if (delInd < lookList.columnInsertIndexArr[0]) {
          lookList.columnInsertIndexArr.map((item, index) => {
            lookList.columnInsertIndexArr[index] = item - 1
          })
        } else {
          lookList.columnInsertIndexArr.map((item, index) => {
            if (delInd < item) {
              lookList.columnInsertIndexArr[index] = item - 1
            } else if (delInd === item) {
              lookList.columnInsertIndexArr.splice(index, 1)
              return false
            }
          })
        }
      }

      tableColumn.splice(delInd, 1)
      lookList.column_name_list.splice(delInd, 1)
    }
    const handelUpdateColName = async (columnNameList) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
      columnNameList.map((item, index) => {
        if (index === lookList.column_name_list.length - 1) {
          tableData[0][tableColumn[lookList.column_name_list.length - 1].field] = item.column_name + '/' + tableData[0][tableColumn[lookList.column_name_list.length - 1].field].split('/')[1]
        } else {
          tableData[0][tableColumn[index].field] = item.column_name
        }
        const colStr = formatLookListStr('', columnNameList[index], 'updatecol')// '#' + columnNameList[index].type + columnNameList[index].before_first + columnNameList[index].after_last + columnNameList[index].missing + columnNameList[index].column_name
        lookList.column_name_list[index] = colStr
      })
    }
    const handelInsertRowName = async (rowname: string, rowNameList) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
      const tableDataObj = {}
      LengthSet.rLen = lookList.row_name_list.length
      LengthSet.cLen = lookList.column_name_list.length
      tableColumn.map((item, index) => {
        if (index === LengthSet.cLen - 1) {
          tableDataObj[tableColumn[LengthSet.cLen - 1].field] = rowname
        } else if (index < LengthSet.cLen - 1) {
          tableDataObj[tableColumn[index].field] = 'JZT'
        } else {
          tableDataObj[tableColumn[index].field] = ''
        }
      })
      const rowNameStr = formatLookListStr(rowname, rowNameList, '')
      lookList.row_name_list.push(rowNameStr)

      //  const { row: newRow } = await xGrid.value.insertAt(tableDataObj, tableData[LengthSet.rLen])
      tableData.splice(LengthSet.rLen, 0, tableDataObj)
      lookList.rowInsertIndexArr.push(LengthSet.rLen)
      await xGrid.value.loadData(tableData.slice(0, 50))
      await xGrid.value.loadData(tableData)
    }
    const handelDeleteRowName = async (rowname: string, rowNameList) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
      const rowStr = formatLookListStr(rowname, rowNameList, '')
      var delInd1: number = 0
      lookList.row_name_list.map((item, index) => {
        if (item === rowStr) {
          delInd1 = index
        }
      })
      if (delInd1 === 0) {
        if (lookList.column_name_list.length === 1) {
          tableData[1][tableColumn[0].field] = tableData[0][tableColumn[0].field].split('/')[0] + '/' + tableData[1][tableColumn[0].field]
          tableData.splice(delInd1, 1)
          lookList.row_name_list.splice(delInd1, 1)
        } else if (lookList.column_name_list.length > 1) {
          tableColumn.map((item, index) => {
            if (index < lookList.column_name_list.length - 1) {
              tableData[1][tableColumn[index].field] = tableData[0][tableColumn[index].field]
            } else if (index === lookList.column_name_list.length - 1) {
              tableData[1][tableColumn[index].field] = tableData[0][tableColumn[index].field].split('/')[0] + '/' + tableData[1][tableColumn[index].field]
            }
          })
          tableData.splice(delInd1, 1)
          lookList.row_name_list.splice(delInd1, 1)
        }
      } else {
        tableData.splice(delInd1, 1)
        lookList.row_name_list.splice(delInd1, 1)
      }
      if (lookList.rowInsertIndexArr) {
        if (delInd1 < lookList.rowInsertIndexArr[0]) {
          lookList.rowInsertIndexArr.map((item, index) => {
            lookList.rowInsertIndexArr[index] = item - 1
          })
        } else {
          lookList.rowInsertIndexArr.map((item, index) => {
            if (delInd1 < item) {
              lookList.rowInsertIndexArr[index] = item - 1
            } else if (delInd1 === item) {
              lookList.rowInsertIndexArr.splice(index, 1)
              return false
            }
          })
        }
      }
      xGrid.value.loadData(tableData.slice(0, 50))
      await xGrid.value.loadData(tableData)
    }
    const handelUpdateRowName = async (rowNameList) => {
      changeStatus.type = true
      ChangeCurrentTagsStatus(changeStatus)
      lookList.row_name_list = []
      const currentField = tableColumn[lookList.column_name_list.length - 1].field
      rowNameList.map((item, index) => {
        if (index === 0) {
          tableData[0][currentField] = tableData[0][currentField].split('/')[0] + '/' + item.row_name
        } else {
          tableData[index][currentField] = item.row_name
        }
        const rowStr = formatLookListStr('', rowNameList[index], 'updaterow')
        lookList.row_name_list.push(rowStr)
      })
    }
    const isTableChangeValue = async (row, id) => {
      const $table = xGrid.value
      const currentColumnData = tableColumn[row.columnIndex]
      const currenRowData = row.data[row.$rowIndex]
      if ($table.getUpdateRecords().length > 0 || $table.getInsertRecords().length > 0) {
        if (currentColumnData.title === 'n') {
          const reg = /^([1-9][0-9]*|0)(\.[0-9]*[1-9])?$/
          if (!reg.test(currenRowData[currentColumnData.field])) {
            proxy.$message({
              message: '只能为int数字类型',
              type: 'error'
            })
          }
        } else {
          if (currenRowData[currentColumnData.field] === '') {
            proxy.$message({
              message: '不可为空值',
              type: 'error'
            })
          }
        }
        // row.rule = { required: true, message: 'dddd', trigger: 'change' }
        // row.$table.showValidTooltip(row)
        changeStatus.type = true
        ChangeCurrentTagsStatus(changeStatus)
      } else {
        changeStatus.type = false
        ChangeCurrentTagsStatus(changeStatus)
      }
    }

    const formatLookListStr = (name, nameList, type) => {
      let rowStr: string = ''
      if (type === 'updatecol') {
        rowStr = '#' + nameList.type + nameList.before_first + nameList.after_last + nameList.missing + nameList.column_name
      } else if (type === 'updaterow') {
        rowStr = '#' + nameList.type + nameList.before_first + nameList.after_last + nameList.missing + nameList.row_name
      } else {
        rowStr = '#' + nameList.type + nameList.before_first + nameList.after_last + nameList.missing + name
      }
      return rowStr
    }

    const load = (fname: string) => {
      loadDataE(fname)
    }

    onMounted(() => {
      clearTableData()
      fname.value = props.filename
      load(props.filename)
      clientHeight.value = `${document.documentElement.clientHeight}`
      lookList.HTL = lookBox.value.offsetHeight
      DomResize()
      HT.value = 300
    })

    const DomResize = () => {
      var erd = elementResizeDetectorMaker()
      erd.listenTo(tableBox.value, (ele) => {
        HT.value = ele.offsetHeight
        //  HTL.value = lookBox.value.offsetHeight
        lookList.HTL = lookBox.value.offsetHeight
      })
    }

    watch(props, (newValue, oldValue) => {
      console.log(props, 'props')

      if (props.filename === '') {
        clearTableData()
      } else {
        load(props.filename)
        fname.value = props.filename
      }
      if (props.tableInfnH > 500) {
        H.value = 500
      } else {
        H.value = props.tableInfnH
      }
    })
    return {
      loading,
      tableRules,
      tableData,
      tableColumn,
      tableOutBox,
      clientHeight,
      changeStatus,
      lookBox,
      HTL,
      xGrid,
      tableShow,
      H,
      options,
      selectC,
      LengthSet,
      tableBox,
      lookList,
      HT,
      fname,
      load,
      handelInsertCol,
      handelInsertRowName,
      handelDeleteColName,
      handelDeleteRowName,
      handelUpdateRowName,
      handelUpdateColName,
      resultToExcel,
      appenFile,
      ChangeCurrentTagsStatus,
      headerCellClickEvent,
      cellClickEvent,
      insertColumn,
      insertRow,
      DomResize,
      SaveFile,
      test,
      isTableChangeValue,
      productRules,
      changeType
      // tableDataObj
    }
  },
  components: {
    LookUp,
    SplitPanel
  }
})

</script>

<style lang="scss" scoped>
.header_name_select {
  display: flex;
  align-items: center;
  height: 500px;
}
.header_select {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header_select select {
  width: 90%;
}
.table-top-tags-box {
  width: 100%;
  height: 32px;
  background: #f1f2f4;
  border-bottom: 1px solid #d0d0d0;
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
}
.mytable-scrollbar ::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.mytable-scrollbar .vxe-select-option--wrapper {
  z-index: 9999;
}
/*滚动条的轨道*/
.mytable-scrollbar ::-webkit-scrollbar-track {
  background-color: #e2e2e2;
}
/*滚动条里面的小方块，能向上向下移动*/
.mytable-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #bfbfbf;
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
.mytable-scrollbar ::-webkit-scrollbar-thumb:active {
  background-color: #787878;
}
/*边角，即两个滚动条的交汇处*/
.mytable-scrollbar ::-webkit-scrollbar-corner {
  background-color: #ffffff;
}
.mytable-scrollbar .vxe-header--column.col-blue {
  background-color: #2db7f5;
  color: #fff;
}
.vxe-select--panel {
  z-index: 99;
}
// .header_name {
//   z-index: 99;
//   text-align: center;
// }
.table-out-box {
  height: calc(100%);
  .coding-pane {
    width: 100%;
    height: calc(100% - 46px);
    .table-box {
      width: 100%;
      height: calc(100% - 62px);
    }
  }
}
</style>
