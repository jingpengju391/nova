<template>
  <div class="property-navi">
    <tool-bar
      :filterMenuItems="filterMenuItems"
      @left-buttons-click="onLeftButtonsClicked"
    />
    <div class="filter-box">
      <el-input
        v-model="filterText"
        class="filter-input"
        prefix-icon="search"
        placeholder="输入关键字过滤"
      />
      <el-input
        v-model="filterClassifyName"
        class="filter-input"
        prefix-icon="search"
        placeholder="输入分类名称过滤"
      />
    </div>
    <!-- swallows -->
    <el-table
      row-key="id"
      ref="indicatorTable"
      class="sl-menu-table"
      :height="tableHeight"
      :data="loadData"
      highlight-current-row
      row-class-name="indicator-row"
      header-cell-class-name="indicator-column"
      @row-click="(e) => onCodeIndexSelected(e)"
      @row-contextmenu="onCodeIndexRightClick"
      border
    >
      <el-table-column
        sortable
        v-for="item in tableColumnItems"
        :key="item.title"
        :fixed="item.tableColumnProp === 'name'"
        :prop="item.tableColumnProp"
        :label="item.title"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span class="row-box">
            <el-icon v-if="item.tableColumnProp === 'name'"
              ><paperclip
            /></el-icon>
            {{
              scope.row[item.tableColumnProp] ||
              (item.tableColumnProp === "name"
                ? "NEW CODEINDEX (UNSAVED)"
                : "--")
            }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang=ts name="Indicator">
import { computed, watch, reactive, ref, nextTick, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'
import { ElTable, ElMessageBox } from 'element-plus'
import ToolBar from './IndicatorToolBar.vue'
import { CodeIndex, CodeTransformation } from '@shared/dataModelTypes/product/indicators'
import {
  onLeftButtonsClicked, filterText, filterClassifyName,
  loadData, onCodeIndexSelected, Created, Delete, Copy, Stick
} from '../config'
import useWindowWidthAndHeight from '../../composables/useWindowWidthAndHeight'
const store = useStore()
const { proxy }: any = getCurrentInstance()
const { windowHeight } = useWindowWidthAndHeight()
const tableHeight = computed(() => windowHeight.value - 36 - 4 - 30 - 52 - 26)
const currentCodeIndex = computed(() => store.state.codeIndex.currentCodeIndex)
const codeIndexes = computed(() => store.state.codeIndex.codeIndexes)
const currentCopy = computed(() => store.state.codeIndex.currentCopy)
const indicatorTable = ref<InstanceType<typeof ElTable>>()
const filterMenuItems = reactive([
  { tableColumnProp: 'name', tableColumnWidth: '', title: '名称', isDefault: true, checked: true },
  { tableColumnProp: 'updatedAt', tableColumnWidth: '120', title: '修改时间', isDefault: true, checked: true },
  { tableColumnProp: 'creator', tableColumnWidth: '100', title: '创建作者', isDefault: false, checked: false },
  { tableColumnProp: 'creator', tableColumnWidth: '120', title: '最后修改作者', isDefault: false, checked: false },
  { tableColumnProp: 'classify', tableColumnWidth: '100', title: '分类', isDefault: false, checked: false }
])

const tableColumnItems = computed(() => filterMenuItems.filter(item => item.checked))

const onCodeIndexRightClick = (CodeTransformation: CodeTransformation, column: any, event: MouseEvent) => {
  const codeIndex = codeIndexes.value.find((codeIndex: CodeIndex) => codeIndex.id === CodeTransformation.id)
  const menuItems = [
    {
      title: '新建',
      shortCut: 'Ctrl+n',
      onClick: () => Created()
    },
    {
      title: '复制',
      shortCut: 'Ctrl+c',
      onClick: () => Copy(codeIndex)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        if (codeIndex.id) {
          ElMessageBox.confirm(`确定要删除CodeIndex ${codeIndex.name}?`, '提示')
            .then(() => Delete(codeIndex))
        } else {
          Delete(codeIndex)
        }
      }
    }
  ]

  if (currentCopy.value) {
    const stick = {
      title: '粘贴',
      shortCut: 'Ctrl+v',
      onClick: () => Stick()
    }
    menuItems.splice(2, 0, stick)
  }

  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
}

watch(() => store.state.models.currentModelNode, (newValue) => {
  if (newValue && !newValue.modelId) {
    store.dispatch('codeIndex/queryCodeIndexesByModelIdFromDB', newValue.id)
  }
}, { deep: true, immediate: true })

watch(() => currentCodeIndex.value, (newValue) => {
  const table = indicatorTable.value as InstanceType<typeof ElTable>
  nextTick(() => {
    if (!newValue) return
    const currentRow = table.data.find(row => row.id === newValue.id)
    if (!currentRow) return
    table.setCurrentRow(currentRow)
    nextTick(() => {
      const currentRowClassName = 'el-table__row current-row indicator-row'
      const tableWrapperClassName = 'el-table__body-wrapper is-scrolling-none'
      const currentRowElement = document.getElementsByClassName(currentRowClassName)[0] as HTMLElement
      const tableWrapperElement = document.getElementsByClassName(tableWrapperClassName)[0] as HTMLElement
      if (tableWrapperElement && currentRowElement) {
        const yDiff = currentRowElement.getBoundingClientRect().y - tableWrapperElement.getBoundingClientRect().y
        if (yDiff > tableWrapperElement.getBoundingClientRect().height) {
          tableWrapperElement.scrollTop = tableWrapperElement.scrollTop + yDiff
        }
      }
    })
  })
}, { deep: true })

</script>
<style lang="scss" scoped>
@import "../scss/property-navi.scss";
</style>
