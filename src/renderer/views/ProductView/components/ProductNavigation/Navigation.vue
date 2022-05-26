<template>
  <div class="master-box" ref="masterRef">
    <el-scrollbar ref="scrollRef" class="scrollbar-box" :height="height">
      <el-tree
        class="master-navigation"
        ref="masterNaviTree"
        :data="masterNavigationTree"
        node-key="nodeKey"
        :props="defaultProps"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        empty-text="无匹配结果"
        :check-on-click-node="false"
        :highlight-current="true"
        :renderContent="renderTreeNode"
        :current-node-key="currentNodeKey"
        @node-contextmenu="onRightClickMasterNaviNode"
        @node-click="onClickMasterNaviNode"
      >
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup name="ProductNavigation">
import { ref, onMounted, nextTick, watch, computed, getCurrentInstance } from 'vue'
import { ProductInterface, SimplifiedProduct, Product } from '@shared/dataModelTypes/product/products'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { renderTreeNode, filterText, getMasterNaviNodeContextMenuItems, getProductNaviNodeContextMenuItems, getDistanceOfScrollToTopByTarget } from '../../config'
import { useStore } from 'vuex'
import { ElTree, ElScrollbar } from 'element-plus'
import type { ContextMenuItemProps } from '@/views/components/ContextMenu/types'
import { getMasterNavigationNodeIdAndType, MasterNodeType } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { onCodeIndexSelected } from '@/views/CoderView/config'
import modelsDataSource from '@/store/modules/modelsDataSource'
const store = useStore()
const defaultProps = {
  children: 'children',
  label: 'name'
}
// data source navigation
const masterNaviTree = ref<typeof ElTree>()
const currentNodeKey = computed(() => {
  const id = store.state.masters.currentMasterNode?.nodeKey ?? ''
  id && masterNaviTree.value && masterNaviTree.value.setCurrentKey(id)
  return id
})
const masterNavigationTree = computed(() => store.state.masters.masterNavigationTree)
// dynamic scroll height
const masterRef = ref<HTMLElement>()
const height = ref<number>(0)
const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(masterRef.value as HTMLElement, (element: HTMLElement) => {
    height.value = element.offsetHeight
  })
}

// scroll
const scrollRef = ref<typeof ElScrollbar>()
const currentMasterNode = computed(() => store.state.masters.currentMasterNode)
watch(() => currentMasterNode.value, _ => nextTick(() => {
  const currentClassName = 'el-tree-node is-current is-focusable'
  const parentClassName = 'master-box'
  const position = getDistanceOfScrollToTopByTarget(currentClassName, parentClassName)
  position && scrollRef.value!.setScrollTop(position)
}))

// filter data source navigation
watch(filterText, newValue => masterNaviTree.value!.filter(newValue))
const filterNode = (value: string, data: Partial<ProductInterface>) => {
  if (!value) return true
  return data.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1
}

// init
onMounted(() => nextTick(() => initData()))
const initData = () => {
  onHeight()
}

// contextmenu
const { proxy }: any = getCurrentInstance()
const onRightClickMasterNaviNode = (event: MouseEvent, node: SimplifiedProduct | Product) => {
  const { type, id } = getMasterNavigationNodeIdAndType(node.id)
  if (id === 0 || (type !== MasterNodeType.master && type !== MasterNodeType.product)) return
  let menuItems: ContextMenuItemProps[]
  if (type === MasterNodeType.master) {
    menuItems = getMasterNaviNodeContextMenuItems(node.id, node)
  } else {
    menuItems = getProductNaviNodeContextMenuItems(node.id, node as Product)
  }
  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
  onClickMasterNaviNode(node)
}

// update currentMasterNode
const onClickMasterNaviNode = async (masterNode:SimplifiedProduct | Product) => {
  const { type, id } = getMasterNavigationNodeIdAndType(masterNode.id)
  if (id === 0) return
  store.commit('masters/updateCurrentMasterNode', masterNode)
  store.commit('models/clearCurrentProperty')
  store.commit('models/clearCurrentModelNode')
  if (type === MasterNodeType.codeIndex) {
    const { type, id } = getMasterNavigationNodeIdAndType(masterNode.modelId)
    await store.dispatch('codeIndex/queryCodeIndexesByModelIdFromDB', id)
    const completeModelBlock = modelsDataSource.getCompleteModelBlock(id)
    const codeIndex = store.state.codeIndex.codeIndexes
      .find(codeIndex => MasterNodeType.codeIndex + NaviNodeIdDelimiter + codeIndex.id === masterNode.id)
    onCodeIndexSelected(codeIndex, completeModelBlock)
  } else if (type === MasterNodeType.models) {
    store.commit('codeIndex/clearCurrentCodeIndex')
    store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
      id: masterNode.id
    })
  }
}

</script>
<style scoped lang="scss">
@import "../../scss/master-navigation.scss";
</style>
