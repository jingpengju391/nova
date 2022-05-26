<template>
  <div class="table-box" ref="tableBox">
    <el-empty v-show="!tabsIsShow" style="height: 100%" />
    <div style="height: 100%">
      <div v-show="tabsIsShow" class="tabs-out-box">
        <el-icon @click="prevTabs"><arrow-left /></el-icon>
        <el-icon @click="nextTabs"><arrow-right /></el-icon>
        <div class="main-box-tab-content" ref="tabsBox">
          <ul ref="tabs">
            <li
              v-for="(item, index) in tagsViewList"
              :key="index"
              :class="item.curSelect ? 'cur' : ''"
            >
              <span
                :class="item.isSave ? '' : 'noSave'"
                @click="handleCurrentTagsView(item)"
                >{{ item.label }}</span
              >
              <el-icon @click="handleDelTagsView(item)"><close /></el-icon>
            </li>
          </ul>
        </div>
      </div>
      <div style="height: 100%">
        <TableTab
          class=""
          v-for="item in tagsViewList"
          :key="item.id"
          v-show="item.curSelect"
          style="height: 100%"
          :ref="useSaveProfiles(item)"
          :tableInfnH="tableInfnH"
          :tabSitem="item.id"
          :filename="item.value"
        />
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import TableTab from './../../components/TableTab/TableTab.vue'
import TableLookupInput from './../../components/TableTab/TableLookupInput.vue'
import { modelFile, FileTable } from '../types'
import { onMounted, nextTick, reactive, ref, getCurrentInstance, watch, toRefs } from 'vue'
import { useStore, createNamespacedHelpers } from 'vuex'
import { VXETable, VxeTableInstance } from 'vxe-table'
import { ElMessageBox, ElMessage } from 'element-plus'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { AnyAaaaRecord } from 'dns'
import { Item } from 'ant-design-vue/es/menu'
import { PropertyName } from 'lodash'

const { proxy }: any = getCurrentInstance()
const props = defineProps<{ currFile: modelFile }>()
const { mapState, mapMutations, mapGetters } = createNamespacedHelpers('assumptionTable/')
const store = useStore()
// const addTagsView = mapMutations(['ADD_TAGS_VIEW'])// ['assumptionTable/ADD_TAGS_VIEW']
const tagsViewList = reactive(store.state.assumptionTable.tagsView)
// const tagsViewList = reactive([])
const filename: string = ref('')
const input = ref('')
const tabsIsShow = ref(false)
const tableBox = ref<null | HTMLElement>(null)
const tabsBox = ref<null | HTMLElement>(null)
const tabs = ref(null)
const lookUp = ref<null | HTMLElement>(null)
const tableInfnH = ref(0)
const saveClick = ref(false)
const demo1 = reactive({
  value30: 1
})

const refTable:any = {}
function useSaveProfiles(table:FileTable) {
  return (el:HTMLElementAny) => {
    refTable[table.id] = toRefs(el)
  }
}

const moveX = ref<number>(0)
const xTable = ref({} as VxeTableInstance)
const tableInfoHeight = () => {
  const HT = tableBox.value ? tableBox.value?.offsetHeight : 0
  const tabsH = tabs.value?.offsetHeight + 14
  if (HT - tabsH - 50 > 500) {
    tableInfnH.value = 500
  } else {
    tableInfnH.value = HT - tabsH - 50
  }
}

const handleInputChange = (calbackSelect) => {
  console.log(calbackSelect)
}
const tableData = ref([
  {
    row_name: '', type: '', before_first: '', after_last: '', missing: ''
  }
])

const type = reactive([
  { label: '字符', value: 's' },
  { label: '数字', value: 'n' }
])
const addTagsView = mapMutations(['ADD_TAGS_VIEW']).ADD_TAGS_VIEW.bind({
  $store: store
})
const delTagsView = mapMutations(['DEL_TAGS_VIEW']).DEL_TAGS_VIEW.bind({
  $store: store
})
const CurrentTagsView = mapMutations(['CURRENT_TAGS_VIEW']).CURRENT_TAGS_VIEW.bind({
  $store: store
})
const translateX = () => {
  // moveX.value = x < 0 ? 0 : x
  let x: number = 0
  nextTick(() => {
    moveX.value = tabs.value.clientWidth - tabsBox.value.clientWidth
    x = moveX.value < 0 ? 0 : moveX.value
    tabs.value.style.transform = `translateX(${-x}px)`
  })
}
const handleDelTagsView = (view) => {
  if (!view.isSave) {
    ElMessageBox.confirm(
      '文件有修改是否保存后关闭或直接关闭?',
      '提示',
      {
        confirmButtonText: '保存后关闭',
        cancelButtonText: '直接关闭',
        type: 'warning'
        // showCancelButton: true
      }
    )
      .then(() => {
        changeFileName()
        translateX()
        refTable[view.id] && refTable[view.id].SaveFile.value()
        delTagsView(view)
      })
      .catch(() => {
        delTagsView(view)
      })
  } else {
    delTagsView(view)
    changeFileName()
    translateX()
  }
}

const handleCurrentTagsView = (view) => {
  CurrentTagsView(view)
  changeFileName()
}

const changeFileName = () => {
  if (tagsViewList.length === 0) {
    // eslint-disable-next-line no-const-assign
    filename.value = ''
  } else {
    tagsViewList.map((item, index) => {
      if (item.curSelect) {
        // eslint-disable-next-line no-const-assign
        filename.value = item.value
      }
    })
  }
}

onMounted(() => {
  tableInfoHeight()
})

const prevTabs = () => {
  if (moveX.value > 100) {
    moveX.value = moveX.value - 100
    nextTick(() => {
      tabs.value.style.transform = `translateX(-${moveX.value}px)`
    })
  } else {
    nextTick(() => {
      moveX.value = 0
      tabs.value.style.transform = `translateX(-${moveX.value}px)`
    })
  }
}
const nextTabs = () => {
  nextTick(() => {
    if (moveX.value >= tabs.value.clientWidth - tabsBox.value.clientWidth) {
      moveX.value = tabs.value.clientWidth - tabsBox.value.clientWidth
      tabs.value.style.transform = `translateX(-${moveX.value}px)`
    } else {
      moveX.value = moveX.value + 100
      tabs.value.style.transform = `translateX(-${moveX.value}px)`
    }
  })
}
watch(tagsViewList, () => {
  if (tagsViewList.length > 0) {
    tabsIsShow.value = true
  } else {
    tabsIsShow.value = false
  }
})
watch(props, (newV, oldV) => {
  if (props.currFile.value?.isFile) {
    // eslint-disable-next-line no-unused-vars
    const newObj: FileTable = {
      id: props.currFile.value.id,
      label: props.currFile.value.label,
      name: props.currFile.value.label,
      isSave: true,
      curSelect: true,
      value: props.currFile.value.value
    }
    // console.log(newObj)

    filename.value = props.currFile.value.value
    addTagsView(newObj)
    nextTick(() => {
      changeFileName()
    })

    nextTick(() => {
      moveX.value = tabs.value.clientWidth - tabsBox.value.clientWidth
      translateX(moveX.value)
    })
  }
})
window.addEventListener('resize', () => {
  // tableInfoHeight()
})
const insertEvent = async (row: any) => {
  const $table = xTable.value
  const record = {
    sex: '1',
    date12: '2021-01-01'
  }

  const { row: newRow } = await $table.insertAt(record, row)
  await $table.setActiveCell(newRow, 'sex')
}
const removeEvent = (row) => {
  proxy.$alert('确定要删除?', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    showCancelButton: true
  }).then(() => {
    const $table = xTable.value
    $table.remove(row)
    setTimeout(() => {
    }, 3000)
  }).catch(() => { })
}
const saveEvent = () => {
  const $table = xTable.value
  const { insertRecords, removeRecords, updateRecords } = $table.getRecordset()

  VXETable.modal.alert(`insertRecords=${insertRecords.length} removeRecords=${removeRecords.length} updateRecords=${updateRecords.length}`)
}
</script>

<style lang='scss' scoped>
.table-box {
  width: 100%;
  height: 100%;
  position: relative;

  .tabs-out-box {
    position: relative;
    height: 32px;
    line-height: 32px;
    overflow: hidden;
    & > i {
      position: absolute;
      cursor: pointer;
      bottom: 10px;
      z-index: 999;
      //  display: none;

      &:nth-child(1) {
        left: 0;
      }

      &:nth-child(2) {
        right: 0;
      }
    }
    .main-box-tab-content {
      overflow: hidden;
      overflow-x: scroll;
      width: calc(100% - 40px);
      margin-left: 20px;
      ul {
        list-style: none;
        display: inline-flex;
        transition: transform 0.5s;
        justify-content: start;
        padding: 0;
        border: 1px solid #d0d0d0;
        height: 32px;
        background: #f1f2f4;
        align-items: center;
        width: auto;
        min-width: 100%;
        // overflow-x: scroll;
        // -webkit-overflow-scrolling: touch;
        margin: 0;
        width: auto;

        li {
          position: relative;
          cursor: pointer;
          color: #333333;
          padding: 0 15px;
          height: 32px;
          line-height: 32px;
          display: flex;
          align-items: center;
          i {
            color: #aab5cb;
            margin-left: 10px;
          }
          i.line {
            padding: 0;
            color: #d7dfec;
          }
          span {
            position: relative;
          }
          span.noSave::after {
            position: absolute;
            content: "";
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: red;
            top: 10px;
            right: -8px;
          }
        }
        li::after {
          content: "|";
          position: absolute;
          right: -3px;
          top: 0;
          color: #d7dfec;
        }
        li.cur {
          color: #3b8bff;
          height: 31px;
          line-height: 31px;
          margin-top: 1px;
          background: #ffffff;
          border-top-left-radius: 5px;
          border-top-right-radius: 5px;
          i.line {
            display: none;
            color: #d7dfec;
          }
        }
        li.cur::after {
          display: none;
          content: "|";
          position: absolute;
          right: -3px;
          top: 0;
          color: #d7dfec;
        }
      }
      ul::-webkit-scrollbar {
        width: 0.01rem;
        opacity: 0;
        display: none;
      }
    }
  }
  .tabs-out-box:hover {
    & > i {
      display: inline;
    }
  }
  .look-up-box {
    background: #f0f1f2;
    // min-height: 200px;
    margin-top: 30px;
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
      div.inner-box {
        width: 50%;
        padding: 20px 30px;

        height: 250px;
        // overflow-y: scroll;
        .list {
          margin: 10px 0;
          width: 100%;
        }
      }
      div.look-up-left-box {
        border-right: 1px inset #d7dfec;
      }
    }
  }
}
.updown-input {
  width: 100%;
  position: relative;
  .icon {
    position: absolute;
    right: 5px;
    top: 3px;
    width: 15px;
    display: flex;
    flex-wrap: wrap;
    z-index: 99;
    align-items: center;
    i {
      font-size: 12px;
      cursor: pointer;
    }
  }
}
</style>
