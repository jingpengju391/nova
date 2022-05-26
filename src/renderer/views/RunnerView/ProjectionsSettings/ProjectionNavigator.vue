<template>
  <div id="projection-navigator">
    <div id="header">
      <span>任务列表</span>
      <icon-button
        icon-class="document-add"
        tooltip="新建任务"
        @click="onClickNewProjection"
      />
    </div>
    <el-tree
      ref="naviTree"
      class="navi-tree"
      :data="projections"
      default-expand-all
      :expand-on-click-node="false"
      :check-on-click-node="true"
      :highlight-current="false"
      :props="defaultProps"
      node-key="id"
      :current-node-key="
        currentProjection ? currentProjection.id : 'projection-1'
      "
      @node-contextmenu="onRightClickProjection"
      @node-click="onClickProjection"
      empty-text="暂无任务"
    >
      <template #default="{ node }">
        <span class="navi-node">
          <span
            :class="
              isCurrentProjectionSave(node.data) ? 'title  no-vs' : 'title'
            "
          >
            <el-icon class="icon"><document /></el-icon>
            {{ projectionNameForNavigation(node.data) }}
          </span>
          <span v-if="!isATemporaryProjection(node.data)" class="tool-sets">
            <icon-button
              tooltip="复制任务"
              icon-class="document-copy"
              @click.stop="() => duplicateProjection(node.data)"
            />
          </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from '@/views/components/IconButton.vue'
import { UnsavedProjectionExistsError } from '@/errors'
import { ElTree, ElMessage } from 'element-plus'
import { getProjectionNavigationNodeIdAndType } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { Projection, ProjectionNavigationNode, ProjectionNavigationNodeType } from '@shared/dataModelTypes/runs/projections'
import { createNamespacedHelpers } from 'vuex'

const { mapState, mapMutations, mapActions } = createNamespacedHelpers('runs/')
// offset for el-message
const offset = 65

export default defineComponent({
  components: { IconButton },
  data() {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  watch: {
    currentProjection: {
      handler(newValue, oldValue) {
        if (!newValue) return
        const newCurrentKey = newValue.id
        // highlight new current node
        this.$nextTick(() => {
          const naviTree = this.$refs.naviTree as InstanceType<typeof ElTree>
          naviTree.setCurrentKey(newCurrentKey)
          //   this.queryProjectionQueuesFromDB()
          if (oldValue && newValue.id !== oldValue.id && oldValue.id !== 0 && newValue.id !== '0') {
            this.queryProjectionQueuesFromDB()
          } else if (newValue && newValue.id === 0) {
            this.queryProjectionQueuesFromDB()
          }
          this.$nextTick(() => {
            const treeElement = naviTree.$el as HTMLElement
            const currentNodeElement = document.getElementsByClassName('el-tree-node is-current')[0] as HTMLElement
            const yDiff = currentNodeElement.getBoundingClientRect().y - treeElement.getBoundingClientRect().y
            if (yDiff > treeElement.getBoundingClientRect().height) {
              treeElement.scrollTop = treeElement.scrollTop + yDiff
            }
          })
        })
      },
      immediate: true
    },
    projections: {
      /**
        * used to keep current projection highlighted
        * when deleting a projection that is different than the current projection
        */
      handler(newValue) {
        if (!this.currentProjection) return
        this.$nextTick(() => {
          const naviTree = this.$refs.naviTree as InstanceType<typeof ElTree>
          naviTree.setCurrentKey(this.currentProjection.id)
          this.$nextTick(() => {
            const treeElement = naviTree.$el as HTMLElement
            const currentNodeElement = document.getElementsByClassName('el-tree-node is-current')[0] as HTMLElement
            const yDiff = currentNodeElement.getBoundingClientRect().y - treeElement.getBoundingClientRect().y
            if (yDiff > treeElement.getBoundingClientRect().height) {
              treeElement.scrollTop = treeElement.scrollTop + yDiff
            }
          })
        })
      }
    }

  },
  computed: {
    ...mapState(['projections', 'currentProjection', 'isProjectionSave'])
  },
  methods: {
    ...mapMutations(['updateCurrentProjection', 'updateCurrentProjectionWithProjectionNaviNode', 'changeIsProjectionSaveStatus']),
    ...mapActions(['createNewProjection', 'deleteProjection', 'duplicateProjection', 'queryProjectionQueuesFromDB']),
    projectionNameForNavigation(projection: Projection): string {
      if (projection.id === 0 && projection.name === '') {
        return 'New Projection (UNSAVED)'
      }
      return projection.name
    },
    isATemporaryProjection(projection: Projection): boolean {
      return false
    },
    isModelNaviNode(node: ProjectionNavigationNode): boolean {
      const { type } = getProjectionNavigationNodeIdAndType(node.id)
      return type === ProjectionNavigationNodeType.models
    },
    onClickNewProjection(node) {
      this.changeIsProjectionSaveStatus(false)
      this.createNewProjection().catch(err => {
        let message: string
        if (err instanceof UnsavedProjectionExistsError) {
          message = '当前存在新建的未保存任务，请先设置该任务'
        } else {
          message = '系统错误，请联系服务商'
        }
        this.$message.warning({ message, offset })
      })
    },
    onRightClickProjection(event: MouseEvent, projection: Projection) {
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: [
          {
            title: '新建任务',
            shortCut: '',
            onClick: () => this.onClickNewProjection()
          },
          {
            title: '拷贝任务',
            shortCut: '',
            onClick: () => this.duplicateProjection(projection)
          },
          {
            title: '删除任务',
            shortCut: '',
            onClick: () => this.tryToDeleteProjection(projection)
          }
        ]
      })
    },
    onClickProjection(projection: Projection) {
      // this.updateCurrentProjection(projection)
      //  if (!this.isProjectionSave) await this.saveUpdatedCurrentProjectionToDB(this.currentProjection)
      if (this.isProjectionSave) {
        this.updateCurrentProjectionWithProjectionNaviNode(projection)
      } else {
        ElMessage.error('当前存在未保存任务，请先保存该任务')
        const naviTree = this.$refs.naviTree as InstanceType<typeof ElTree>
        naviTree.setCurrentNode(this.currentProjection)
        naviTree.setCurrentKey(this.currentProjection.id)
      }
    },
    tryToDuplicateProjection(node: ProjectionNavigationNode) {
      const { id } = getProjectionNavigationNodeIdAndType(node.id)
      this.duplicateProjection(id)
    },
    tryToDeleteProjection(projection: Projection) {
      this.$alert(`确定要删除任务 ${projection.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      }).then(() => {
        if (!this.isProjectionSave) {
          this.changeIsProjectionSaveStatus(true)
        }
        this.deleteProjection(projection.id)
      }).catch(() => { })
    },
    isCurrentProjectionSave(data) {
      if (!this.currentProjection) return false
      if (this.currentProjection.id === data.id && !this.isProjectionSave) {
        return true
      } else {
        return false
      }
    }
  },
  created() {
    if (this.projections) {
      if (this.projections.length) {
        this.updateCurrentProjectionWithProjectionNaviNode(this.projections[0])
      }
    }
  },
  mounted() {
    if (this.projections.length) {
      this.queryProjectionQueuesFromDB()
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";
#projection-navigator {
  height: 100%;
  display: flex;
  flex-flow: column;
  border-right: 1px solid var(--nova-border-color);
  background: $naviBgColor;

  #header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0 4px 10px;
    background-color: transparent;
    flex: 0 0 1;
    span {
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
}
.navi-tree {
  flex: 1 1 1;
  height: 100%;
  padding-top: 10px;
  background: $naviBgColor;
  overflow-y: scroll;
}
.no-vs {
  color: red;
}
</style>
