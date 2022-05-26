/* eslint-disable no-const-assign */
<template>
  <div class="look-up-box" ref="lookUp" :height="HTL">
    <p class="look-show-box">
      <span @click="lookShow()">查询</span>
      <i @click="lookHide()" v-show="lookIsShow">—</i>
    </p>

    <div class="look-up-inner-box" v-show="lookIsShow">
      <div class="inner-box look-up-left-box">
        <div class="btn-box">
          <el-button
            type="primary"
            class="add-look-btn"
            @click="insertRowName()"
          >
            <el-icon><folder-add /></el-icon> 添加
          </el-button>
          <el-button
            type="primary"
            v-show="showSaveBtn"
            class="add-look-btn"
            @click="saveRowNameEvent()"
          >
            <el-icon><folder-add /></el-icon> 保存
          </el-button>
        </div>
        <div class="list">
          <vxe-table
            border
            keep-source
            ref="RowNameTable"
            class="mytable-scrollbar"
            :height="HT1 + 'px'"
            size="small"
            style="font-size: 12px"
            :edit-rules="validRules1"
            :data="rowDataObj.rowData"
            show-header-overflow
            :edit-config="{
              trigger: 'click',
              mode: 'cell',
              icon: 'fa fa-pencil',
              showStatus: true,
            }"
          >
            <vxe-column
              field="row_name"
              align="center"
              title="列索引"
              min-width="100"
              fixed="left"
              :edit-render="{
                name: 'input',
                placeholder: '请输入名称',
                events: { change: ptypeChangeEvent },
              }"
            >
            </vxe-column>
            <vxe-column
              field="type"
              title="类型"
              min-width="100"
              align="center"
              :edit-render="{
                name: '$select',
                options: lookUpTypes.type,
                events: { change: ptypeChangeEvent },
              }"
            >
            </vxe-column>

            <vxe-column
              field="before_first"
              align="center"
              title="小于最小值"
              min-width="100"
              :edit-render="{
                name: '$select',
                options: lookUpTypes.before_first,
                events: { change: ptypeChangeEvent },
              }"
            >
            </vxe-column>
            <vxe-column
              field="after_last"
              min-width="100"
              align="center"
              title="大于最大值"
              :edit-render="{
                name: '$select',
                options: lookUpTypes.after_last,
                events: { change: ptypeChangeEvent },
              }"
            >
            </vxe-column>
            <vxe-column
              field="missing"
              min-width="100"
              align="center"
              title="缺失 "
              :edit-render="{
                name: '$select',
                options: lookUpTypes.missing,
                events: { change: ptypeChangeEvent },
              }"
            >
            </vxe-column>

            <vxe-column title="操作" width="100" align="center" show-overflow>
              <template #default="{ row }">
                <span
                  @click="removeRowEvent(row)"
                  style="color: red; cursor: pointer"
                  >删除</span
                >
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
      <div class="inner-box look-up-right-box">
        <div class="btn-box">
          <el-button
            type="primary"
            class="add-look-btn"
            @click="insertColumnName()"
          >
            <el-icon><folder-add /></el-icon> 添加
          </el-button>
          <el-button
            type="primary"
            v-show="showColumnSaveBtn"
            class="add-look-btn"
            @click="saveColumnNameEvent()"
          >
            <el-icon><folder-add /></el-icon> 保存
          </el-button>
        </div>
        <div class="list">
          <vxe-table
            border
            show-overflow
            keep-source
            ref="ColumnNameTable"
            class="mytable-scrollbar"
            :height="HT1 + 'px'"
            size="small"
            :edit-rules="validRules1"
            :data="rowDataObj.columnData"
            show-header-overflow
            style="font-size: 12px"
            :edit-config="{
              trigger: 'click',
              mode: 'cell',
              icon: 'fa fa-pencil',
              showStatus: true,
            }"
          >
            <vxe-column
              field="column_name"
              align="center"
              title="行索引"
              fixed="left"
              min-width="100"
              :edit-render="{
                name: 'input',
                placeholder: '默认的名字',
                events: { change: ptypeChangeColEvent },
              }"
            >
            </vxe-column>
            <vxe-column
              field="type"
              title="类型"
              min-width="100"
              align="center"
              :edit-render="{
                name: '$select',
                options: lookUpTypes.type,
                events: { change: ptypeChangeColEvent },
              }"
            >
            </vxe-column>

            <vxe-column
              field="before_first"
              align="center"
              title="小于最小值"
              min-width="100"
              :edit-render="{
                name: '$select',
                options: lookUpTypes.before_first,
                events: { change: ptypeChangeColEvent },
              }"
            >
            </vxe-column>
            <vxe-column
              field="after_last"
              min-width="100"
              align="center"
              title="大于最大值"
              :edit-render="{
                name: '$select',
                options: lookUpTypes.after_last,
                events: { change: ptypeChangeColEvent },
              }"
            >
            </vxe-column>
            <vxe-column
              field="missing"
              min-width="100"
              align="center"
              title="缺失 "
              :edit-render="{
                name: '$select',
                options: lookUpTypes.missing,
                events: { change: ptypeChangeColEvent },
              }"
            >
            </vxe-column>

            <vxe-column title="操作" width="100" align="center" show-overflow>
              <template #default="{ row }">
                <span
                  @click="removeColumnEvent(row)"
                  style="color: red; cursor: pointer"
                  >删除</span
                >
              </template>
            </vxe-column>
          </vxe-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import { onMounted, nextTick, reactive, ref, getCurrentInstance, watch } from 'vue'
import { VXETable, VxeTableInstance, VxeTablePropTypes } from 'vxe-table'
import elementResizeDetectorMaker from 'element-resize-detector'
import { ElMessage } from 'element-plus'
const { proxy }: any = getCurrentInstance()
const props = defineProps<{ lookList }>()
const emit = defineEmits(['handelInsertRowName', 'handelUpdateColName', 'handelDeleteColName', 'handelUpdateRowName', 'handelDeleteRowName', 'handelInsertCol'])
const showSaveBtn = ref(false)

const lookIsShow = ref(true)
const showColumnSaveBtn = ref(false)
const lookUp = ref<null | HTMLElement>(null)
// const innerBox = ref<null | HTMLElement>(null)
const rowDataObj = reactive({
  rowData: [],
  columnData: []
})

const RowNameTable = ref({} as VxeTableInstance)
const ColumnNameTable = ref({} as VxeTableInstance)
const HT1 = ref(0)
const HTL = ref(0)
const lookUpTypes = reactive({
  type: [
    { label: '字符', value: 's' },
    { label: '数字', value: 'n' }
  ],
  before_first: [
    { label: '第一个', value: 'f' },
    { label: '默认', value: 'm' },
    { label: '错误', value: 'e' }
  ],
  after_last: [
    { label: '最后', value: 'l' },
    { label: '默认', value: 'm' },
    { label: '错误', value: 'e' }
  ],
  missing: [
    { label: '前一个', value: 'p' },
    { label: '下一个', value: 'n' },
    { label: '默认', value: 'm' },
    { label: '错误', value: 'e' }
  ]
})
const ptypeChangeEvent = (row, id) => {
  const $table = RowNameTable.value
  if ($table.getUpdateRecords().length > 0 || $table.getInsertRecords().length > 0) {
    // showSaveBtn.value = true
  } else {
    showSaveBtn.value = false
  }
  saveRowNameEvent()
}
const ptypeChangeColEvent = (row, id) => {
  const $table = ColumnNameTable.value
  if ($table.getUpdateRecords().length > 0 || $table.getInsertRecords().length > 0) {
    // showColumnSaveBtn.value = true
  } else {
    showColumnSaveBtn.value = false
  }
  saveColumnNameEvent()
}

const formatRowData = async (dataArr) => {
  rowDataObj.rowData = []
  // const newObj = {}

  dataArr.map((item, index) => {
    const newObj = {
      row_name: '', type: '', before_first: '', after_last: '', missing: ''
    }
    newObj.row_name = item.slice(5, item.length)
    newObj.type = item.slice(1, 2)
    newObj.before_first = item.slice(2, 3)
    newObj.after_last = item.slice(3, 4)
    newObj.missing = item.slice(4, 5)
    rowDataObj.rowData.push(newObj)
  })
}

const validRules1 = ref({
  row_name: [
    { required: true, message: 'row_name必须填写' },
    {
      validator({ cellValue }) {
        if (cellValue && !/^\w+$/.test(cellValue)) {
          return new Error('名称格式不正确，必须字母或数字')
        }
      }
    }
  ],
  column_name: [
    { required: true, message: 'column_name必须填写' },
    {
      validator({ cellValue }) {
        if (cellValue && !/^\w+$/.test(cellValue)) {
          return new Error('名称格式不正确，必须字母或数字')
        }
      }
    }
  ]
} as VxeTablePropTypes.EditRules)

const insertRowName = async () => {
  const $table = RowNameTable.value
  // showSaveBtn.value = true
  const record = {
    type: 's', before_first: 'f', after_last: 'e', missing: 'e'
  }
  const { row: newRow } = await $table.insertAt(record, -1)
  saveRowNameEvent()
}

const saveRowNameEvent = async () => {
  const $table = RowNameTable.value
  const { insertRecords, removeRecords, updateRecords } = $table.getRecordset()
  const errMap = await $table.validate().catch(errMap => errMap)

  // if (errMap) {
  //   VXETable.modal.message({ status: 'error', content: '校验不通过！' })
  // } else {
  //   // VXETable.modal.message({ status: 'error', content: '校验过！' })
  //   VXETable.modal.confirm('您确定保存数据数据吗?').then(type => {
  //     if (type === 'confirm') {
  if (insertRecords.length > 0) {
    insertRecords.map((item, index) => {
      emit('handelInsertRowName', item.row_name, item)
    })
  } else if (updateRecords.length > 0) {
    const tadata = RowNameTable.value.data
    rowDataObj.rowData = tadata
    emit('handelUpdateRowName', tadata)
  }
  //     showSaveBtn.value = false
  //   } else {
  //     $table.revertData()
  //   }
  // })
  // }
  $table.updateData()

  const tadata = RowNameTable.value.data
  rowDataObj.rowData = tadata
}
const removeRowEvent = async (row) => {
  if (rowDataObj.rowData.length <= 1) {
    VXETable.modal.message({ status: 'error', content: '唯一行不可删除' })
  } else {
    proxy.$alert('确定要删除行?', '提示', {
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      showCancelButton: true
    }).then(() => {
      emit('handelDeleteRowName', row.row_name, row)
      const $table = RowNameTable.value
      $table.remove(row)
    }).catch(() => { })
  }
}
const removeColumnEvent = async (row) => {
  if (rowDataObj.columnData.length <= 1) {
    VXETable.modal.message({ status: 'error', content: '唯一列不可删除' })
  } else {
    proxy.$alert('确定要删除?', '提示', {
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      showCancelButton: true
    }).then(() => {
      emit('handelDeleteColName', row.column_name, row)
      const $table = RowNameTable.value
      $table.remove(row)
    }).catch(() => { })
  }
}
const insertEvent = async (row: any) => {
  const $table = RowNameTable.value
  rowDataObj.rowData.push({
    row_name: '请输入名称', type: '', before_first: '', after_last: '', missing: ''
  })
}

const formatColumnData = async (dataArr) => {
  rowDataObj.columnData = []
  // const newObj = {}

  dataArr.map((item, index) => {
    const newObj = {
      column_name: '', type: '', before_first: '', after_last: '', missing: ''
    }
    newObj.column_name = item.slice(5, item.length)
    newObj.type = item.slice(1, 2)
    newObj.before_first = item.slice(2, 3)
    newObj.after_last = item.slice(3, 4)
    newObj.missing = item.slice(4, 5)
    rowDataObj.columnData.push(newObj)
  })
}

const saveColumnNameEvent = async () => {
  const $table = ColumnNameTable.value
  const { insertRecords, removeRecords, updateRecords } = $table.getRecordset()
  const errMap1 = await $table.validate().catch(errMap => errMap)
  // if (errMap1) {
  //   VXETable.modal.message({ status: 'error', content: '校验不通过！' })
  // } else {
  //   VXETable.modal.confirm('您确定保存数据数据吗?').then(type => {
  //     if (type === 'confirm') {
  if (insertRecords.length > 0) {
    insertRecords.map((item, index) => {
      emit('handelInsertCol', item.column_name, item)
    })
    showColumnSaveBtn.value = false
  } else if (updateRecords.length > 0) {
    const tadata = ColumnNameTable.value.data
    rowDataObj.rowData = tadata
    emit('handelUpdateColName', tadata)
  }
  //       showColumnSaveBtn.value = false
  //     } else {
  //       $table.revertData()
  //     }
  //   })
  // }
}

const insertColumnName = async () => {
  const $table = ColumnNameTable.value
  showColumnSaveBtn.value = true
  const record = {
    type: 's', before_first: 'f', after_last: 'e', missing: 'e'
  }
  const { row: newRow } = await $table.insertAt(record, -1)
  saveColumnNameEvent()
}

const lookShow = async () => {
  lookIsShow.value = true
}
const lookHide = async () => {
  lookIsShow.value = false
}
const DomResize1 = () => {
  var erd1 = elementResizeDetectorMaker()
  erd1.listenTo(lookUp.value, (ele) => {
    HT1.value = ele.offsetHeight - 90
  })
}
onMounted(() => {
  // DomResize1()
  // HTL = 500
  HTL.value = props.lookList.HTL
  HT1.value = props.lookList.HTL - 150
})

watch(props, (newValue) => {
  formatRowData(newValue.lookList.row_name_list)
  formatColumnData(newValue.lookList.column_name_list)
  HT1.value = newValue.lookList.HTL - 150
  HTL.value = newValue.lookList.HTL
})

</script>

<style lang="scss">
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
.look-up-box {
  background: #f0f1f2;

  border: 1px solid #cfcfd1;
  position: absolute;
  bottom: 0;
  width: 100%;

  // span {
  //   font-size: 14px;
  //   font-family: PingFangSC-Medium, PingFang SC;
  //   font-weight: 500;
  //   color: #000000;
  //   padding: 0 30px;
  //   margin: 10px 0;
  // }
  .look-show-box {
    height: 40px;
    font-size: 14px;
    display: flex;
    align-items: center;
    color: #000000;
    margin: 0 30px;
    justify-content: space-between;
    span {
      cursor: pointer;
    }
    i {
      cursor: pointer;
    }
  }
  .look-up-inner-box {
    display: flex;
    width: 100%;
    overflow-y: scroll;
    .btn-box {
      display: flex;
      .add-look-btn {
        width: 94px;
        height: 32px;
        // line-height: 32px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        i {
          font-size: 16px;
        }
      }
      margin-right: 20px;
    }

    div.inner-box {
      width: 50%;
      padding: 20px 30px;

      // height: 250px;
      // height: calc(100% - 40px);

      .list {
        margin: 10px 0;
        width: 100%;
        // overflow-y: scroll;
        // height: 100%;
      }
      .list::-webkit-scrollbar {
        display: none;
      }
    }
    div.look-up-left-box {
      border-right: 1px inset #d7dfec;
    }
  }
}
</style>
