<template>
  <el-input
    class="filter-input"
    prefix-icon="search"
    placeholder="输入关键字过滤"
    v-model="filterText"
    maxlength="inputNameLength"
  />
  <el-tree
    ref="variablesTree"
    class="output-box"
    :data="modelNavigationTree"
    node-key="nodecurrentKey"
    :allow-drop="allowDrop"
    draggable
    :props="defaultProps"
    default-expand-all
    :highlight-current="true"
    :check-on-click-node="false"
    :filter-node-method="filterNode"
    empty-text="无匹配结果"
    :expand-on-click-node="false"
    @node-contextmenu="hanldeNode"
    @current-change="handleCurrentChange"
  >
    <template #default="{ node, data }">
      <span class="mask-block-node">
        <span v-if="node.data.status">
          <el-icon><fold /></el-icon>
          <el-input
            class="node-input"
            v-focus
            v-model="node.data.name"
            placeholder="请输入内容"
            @blur="hanldeEnter(data)"
            @keyup.enter="$event.target.blur()"
          >
          </el-input>
        </span>
        <span v-if="!node.data.status" class="title">
          <el-icon class="icon"><document /></el-icon>
          {{ node.data.name }}
        </span>
        <icon-button
          v-if="!node.data.status && !node.data.child"
          @click.stop="handleAddNode(node)"
          tooltip="新建假设"
          icon-class="folder-opened"
        />
      </span>
    </template>
  </el-tree>
</template>
<script lang=ts setup name="variables">
import { watch, computed, getCurrentInstance, ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { navigationTree, modelFile } from '../types'
import type { ModelBlock, SimplifiedModelBlock, SimplifiedModel } from '@shared/dataModelTypes'
import { ValidationName, ModelNodeType } from '@/utils'
import IconButton from '@/views/components/IconButton.vue'
import { ElMessage } from 'element-plus'
import { ModelNavigationNode, ModelNavigationNodeType, NaviNodeIdDelimiter, ModelNavigationTree } from '@shared/dataModelTypes/models/models'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { defaultProps } from '../config'
import { getModelNavigationNodeIdAndType } from '../../../utils'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { inputNameLength } from '@shared/commonUtils'

import type Node from 'element-plus/es/components/tree/src/model/node'
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode'
import type { DropType } from 'element-plus/es/components/tree/src/tree.type'

const emit = defineEmits(['hanldeChangeNode'])
const router = useRouter()
const store = useStore()
const T = store.getters['models/gettersModelNavigationTree']

const variablesTree = ref<null | HTMLElementAny>(null)
const { proxy }: any = getCurrentInstance()

const currentAssumptionModelNode = computed(() => store.state.assumptionVar.currentAssumptionModelNode)

const filterText = ref('')

let currentTreeNode: any = {}
let temporaryName = {}
let currentTreeNodeIndex = 0

const allowDrop = (draggingNode: Node, dropNode: Node, type: DropType) => {
  if (draggingNode.level === dropNode.level) {
    if ((!draggingNode.parent && !dropNode.parent) || draggingNode.parent.id === dropNode.parent.id) {
      return type === 'prev' || type === 'next'
    } else {
      return false
    }
  } else {
    return false
  }
}

const modelNavigationTree: any = computed(() => {
  const R: navigationTree[] = []
  const F = store.getters['assumptionVar/pages']
  T.forEach((item: any) => {
    R.push({
      // id: 'model-' + item.id.split(NaviNodeIdDelimiter)[1],
      id: item.id.split(NaviNodeIdDelimiter)[1],
      name: item.name,
      type: item.id.split(NaviNodeIdDelimiter)[0],
      children: [],
      nodecurrentKey: item.id
    })
  })
  R.forEach((item: any) => {
    const idInt = item.id * 1
    F.forEach((iter: any) => {
      if (idInt === iter.modelId) {
        iter.nodecurrentKey = iter.modelId + '-' + iter.id
        item.children.push(iter)
      }
    })
  })
  return R
})

const currentNodeKey = ['0', 'children', '0']

// 当前节点选择状态发生改变
const handleCurrentChange = (node: modelFile, nodeCurr?: any) => {
  if (nodeCurr) {
    store.commit('assumptionVar/updateCurrentAssumptionModelNode', nodeCurr)
    if (node.child) {
      emit('hanldeChangeNode', node)
    }
    // nodeCurr.isCurrent = !!node.modelId
    // currentTreeNode = node?.modelId ? node : currentTreeNode
    // currentTreeNode.id && variablesTree.value && variablesTree.value.setCurrentNode(currentTreeNode)
    // emit('hanldeChangeNode', currentTreeNode)
  } else {
    if (node) {
      const nodes = currentAssumptionModelNode?.value?.data || node
      nodes.id && variablesTree.value && variablesTree.value.setCurrentNode(nodes)
      emit('hanldeChangeNode', nodes)
    }
  }
}
// 当前节点数量发生改变
const currentLengthChange = (data: modelFile, num: number) => {
  const currentNode = variablesTree.value && variablesTree.value.getCurrentNode()
  const currentChildren = modelNavigationTree.value.filter((item: any) => item.id * 1 === data.modelId)[0].children
  if (currentChildren.length) {
    if (currentNode) {
      const currentNodeOld = currentChildren.filter((item: any) => item.id === currentNode.id)[0]
      if (!currentNodeOld) {
        currentChildren.forEach((iter: any, index: number) => {
          if (iter.name === data.name) currentTreeNodeIndex = index
          // const currentNodeNew = currentChildren[currentTreeNodeIndex - 1] || currentChildren[currentTreeNodeIndex]
          const currentNodeNew = currentChildren[currentTreeNodeIndex] || currentChildren[currentTreeNodeIndex - 1]

          variablesTree.value && variablesTree.value.setCurrentNode(currentNodeNew)
          emit('hanldeChangeNode', currentNodeNew)
        })
      } else {
        variablesTree.value && variablesTree.value.setCurrentNode(currentNodeOld)
        emit('hanldeChangeNode', currentNodeOld)
      }
    } else {
      if (!num) {
        const [currentNode] = [...currentChildren].reverse()
        variablesTree.value && variablesTree.value.setCurrentNode(currentNode)
        emit('hanldeChangeNode', currentNode)
      }
    }
  } else {
    emit('hanldeChangeNode', null)
    // variablesTree.value && variablesTree.value.setCurrentNode(null)
  }
}
// 添加子节点
const handleAddNode = (data: navigationTree) => {
  console.log(data, 'data')
  temporaryName = ''
  const E = data.data
  const S = {
    modelId: E.id,
    status: 1,
    name: '',
    child: true,
    type: 'modelBlock'
  }
  E.children = E?.children?.length ? E.children : []
  E.children.push(S)
}
// 失去焦点 / 添加/修改
const hanldeEnter = (data: any) => {
  console.log(222)
  if (!data.name) {
    if (data.id) {
      data.name = temporaryName
    } else {
      store.commit('assumptionVar/filterAssumptionVarPagesById')
    }
    data.status = 0
    return false
  }
  if (nameRepeatCheck(data)) {
    ElMessage({
      message: '名称不可以重复！',
      type: 'warning'
    })
    return false
  }
  if (!ValidationName(data?.name)) {
    ElMessage({
      message: '名称格式错误，请重新输入！',
      type: 'warning'
    })
    return false
  }
  data.status = 0
  data.modelId = data.modelId * 1
  const path = data.id ? 'assumptionVar/updateAssumptionVarPageWithDBSync' : 'assumptionVar/addAssumptionVarPageWithDBSync'
  store.dispatch(path, data).then(r => currentLengthChange(data, 0))
}
// 右键菜单
const hanldeNode = (event: MouseEvent, data: modelFile) => {
  if (!data.child) return false
  const menuItems = getModelNaviNodeContextMenuItems(data)
  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
}
const getModelNaviNodeContextMenuItems = (data: modelFile) => {
  return [
    {
      title: '重命名',
      shortCut: 'F2',
      onClick: () => updateCurrentModelNodeWithModelNaviNode(data)
    },
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => {
        proxy.$alert(`确定要删除模型 ${data.name}?`, '提示', {
          confirmButtonText: '确 定',
          cancelButtonText: '取 消',
          showCancelButton: true
        }).then(() => {
          deleteModelFiles(data)
        }).catch(() => { })
      }
    }
  ]
}

function modelNodeCopyTooltip(node: ModelNavigationNode): string {
  if (node.type === ModelNavigationNodeType.models) {
    return '新增模块'
  }
  return ''
}
// 修改tree
const updateCurrentModelNodeWithModelNaviNode = (data: modelFile) => {
  temporaryName = data.name
  data.status = 1
}
// 删除tree
const deleteModelFiles = (data: modelFile) => {
  const currentChildren = modelNavigationTree.value.filter((item: any) => item.id * 1 === data.modelId)[0].children
  currentChildren.forEach((iter: any, index: number) => {
    if (iter.id === data.id) currentTreeNodeIndex = index
  })
  const path = 'assumptionVar/deleteAssumptionVarPagesWithDBSync'
  store.dispatch(path, [data]).then(() => currentLengthChange(data, 1))
}
// 过滤tree
const filterNode = (value: string, data: Partial<ModelBlock>) => {
  if (!value) return true
  return data.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1
}
// 名称重复校验
const nameRepeatCheck = (data: any) => {
  const currModelNavigationTree = modelNavigationTree.value.find((tree: SimplifiedModel) => tree.id === data.modelId.toString())
  const somes = currModelNavigationTree.children.filter((block: SimplifiedModelBlock) => block.name === data.name)
  return somes.length > 1
}

const initData = () => {
  const ids = T.map((item: any) => item.id.split(NaviNodeIdDelimiter)[1] * 1)
  store.dispatch('assumptionVar/recoverAssumptionVarPagesFromDB', ids).then(_ => {
    const p = JSON.parse(JSON.stringify(modelNavigationTree.value))
    const node = currentNodeKey.reduce((n, k) => n[k], p)
    handleCurrentChange(node)
  })
}
onMounted(() => initData())
watch(() => router.currentRoute.value.path, (path) => path === '/assumption' && initData())

watch(filterText, (value) => variablesTree.value && variablesTree.value.filter(value))

watch(T, () => initData())

</script>
<style lang="scss" scoped>
@import "../scss/VariablesTree.scss";
</style>
<style lang="scss">
.filter-input {
  margin-top: 10px;
}
.output-box {
  .el-overlay.is-message-box {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
  }
}
</style>
