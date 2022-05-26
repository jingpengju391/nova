<template>
  <el-table
    ref="tableDom"
    border
    class="table-box"
    :data="V"
    row-key="id"
  >
    <template v-for="(item, index) in S">
      <el-table-column
        v-if="item.status || item.value === 'name'"
        :prop="item.value"
        :label="item.label"
        :width="tableColumnWidth"
        :key="item.value + item.isEdit"
      >
        <template #header="scope">
          <span
            v-if="!item?.isEdit"
            @contextmenu="(e) => hanldeEeditCell(e, scope, item, 0)"
            >{{ scope.column.label }}</span
          >
          <el-input
            :class="scope.column.label ? '' : 'rlue-style'"
            v-else
            v-focus
            v-model="scope.column.label"
            placeholder="请输入内容"
            @blur="hanldeEnter(scope, item)"
            @keyup.enter="$event.target.blur()"
          ></el-input>
        </template>
        <template #default="scope">
          <div v-if="index">
            <el-input-number
              :class="
                scope.row[item.value] || scope.row[item.value] === 0
                  ? ''
                  : 'rlue-style'
              "
              v-if="scope.row.type === 'number'"
              v-model="scope.row[item.value]"
              controls-position="right"
              :disabled="!scope.column.label"
              @input="hanldeVariableField(scope)"
              @keyup.enter="$event.target.blur()"
            />
            <el-input
              v-else
              :class="scope.row[item.value] ? '' : 'rlue-style'"
              :disabled="!scope.column.label"
              v-model="scope.row[item.value]"
              @blur="hanldeVariableField(scope)"
              @keyup.enter="$event.target.blur()"
            ></el-input>
          </div>
          <span
            v-else
            @contextmenu="(e) => hanldeEeditCell(e, scope, item, 1)"
            >{{ scope.row[item.value] }}</span
          >
        </template>
      </el-table-column>
    </template>
    <el-table-column fixed="right" width="35">
      <template #header>
        <el-popover placement="bottom" :width="250" trigger="click">
          <template #reference>
            <el-icon><arrow-right /></el-icon>
          </template>
          <SectionList />
        </el-popover>
      </template>
    </el-table-column>
  </el-table>
</template>
<script setup lang="ts" name="VariableTable">
import { useStore } from 'vuex'
import { watch, getCurrentInstance, ref, nextTick, computed, onMounted } from 'vue'
import { modelFile } from '../types'
import { initColumnSection } from '../config'
import { HTMLElementAny, tableColumnWidth, VariableSectionlimiter, VariableSectionlimiterHeader, ArrayToString } from '@shared/dataModelTypes/assumptions'
import { ElMessage } from 'element-plus'
import SectionList from './SectionList.vue'
import { filterNavigationTree, insertData, stickData } from '../config/combination'
import Sortable, { CustomEvent } from 'sortablejs'
// import { useRoute } from 'vue-router'

// const route = useRoute()
const store = useStore()
const { proxy }: any = getCurrentInstance()
const props = defineProps<{ currFile: modelFile }>()
const tableDom = ref<null | HTMLElementAny>(null)
const V = store.getters['assumptionVar/variable']
const S = store.getters['assumptionVar/section']
const emit = defineEmits(['createSection', 'handleDrawer', 'createVariable'])
const isTableShow = ref(true)
let temporaryName = {}
let rowDropSort: Sortable | null = null
let columnDropSort: Sortable | null = null
let findIndex = 0
const currentCopySection: any = computed(() => store.getters['assumptionVar/gettersCurrentCopySection'])

const hanldeEeditCell = (event: MouseEvent, scope: any, curr: any, num: number) => {
  const menuItems = getModelNaviNodeContextMenuItems(scope, curr, num)
  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
}

const getModelNaviNodeContextMenuItems = (data: any, curr: any, num: number) => {
  return [
    {
      title: '编辑',
      shortCut: 'F12',
      onClick: () => updateCurrentModelNodeWithModelNaviNode(data, curr)
    },
    {
      title: '复制',
      shortCut: 'Ctrl+c',
      onClick: () => hanldeCopy(data, curr, num)
    },
    {
      title: '粘贴',
      shortCut: 'Ctrl+v',
      // disabled: !currentCopySection.value.$index,
      onClick: () => hanldeStick(data, curr, num)
    },
    {
      title: '向前插入',
      shortCut: '',
      disabled: !data.$index || !!num,
      onClick: () => insertForward(data, curr)
    },
    {
      title: '向后插入',
      shortCut: '',
      disabled: !!num,
      onClick: () => insertBackward(data, curr)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        const val = num ? '变量' : 'section'
        const name = num ? data.row.name : data.column.label
        proxy.$alert(`确定要删除${val} ${name}?`, '提示', {
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          showCancelButton: true
        }).then(() => {
          deleteModelFiles(data, curr)
        }).catch(() => { })
      }
    }
  ]
}

const updateCurrentModelNodeWithModelNaviNode = (data: any, curr: any) => {
  temporaryName = curr.label
  if (data.row) {
    data.row.drawer = true
    emit('handleDrawer', data.row)
    store.commit('assumptionVar/addCurrVariable', data.row)
  } else {
    curr.isEdit = true
  }
}

const deleteModelFiles = (data: any, curr: any) => {
  const obj = data.row ? data.row : curr
  const path = data.row ? 'assumptionVar/deleteVariableInputsWithDBSync' : 'assumptionVar/deleteSectionInputsWithDBSync'
  store.dispatch(path, obj).then(async (res) => {
    if (data.row) {
      const modelId = props.currFile.value.modelId
      const variableId = data.row.id
      const treeData: any = await filterNavigationTree(modelId)
      treeData.forEach((item: any) => {
        item.children.forEach((iter: any) => {
          iter.assumptionBind =
            iter?.assumptionBind?.variableId === variableId
              ? undefined
              : iter.assumptionBind
        })
      })
      store.dispatch('assumptionVar/updateBlockVariableWithDBSync', treeData)
    }
  })
}

const hanldeEnter = (scope: any, curr: any) => {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  const flag = reg.test(scope.column.label)
  store.commit('assumptionVar/addSectionDisabled', flag)
  if (!flag || !scope.column.label) {
    ElMessage({
      message: '名称格式错误！',
      type: 'error'
    })
    return false
  }
  const labels = S.map((item: any) => item.label)
  labels[scope.$index] = scope.column.label
  const labelsSet = new Set(labels)
  const labelsFlag = labelsSet.size === labels.length
  if (!labelsFlag) {
    ElMessage({
      message: '名称重复！',
      type: 'error'
    })
    return false
  }
  // store.commit('assumptionVar/addSectionDisabled', flag)
  const timestamp = (new Date()).valueOf()
  const U = {
    label: scope.column.label,
    value: curr.value ? curr.value : `${VariableSectionlimiterHeader}${VariableSectionlimiter}${timestamp}`,
    pageId: props.currFile.value.id,
    status: true,
    id: curr.id,
    modelId: props.currFile.value.modelId,
    sort: curr.sort ? curr.sort : timestamp
  }
  emit('createSection', U, () => renderTableData())
}

const renderTableData = () => {
  const timestamp = (new Date()).valueOf()
  initColumnSection.pageId = props.currFile.value.id
  initColumnSection.sort = timestamp
  const flag = S.length > 1 || !!S[0]?.id
  !flag && emit('createSection', initColumnSection)
  S.forEach((element: any) => {
    element.isEdit = !element.id
  })
}

const hanldeVariableField = (data: any) => {
  const obj = {
    form: {},
    treeIds: []
  }
  const sKey = []
  const sVal = []
  for (const i in data.row) {
    if (i === '') {
      delete data.row[i]
    }
    const str = i.split(VariableSectionlimiter)[0]
    if (str === VariableSectionlimiterHeader) {
      sKey.push(i)
      sVal.push(data.row[i])
    }
  }
  data.row.sectionKey = sKey.join(ArrayToString)
  data.row.sectionVal = sVal.join(ArrayToString)
  obj.form = data.row
  obj.treeIds = data.row.source.split(ArrayToString)
  emit('createVariable', obj)
}

const renderSectionData = () => {
  V.forEach((item: any) => {
    const sKey = item?.sectionKey?.split(ArrayToString) ?? []
    const sVal = item?.sectionVal?.split(ArrayToString) ?? []
    sKey.forEach((iter: any, index: any) => {
      item[iter] = item.type === 'number' ? sVal[index] * 1 : sVal[index]
    })
  })
}

const objectSpanMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  const length = V.length
  const length1 = S.length
  if (columnIndex === length) {
    if (rowIndex % 2 === 0) {
      return {
        rowspan: length1,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}

const hanldeCopy = (data: any, curr: any, num: number) => {
  const timestamp: number = (new Date()).valueOf()
  if (num) {
    copyRow(data, curr, timestamp)
  } else {
    copyColumn(data, curr, timestamp)
  }
}

function copyColumn(data: any, curr: any, timestamp: number) {
  const variables = V.map((item: any) => item[data.column.property])
  const currentCopySection = {
    label: curr.label,
    value: `${VariableSectionlimiterHeader}${VariableSectionlimiter}${timestamp}`,
    isEdit: true,
    status: true,
    width: tableColumnWidth,
    $index: data.$index,
    variables: variables
  }
  store.commit('assumptionVar/setCurrentCopySection', currentCopySection)
}

function copyRow(data: any, curr: any, timestamp: number) {
  const currentCopyVariable = {
    sectionKey: data.row.sectionKey,
    sectionVal: data.row.sectionVal,
    type: data.row.type
  }
  store.commit('assumptionVar/setCurrentCopyVariable', currentCopyVariable)
}

const hanldeStick = (data: any, curr: any, num: number) => {
  if (!num) {
    stickData(curr)
  } else {
    const currentCopyVariable = store.state.assumptionVar.currentCopyVariable
    emit('createVariable', {
      form: {
        ...data.row,
        sectionKey: currentCopyVariable.sectionKey,
        sectionVal: currentCopyVariable.sectionVal,
        type: currentCopyVariable.type
      },
      treeIds: []
    }, () => renderSectionData())
  }
}

const insertForward = (data: any, curr: any) => {
  insertData(data, 0)
}

const insertBackward = (data: any, curr: any) => {
  insertData(data, 1)
}

// 行拖拽
function rowDrop() {
  const tbody: HTMLElement | null = document.querySelector('.el-table__body-wrapper tbody')
  if (!tbody) return
  rowDropSort = Sortable.create(tbody, {
    group: { name: 'variable', pull: false, put: false },
    animation: 180,
    direction: 'horizontal',
    onEnd: (evt: CustomEvent) => {
      const oldSection = JSON.parse(JSON.stringify(V[evt.oldIndex]))
      const newSection = JSON.parse(JSON.stringify(V[evt.newIndex]))
      const temporary = oldSection.sort
      oldSection.sort = newSection.sort
      newSection.sort = temporary
      store.dispatch('assumptionVar/updateVariablesWithDBSync', [oldSection, newSection])
    }
  })
}

function columnDrop() {
  const wrapperTr: HTMLElement | null = document.querySelector('.el-table__header-wrapper tr')
  if (!wrapperTr) return
  columnDropSort = Sortable.create(wrapperTr, {
    group: { name: 'section', pull: false, put: false },
    animation: 180,
    filter: '.disabled',
    onEnd: (evt: CustomEvent) => {
      const oldItem = S[evt.oldIndex]
      S.splice(evt.oldIndex, 1)
      S.splice(evt.newIndex, 0, oldItem)
      const oldSection = JSON.parse(JSON.stringify(S[evt.oldIndex]))
      const newSection = JSON.parse(JSON.stringify(S[evt.newIndex]))
      const temporary = oldSection.sort
      oldSection.sort = newSection.sort
      newSection.sort = temporary
      store.dispatch('assumptionVar/updateSectionsWithDBSync', [oldSection, newSection])
    }
  })
}

async function initData() {
  const param = props.currFile.value
  if (param?.modelId && param?.id) {
    await store.dispatch('assumptionVar/rollBackAssumptionVarVariableName', param)
    renderSectionData()
    await store.dispatch('assumptionVar/rollBackAssumptionVarSectionName', param)
    renderTableData()
  } else {
    V.length = 0
    S.length = 1
  }
}

onMounted(() => {
  rowDrop()
  columnDrop()
})

watch(props, () => initData(), { deep: true })

// watch(() => S, _ => {
//   const findIndexSection = _.findIndex((s:any) => s.isEdit)
//   if (findIndexSection !== -1) (findIndex = findIndexSection)
// }, { deep: true })

// watch(() => route.path, (path) => path === '/assumption')

const addSectionScroll = () => {
  setTimeout(() => {
    const tableElement: any = tableDom.value
    // const tableCell = document.getElementsByClassName('el-table__cell')[0] as HTMLElement
    // const tableHeight = document.getElementsByClassName('el-table__header')[0] as HTMLElement
    // if (!currentNodeElement) return
    // tableElement.setScrollLeft(tableCell.offsetWidth * (findIndex - 1) - tableHeight.offsetHeight / 2)
    const currentNodeElement = document.getElementsByClassName('el-table__body')[0] as HTMLElement
    if (!currentNodeElement) return
    tableElement.setScrollLeft(currentNodeElement.offsetWidth)
  }, 200)
}

defineExpose({ addSectionScroll })
</script>
<style lang="scss" scoped>
@import "../scss/VariableTable.scss";
</style>
<style lang="scss">
.table-box {
  thead {
    tr {
      th {
        border-bottom: 1px solid #d0d0d0 !important;
      }
    }
  }
}
</style>
