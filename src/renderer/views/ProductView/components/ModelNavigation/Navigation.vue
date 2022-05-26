<template>
  <div class="model-box" ref="modelRef">
    <el-scrollbar ref="scrollRef" class="scrollbar-box" :height="height">
      <el-tree
        class="model-navigation"
        ref="modelNaviTree"
        :data="modelNavigationTree"
        node-key="id"
        :props="defaultProps"
        :expand-on-click-node="false"
        :filter-node-method="filterNode"
        empty-text="无匹配结果"
        :check-on-click-node="false"
        :highlight-current="true"
        :renderContent="renderModelTreeNode"
        :current-node-key="currentNodeKey"
        @node-click="onClickModelNaviNode"
      >
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup name="ProductNavigation">
import { ref, onMounted, nextTick, watch, computed, getCurrentInstance } from 'vue'
import { ProductInterface, SimplifiedProduct, Product } from '@shared/dataModelTypes/product/products'
import ToolBar from './ToolBar.vue'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { renderModelTreeNode, modelFilterText, getModelNaviNodeContextMenuItems, getMaskNaviNodeContextMenuItems, getBlockNaviNodeContextMenuItems, getChildBlockNaviNodeContextMenuItems } from '../../config'
import { useStore } from 'vuex'
import { ElTree } from 'element-plus'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import type { ContextMenuItemProps } from '@/views/components/ContextMenu/types'
import { getModelNavigationNodeIdAndType, MasterNodeType } from '@/utils'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { ModelNavigationNode, ModelNavigationNodeType, NaviNodeIdDelimiter, ModelNavigationTree } from '@shared/dataModelTypes/models/models'
const store = useStore()
const defaultProps = {
  children: 'children',
  label: 'name'
}
// data source navigation  model
const modelNaviTree = ref<typeof ElTree>()
const currentNodeKey = computed(() => {
  const currentModelNode = store.state.models.currentModelNode
  if (!currentModelNode) {
    modelNaviTree.value && modelNaviTree.value.setCurrentKey(null)
    return
  }
  const NodeType = currentModelNode.modelId ? ModelNavigationNodeType.modelBlocks : ModelNavigationNodeType.models
  modelNaviTree.value && modelNaviTree.value.setCurrentKey(NodeType + NaviNodeIdDelimiter + currentModelNode.id)
  return currentModelNode.id
})
const modelNavigationTree = computed(() => store.getters['masters/getterModelNavigationTree'])
// dynamic scroll height
const modelRef = ref<HTMLElement>()
const height = ref<number>(0)
const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(modelRef.value as HTMLElement, (element: HTMLElement) => {
    height.value = element.offsetHeight
  })
}

// filter data source navigation
watch(modelFilterText, newValue => modelNaviTree.value && modelNaviTree.value.filter(newValue))
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
// const { proxy }: any = getCurrentInstance()
// const onRightClickModelNaviNode = (event: MouseEvent, node: SimplifiedProduct | Product) => {
//   let menuItems: ContextMenuItemProps[]
//   const { id, type } = getModelNavigationNodeIdAndType(node.id)
//   if (type === ModelNavigationNodeType.models) {
//     menuItems = getModelNaviNodeContextMenuItems(id, node)
//   } else {
//     const modelBlockType = modelsDataSource.getModelBlockType(id)
//     switch (modelBlockType) {
//       case ModelBlockType.masks:
//         menuItems = getMaskNaviNodeContextMenuItems(id, node)
//         break
//       case ModelBlockType.blocks:
//         menuItems = getBlockNaviNodeContextMenuItems(id, node)
//         break
//       default:
//         menuItems = getChildBlockNaviNodeContextMenuItems(id, node)
//     }
//   }
//   proxy.$contextMenu({
//     screenPosition: { x: event.clientX, y: event.clientY },
//     menuItems
//   })
// }

// update currentMasterNode
const onClickModelNaviNode = (modelNaviNode: ModelNavigationNode) => {
  store.commit('models/updateCurrentModelNodeWithModelNaviNode', modelNaviNode)
}

</script>
<style scoped lang="scss">
@import "../../scss/model-navigation.scss";
</style>
