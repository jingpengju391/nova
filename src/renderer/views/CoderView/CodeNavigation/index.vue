<template>
  <div id="top-box" class="top-box">
    <!-- <h5>编码</h5> -->
    <el-tabs
      :model-value="currentFormulaItem.id"
      class="tabs"
      type="border-card"
      @tab-click="onTabClick"
    >
      <el-tab-pane
        class="tab-pane"
        v-for="item in openedFormulaItems"
        :key="item.id"
        :name="item.id"
      >
        <template #label>
          <div class="tabs-pane-title">
            <el-tooltip
              placement="top-start"
              :show-arrow="false"
              :content="item.name"
              :show-after="800"
            >
              <span>{{ item.name }}</span>
            </el-tooltip>
            <div class="icon-containers">
              <el-icon class="icon close-icon" @click.stop="onCloseTab(item)"
                ><close
              /></el-icon>
              <i v-show="item.unsaved" class="icon not-saved-icon" />
            </div>
          </div>
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-popover
      placement="bottom"
      :width="500"
    >
      <template #reference>
        <el-button type="text" class="more-btn" icon="more" />
      </template>
      <el-scrollbar
        class="more-menu"
        :max-height="200"
        @click.capture.stop.prevent="onMoreMenuClicked"
      >
        <more-menu-Item
          v-for="item in moreMenus"
          :key="item.id"
          :menuItem="item"
        />
      </el-scrollbar>
    </el-popover>
  </div>
  <el-breadcrumb class="breadcrumb" separator-class="arrow-right">
    <el-breadcrumb-item
      v-for="item in currentFormulaItem.breadcrumb"
      :key="item"
      >{{ item }}</el-breadcrumb-item>
  </el-breadcrumb>
  <component
    v-show="!hideFormula"
    :is="componentId"
    :ref="currentFormulaItem.name"
    :formulaItem="currentFormulaItem"
  ></component>
  <no-formula v-show="hideFormula" />
  <div class="dialog-box">
    <el-dialog
      width="460px"
      :model-value="closeUnsavedEditorDialogVisible"
      title="公式未保存"
      destroy-on-close
      @close="UNSavedFormulas.length = 0"
    >
      {{ dialog.content }}
      <template #footer>
        <div :class="dialog.buttons.length === 3 ? 'flex-end' : ''">
          <el-button
            v-for="item in dialog.buttons"
            :key="item.label"
            :type="item.type"
            @click="item.onClick()"
          >
            {{ item.label }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup name="CodeNavigation">
import { reactive, computed, watch, onMounted } from 'vue'
import { useStore, createNamespacedHelpers } from 'vuex'
import { useRoute } from 'vue-router'
import CodeFormula from './CodeFormula.vue'
import CodeIndexFormula from './CodeIndexFormula.vue'
import DiffCenter from '@/views/PrivateDeployment/DiffCenter/index.vue'
import NoFormula from './NoFormula.vue'
import type { FormulaTabItem } from '@shared/dataModelTypes'
import eventBus, { SaveCurrentFormulaChannel } from '../eventBus'
import MoreMenuItem from './MoreMenuItem.vue'
import { CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'
import { clone } from '@shared/functional'
import { getCodeIndexNavigationNodeIdAndType } from '@/utils'
import {
  unSavedFormulas, handlerTabClick, handlerTabClose,
  directClose, cancel, saveAfterClose, saveAllAfterClose,
  saveAll, DirectCloseContent, DirectCloseAllContent, SaveAllContent, directCloseAll,
  popoverVisible
} from '../config'
import { ElTabs } from 'element-plus'
const store = useStore()
const route = useRoute()

const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)

const openedFormulaItems = computed<FormulaTabItem[]>(() => store.state.models.openedFormulaItems)
const hideFormula = computed(() => {
  if (!currentFormulaItem.value?.hasCalcFormula) {
    if (route.path !== '/product') {
      return currentFormulaItem.value?.breadcrumb.at(-1) !== 'productFormulas'
    } else {
      return true
    }
  }
  return false
})

const moreMenus: never[] | any = computed(() => {
  return [
    { name: 'Save all', id: 'Save all', flex: 'top', fn: 'onSaveAllTab', shortcut: 'Ctrl + Shift + S' },
    ...openedFormulaItems.value,
    { name: 'Close all', id: 'Close all', flex: 'bottom', fn: 'onCloseAllTab' }
  ]
})

const componentId = computed(() => {
  if (currentFormulaItem.value.propertyType === CodeIndexNavigationNodeType.codeIndex) {
    return CodeIndexFormula
  }
  return currentFormulaItem.value.original && currentFormulaItem.value.original.length > 0 ? DiffCenter : CodeFormula
})

const closeUnsavedEditorDialogVisible = computed(() => !!unSavedFormulas.length)

const dialog: any = computed(() => {
  const name = currentHandler?.value?.name ?? ''
  switch (name) {
    case 'Save all':
      return {
        content: SaveAllContent,
        buttons: [cancel, saveAll]
      }
    case 'Close all':
      return {
        content: DirectCloseAllContent,
        buttons: [directCloseAll, cancel, saveAllAfterClose]
      }
    default:
      return {
        content: DirectCloseContent,
        buttons: [directClose, cancel, saveAfterClose]
      }
  }
})

const currentHandler: any = reactive({})
const UNSavedFormulas = unSavedFormulas
const onTabClick = (tab: typeof ElTabs) => handlerTabClick(tab)
const onCloseTab = (tab: FormulaTabItem) => {
  currentHandler.value = {
    name: ''
  }
  handlerTabClose([tab])
}

const onMoreMenuClicked = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const clickedItemName = target.innerText
  const index = openedFormulaItems.value.findIndex((formula: FormulaTabItem) => formula.name === clickedItemName)
  if (index !== -1) {
    const tab: typeof ElTabs | any = { index: index }
    handlerTabClick(tab)
  } else {
    currentHandler.value = moreMenus.value.find((item: any) => item.name === clickedItemName)
    if (clickedItemName === 'Save all') {
      unSavedFormulas.push(...openedFormulaItems.value.filter((FormulaTabItem: FormulaTabItem) => FormulaTabItem.unsaved))
    } else {
      handlerTabClose(openedFormulaItems.value)
    }
  }
}

watch(() => openedFormulaItems.value, newVlaue => {
  if (
    !currentFormulaItem ||
    !currentFormulaItem.value ||
    !currentFormulaItem.value.name ||
    !openedFormulaItems.value.length ||
    !openedFormulaItems.value[0]
  ) return
  const currentFormulaItemFind = newVlaue.find((formula: FormulaTabItem) => formula.id === currentFormulaItem.value.id)
  currentFormulaItemFind && store.commit('models/updateCurrentFormulaItem', currentFormulaItemFind)
}, { deep: true })
// watch(() => currentFormulaItem.value, (newVlaue) => {
//   console.log('currentFormulaItem', currentFormulaItem.value)
// }, { deep: true })

</script>
<style lang="scss" scoped>
@import "../scss/code-navigation.scss";
</style>
<style lang="scss">
.dialog-box .el-dialog__body {
  overflow: visible;
}
.more-menu-item span[data-v-c8a5f79e] {
  white-space: none;
  overflow: inherit;
  text-overflow: inherit;
}
h5{
  line-height: 40px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding-left: 10px;
  font-size: 16px;
}
</style>
