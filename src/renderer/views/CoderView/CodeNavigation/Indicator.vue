<template>
  <div class="indicator-con" ref="indicatorCon">
    <el-table
      class="indicator-table"
      ref="indicatorTableRef"
      :data="indicatorData"
      stripe
      highlight-current-row
      row-key="id"
      :current-row-key="currentRowKey"
      :expand-row-keys="expandRowKeys"
      @row-click="selectCurrentFormulas"
      @row-contextmenu="onRightClickMenu"
      :max-height="contentHeight"
    >
      <el-table-column type="expand" show-overflow-tooltip>
        <template #default="props">
          <div style="height:15px"></div>
          <code-indicator
            :content="props.row.codeIndexExpression || ''"
            :index="props.$index"
          >
          </code-indicator>
        </template>
      </el-table-column>
      <el-table-column prop="name" show-overflow-tooltip>
        <template #default="scope">
          <el-badge
            is-dot
            :hidden="!scope.row.unsaved"
            @click="switchProductFormulas(scope.$index)"
            >{{ scope.row.codeIndexExpression || "Indicator" }}</el-badge
          >
        </template>
      </el-table-column>
      <el-table-column align="right">
        <template #header>
          <icon-button
            class="tool-bar-item"
            tooltip="新建Indicator"
            icon-class="folder-add"
            @click="add"
          ></icon-button>
        </template>
        <template #default="scope">
          <icon-button
            class="tool-bar-item"
            tooltip="展开/合并"
            icon-class="sort"
            @click="switchProductFormulas(scope.$index)"
          ></icon-button>
          <icon-button
            class="tool-bar-item"
            tooltip="删除Indicator"
            icon-class="delete"
            @click="del(scope.row)"
          ></icon-button>
        </template>
      </el-table-column>
    </el-table>
    <indicator-dialog />
  </div>
</template>
<script setup lang="ts" name="Indicator">
import { ref, onMounted, nextTick, computed, watch, getCurrentInstance } from 'vue'

import { useStore } from 'vuex'
import {
  expandRowKeys, currentRowKey, indicatorData, addProductFormula,
  deleteProductFormula, switchProductFormulas, switchCurrentRowKey,
  dialogVisible, handleProductFormulas, handleOperation
} from '../config'
import type { ComplexProductFormula } from '@shared/dataModelTypes/product/products'
import { ElTable, ElTableColumn } from 'element-plus'
import IconButton from '@/views/components/IconButton.vue'
import type { FormulaTabItem } from '@shared/dataModelTypes'
import ElementResizeDetectorMaker from 'element-resize-detector'
import CodeIndicator from './CodeIndicator.vue'
import IndicatorDialog from './IndicatorDialog.vue'
const { proxy }: any = getCurrentInstance()
const store = useStore()
const indicatorCon = ref<HTMLElement>()
const contentHeight = ref<number>(0)
const indicatorTableRef = ref<InstanceType<typeof ElTable>>()
const currentFormulaItem = computed<FormulaTabItem>(() => store.state.models.currentFormulaItem)
const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(indicatorCon.value as HTMLElement, (element: HTMLElement) => {
    contentHeight.value = element.offsetHeight
  })
}

onMounted(() => nextTick(() => initData()))

function selectCurrentFormulas(row: ComplexProductFormula) {
  if (!currentFormulaItem.value.isCodeIndex) return
  store.commit('models/updateFormulaItemContentByFormulaIndex', row.id)
  switchCurrentRowKey(row.id)
  currentFormulaItem.value.productFormulas && handleProductFormulas(currentFormulaItem.value.productFormulas[row.id])
}

function initData() {
  const formulasIndex = currentFormulaItem.value?.formulasIndex
  onHeight()
  formulasIndex !== -1 &&
    indicatorData.value.length > 0 &&
    (formulasIndex || formulasIndex === 0) &&
    selectCurrentFormulas(indicatorData.value[formulasIndex])
}

const onRightClickMenu = (row: ComplexProductFormula, column: typeof ElTableColumn, event: MouseEvent) => {
  const menuItems = [
    {
      title: '新建',
      shortCut: 'Ctrl+n',
      onClick: () => add()
    },
    // {
    //   title: '编辑',
    //   shortCut: 'Ctrl+s',
    //   onClick: () => upd(row)
    // },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => del(row)
    }
  ]
  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
}

function add() {
  handleOperation()
  handleProductFormulas()
  addProductFormula()
}

function del(row: ComplexProductFormula) {
  handleOperation(2)
  selectCurrentFormulas(row)
  nextTick(() => (dialogVisible.value = true))
}

function upd(row: ComplexProductFormula) {
  handleOperation(1)
  selectCurrentFormulas(row)
  nextTick(() => (dialogVisible.value = true))
}

</script>
<style>
.indicator-con .el-table .cell {
  overflow: hidden;
}
</style>
<style lang="scss" scoped>
.indicator-con {
  width: 100%;
  height: 100%;
  .indicator-table {
    width: 100%;
  }
  .not-saved-icon::after {
    display: block;
    content: "";
    position: absolute;
    right: -15px;
    top: 0;
    bottom: 0;
    margin: auto;
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background: tomato;
  }
  &:deep(.el-table__expand-column .cell) {
    display: none;
  }
  &:deep(.el-scrollbar__bar.is-vertical) {
    width: 10px;
  }
}
</style>
