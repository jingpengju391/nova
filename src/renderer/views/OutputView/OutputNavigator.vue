<template>
  <!-- <collapse-item title="输出设置" name="outputSettings" class="dddd">

  </collapse-item> -->
  <el-tree
    ref="outputNaviTree"
    class="navi-tree"
    :data="outputNaviTree"
    :expand-on-click-node="false"
    :check-on-click-node="false"
    :highlight-current="true"
    :props="defaultProps"
    node-key="id"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse"
    :default-expanded-keys="defaultExpandedKeys"
    @node-contextmenu="onRightClickOutputNaviNode"
    @node-click="onClickOutputNaviNode"
  >
    <template #default="{ node }">
      <span class="navi-node">
        <span
          :class="node.data.warning !== 'success' ? 'title no-vs' : 'title'"
        >
          <el-icon class="icon"><document /></el-icon>
          {{ node.data.name || "New Output (UNSAVED)" }}
        </span>
        <span v-if="!isATemporaryModelNode(node.data)" class="tool-sets">
          <icon-button
            v-if="isModelNaviNode(node.data)"
            tooltip="新建输出"
            @click.stop="onClickNewOutput(node.data)"
            icon-class="document-add"
          />
          <icon-button
            v-else
            tooltip="拷贝输出"
            icon-class="document-copy"
            @click.stop="tryToDuplicateOutput(node.data)"
          />
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { OutputNavigationNode, OutputNavigationNodeType } from '@shared/dataModelTypes/runs/outputs'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import CollapseItem from '@/views/components/Collapse/CollapseItem.vue'
import IconButton from '@/views/components/IconButton.vue'
import { ElTree } from 'element-plus'
import { getOutputNavigationNodeIdAndType } from '@/utils'
import { createNamespacedHelpers } from 'vuex'
import { UnsavedOutputExistsError } from '@/errors'
import type { ContextMenuItemProps } from '@/views/components/ContextMenu/types'
const { mapState, mapGetters, mapMutations, mapActions } = createNamespacedHelpers('outputs/')
const { mapActions: modelsMapActions } = createNamespacedHelpers('models/')

// offset for el-message
const offset = 65

export default defineComponent({
  components: { CollapseItem, IconButton },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      defaultExpandedKeys: [] as any []
    }
  },
  computed: {
    ...mapState(['currentOutput']),
    ...mapGetters(['outputNaviTree'])
  },
  watch: {
    currentOutput: {
      handler(newValue) {
        if (!newValue) return
        const naviNodeType = newValue.modelId
          ? OutputNavigationNodeType.outputs : OutputNavigationNodeType.models
        const newCurrentKey = naviNodeType + NaviNodeIdDelimiter + newValue.id
        // highlight new current node
        this.$nextTick(() => {
          const naviTree = this.$refs.outputNaviTree as InstanceType<typeof ElTree>
          naviTree.setCurrentKey(newCurrentKey)
          this.$nextTick(() => {
            const treeElement = naviTree.$el as HTMLElement
            const currentNodeElement = document.getElementsByClassName('el-tree-node is-current')[0] as HTMLElement
            if (currentNodeElement) {
              const yDiff = currentNodeElement.getBoundingClientRect().y - treeElement.getBoundingClientRect().y
              if (yDiff > treeElement.getBoundingClientRect().height) {
                treeElement.scrollTop = treeElement.scrollTop + yDiff
              }
            }
          })
        })
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    ...mapMutations(['updateCurrentOutputWithOutputNaviNode']),
    ...mapActions(['createNewOutput', 'getOutputForId', 'deleteOutput', 'duplicateOutput']),
    ...modelsMapActions(['deleteModel']),
    isATemporaryModelNode(node: OutputNavigationNode): boolean {
      const { id } = getOutputNavigationNodeIdAndType(node.id)
      return id === 0
    },
    nodeExpand(data) {
      if (this.defaultExpandedKeys.indexOf(data.id) === -1) {
        this.defaultExpandedKeys.push(data.id)
      }
    },
    nodeCollapse(data) {
      const ind = this.defaultExpandedKeys.indexOf(data.id)
      if (ind !== -1) {
        this.defaultExpandedKeys.splice(ind, 1)
      }
    },
    onRightClickOutputNaviNode(event: MouseEvent, node: OutputNavigationNode) {
      event.stopPropagation()
      const { id, type } = getOutputNavigationNodeIdAndType(node.id)
      let menuItems = [] as ContextMenuItemProps[]
      if (type === OutputNavigationNodeType.outputs) {
        menuItems = this.getContextMenuForOutputNode(node)
      } else {
        menuItems = this.getContextMenuForModelNode(node, id)
      }
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
    },
    getContextMenuForModelNode(node: OutputNavigationNode, modelId:number): ContextMenuItemProps[] {
      return [
        {
          title: '新建目标',
          shortCut: '',
          onClick: () => this.onClickNewOutput(node)
        },
        {
          title: '删除',
          shortCut: 'Ctrl+d',
          onClick: () => {
            this.$alert(`确定要删除模型 ${node.name}?`, '提示', {
              confirmButtonText: '确 定',
              cancelButtonText: '取 消',
              showCancelButton: true
            }).then(() => {
              this.deleteModel(modelId).catch(err =>
                this.$message.error(err.message)
              )
            }).catch(() => { })
          }
        }
      ]
    },
    getContextMenuForOutputNode(node: OutputNavigationNode): ContextMenuItemProps[] {
      const { id } = getOutputNavigationNodeIdAndType(node.id)
      return [
        {
          title: '拷贝',
          shortCut: '',
          disabled: id === 0,
          onClick: () => this.tryToDuplicateOutput(node)
        },
        {
          title: '删除',
          shortCut: '',
          onClick: () => this.tryToDeleteOutput(node)
        }
      ]
    },
    onClickOutputNaviNode(node: OutputNavigationNode) {
      this.updateCurrentOutputWithOutputNaviNode(node)
    },
    isModelNaviNode(node: OutputNavigationNode): boolean {
      const { type } = getOutputNavigationNodeIdAndType(node.id)
      return type === OutputNavigationNodeType.models
    },
    onClickNewOutput(node: OutputNavigationNode) {
      const { id: modelId } = getOutputNavigationNodeIdAndType(node.id)
      this.createNewOutput(modelId).catch(err => {
        let message: string
        if (err instanceof UnsavedOutputExistsError) {
          message = '当前存在新建的未保存目标，请先设置该目标'
        } else {
          message = '系统错误，请联系服务商'
        }
        this.$message.warning({ message, offset })
      })
    },
    tryToDeleteOutput(node: OutputNavigationNode) {
      this.$alert(`确定要删除输出 ${node.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      }).then(() => {
        const { id } = getOutputNavigationNodeIdAndType(node.id)
        this.deleteOutput(id)
      }).catch(() => { })
    },
    tryToDuplicateOutput(node: OutputNavigationNode) {
      const { id } = getOutputNavigationNodeIdAndType(node.id)
      this.duplicateOutput(id)
    },
    initCurrentTarget() {
      if (!this.currentOutput && this?.outputNaviTree[0]?.children?.length) {
        const node = this.outputNaviTree[0].children[0]
        this.defaultExpandedKeys.push(this.outputNaviTree[0].id)
        this.updateCurrentOutputWithOutputNaviNode(node)
      }
    }
  },
  created() {
    this.initCurrentTarget()
  }
})
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";

.collapse-title {
  width: 100%;
  padding-right: 6px;
  display: flex;
  font-size: 14px;
  flex-flow: row nowrap;
  justify-content: space-between;
  user-select: none;

  .tool-sets {
    opacity: 0;
  }
}
.no-vs {
  color: red;
}
.navi-tree {
  padding: 10px 0;
  height: 100%;
}
</style>
