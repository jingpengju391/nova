<script lang="ts">
import MaskNavigation from '../ModelNavigation/MaskNavigation.vue'
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { getModelNodeType, ModelNodeType, getModelNavigationNodeIdAndType, treeFind } from '@/utils'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import type { Mask, SimplifiedModelBlock, SimplifiedModel } from '@shared/dataModelTypes'
import { ElTree, ElMessage } from 'element-plus'
const { mapState, mapMutations } = createNamespacedHelpers('models/')
const { mapMutations: relationMapMutations, mapState: relationMapState } = createNamespacedHelpers('relation/')
export default defineComponent({
  name: 'BlockView',
  extends: MaskNavigation,
  computed: {
    ...mapState({
      navigationTree: 'modelNavigationTree',
      currentModelNode: 'currentModelNode'
    }),
    ...relationMapState(['relationCurrentModelNodeSource']),
    modelNavigationTree() {
      if (!this.relationCurrentModelNodeSource) return []
      return treeFind(this.navigationTree, data =>
        this.relationCurrentModelNodeSource.id === data.id)?.children ?? []
    }
  },
  methods: {
    onClickModelNaviNode(modelNaviNode) {
      this.updateCurrentModelNodeWithModelNaviNode(modelNaviNode)
    }
  },
  watch: {
    currentModelNode(newValue) {
      if (!newValue) return
      newValue.modelId && this.updateCurrentCodeIndex(undefined)
      const modeNodeType = newValue.modelId
        ? ModelNavigationNodeType.modelBlocks : ModelNavigationNodeType.models
      let newCurrentKey = modeNodeType + NaviNodeIdDelimiter + newValue.id
      // highlight new current node
      this.$nextTick(() => {
        const naviTree = this.$refs.modelNaviTree as InstanceType<typeof ElTree>
        const nodeKey = naviTree.getCurrentKey()
        const findIndex = newValue.detailedChildren.findIndex(f => modeNodeType + NaviNodeIdDelimiter + f.id === nodeKey)
        newCurrentKey = findIndex === -1 ? newCurrentKey : null
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
    }
  }
})
</script>
<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";
@import "../scss/mask-navigation.scss";
</style>
