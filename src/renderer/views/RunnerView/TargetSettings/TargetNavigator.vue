<template>
  <el-tree
    ref="targetNaviTree"
    class="navi-tree"
    :data="targetNaviTree"
    :expand-on-click-node="false"
    :check-on-click-node="false"
    :highlight-current="true"
    :props="defaultProps"
    node-key="id"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse"
    :default-expanded-keys="defaultExpandedKeys"
    :current-node-key="currentTarget ? currentTarget.id : 'targets-1'"
    @node-contextmenu="onRightClickTargetNaviNode"
    @node-click="onClickTargetNaviNode"
  >
    <template #default="{ node }">
      <span class="navi-node">
        <span
          :class="node.data.warning !== 'success' ? 'title no-vs' : 'title'"
        >
          <el-icon class="icon"><document /></el-icon>
          {{ node.data.name || "New Target (UNSAVED)" }}
        </span>
        <span v-if="!isATemporaryModelNode(node.data)" class="tool-sets">
          <icon-button
            v-if="isModelNaviNode(node.data)"
            tooltip="新建目标"
            @click.stop="onClickNewTarget(node.data)"
            icon-class="document-add"
          />
          <icon-button
            v-else
            tooltip="拷贝目标"
            icon-class="document-copy"
            @click.stop="tryToDuplicateTarget(node.data)"
          />
        </span>
      </span>
    </template>
  </el-tree>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { TargetNavigationNode, TargetNavigationNodeType } from '@shared/dataModelTypes/runs/targets'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { createNamespacedHelpers } from 'vuex'
import { getTargetNavigationNodeIdAndType } from '@/utils'
import IconButton from '@/views/components/IconButton.vue'
import { UnsavedTargetExistsError } from '@/errors'
import { ElTree } from 'element-plus'
import currentTargetMixin from './mixins'
import type { ContextMenuItemProps } from '@/views/components/ContextMenu/types'

const { mapState, mapGetters, mapMutations, mapActions } = createNamespacedHelpers('runs/')
const { mapActions: modelsMapActions } = createNamespacedHelpers('models/')
// offset for el-message
const offset = 65

export default defineComponent({
  components: { IconButton },
  mixins: [currentTargetMixin],
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
    ...mapState(['currentTarget']),
    ...mapGetters(['targetNaviTree'])
  },
  watch: {
    currentTarget: {
      handler(newValue) {
        if (!newValue) return
        const naviNodeType = newValue.modelId
          ? TargetNavigationNodeType.targets : TargetNavigationNodeType.models
        const newCurrentKey = naviNodeType + NaviNodeIdDelimiter + newValue.id
        // highlight new current node
        this.$nextTick(() => {
          const naviTree = this.$refs.targetNaviTree as InstanceType<typeof ElTree>
          naviTree.setCurrentKey(newCurrentKey)
          this.$nextTick(() => {
            const treeElement = naviTree.$el as HTMLElement
            const currentNodeElement = document.getElementsByClassName('el-tree-node is-current')[0] as HTMLElement
            if (!currentNodeElement) return
            const yDiff = currentNodeElement.getBoundingClientRect().y - treeElement.getBoundingClientRect().y
            if (yDiff > treeElement.getBoundingClientRect().height) {
              treeElement.scrollTop = treeElement.scrollTop + yDiff
            }
          })
        })
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    ...mapMutations(['updateCurrentTargetWithTargetNaviNode']),
    ...mapActions(['createNewTarget', 'getTargetForId', 'deleteTarget', 'duplicateTarget']),
    ...modelsMapActions(['deleteModel']),
    isATemporaryModelNode(node: TargetNavigationNode): boolean {
      const { id } = getTargetNavigationNodeIdAndType(node.id)
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
    onRightClickTargetNaviNode(event: MouseEvent, node: TargetNavigationNode) {
      event.stopPropagation()
      const { id, type } = getTargetNavigationNodeIdAndType(node.id)
      let menuItems = [] as ContextMenuItemProps[]
      if (type === TargetNavigationNodeType.targets) {
        menuItems = this.getContextMenuForTargetNode(node)
      } else {
        menuItems = this.getContextMenuForModelNode(node, id)
      }
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems
      })
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
    getContextMenuForModelNode(node: TargetNavigationNode, modelId: number): ContextMenuItemProps[] {
      return [
        {
          title: '新建目标',
          shortCut: '',
          onClick: () => this.onClickNewTarget(node)
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
    getContextMenuForTargetNode(node: TargetNavigationNode): ContextMenuItemProps[] {
      const { id } = getTargetNavigationNodeIdAndType(node.id)
      return [
        {
          title: '拷贝',
          shortCut: '',
          disabled: id === 0,
          onClick: () => this.tryToDuplicateTarget(node)
        },
        {
          title: '删除',
          shortCut: '',
          onClick: () => this.tryToDeleteTarget(node)
        }
      ]
    },
    onClickTargetNaviNode(node: TargetNavigationNode) {
      this.updateCurrentTargetWithTargetNaviNode(node)
      // this.updateCurrentTargetTable()
    },
    isModelNaviNode(node: TargetNavigationNode): boolean {
      const { type } = getTargetNavigationNodeIdAndType(node.id)
      return type === TargetNavigationNodeType.models
    },
    onClickNewTarget(node: TargetNavigationNode) {
      const { id: modelId } = getTargetNavigationNodeIdAndType(node.id)
      this.createNewTarget(modelId).catch(err => {
        let message: string
        if (err instanceof UnsavedTargetExistsError) {
          message = '当前存在新建的未保存目标，请先设置该目标'
        } else {
          message = '系统错误，请联系服务商'
        }
        this.$message.warning({ message, offset })
      })
    },
    onClickCopyTarget(node: TargetNavigationNode) {
      const { id } = getTargetNavigationNodeIdAndType(node.id)
      const target = this.getTargetForId(id)
      this.setTargetClipboard(target)
    },
    tryToDeleteTarget(node: TargetNavigationNode) {
      this.$alert(`确定要删除目标 ${node.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      }).then(() => {
        const { id } = getTargetNavigationNodeIdAndType(node.id)
        this.deleteTarget(id)
      }).catch(() => { })
    },
    tryToDuplicateTarget(node: TargetNavigationNode) {
      const { id } = getTargetNavigationNodeIdAndType(node.id)
      this.duplicateTarget(id)
    },
    initCurrentTarget() {
      if (!this.currentTarget && this?.targetNaviTree[0]?.children?.length) {
        const node = this.targetNaviTree[0].children[0]
        this.defaultExpandedKeys.push(this.targetNaviTree[0].id)
        this.updateCurrentTargetWithTargetNaviNode(node)
      }
    }
  },
  mounted() {
    this.initCurrentTarget()
  }
})
</script>

<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";

.navi-tree {
  height: 100%;
  padding-top: 10px;
  border-right: 1px solid var(--nova-border-color);
  background: $naviBgColor;
  overflow-y: scroll;
}
.no-vs {
  color: red;
}
</style>
