<script lang="ts">
import Property from '../PropertyNavigation/Property.vue'
import { defineComponent, computed } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import type { Mask } from '@shared/dataModelTypes'
import { getModelNodeType, ModelNodeType, getModelNavigationNodeIdAndType, treeFind } from '@/utils'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { ModelNavigationNode, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { UnsavedPropertyExistsError } from '../../../errors'
import type { ContextMenuItemProps } from '../../components/ContextMenu/types'
import { ElMessageBox } from 'element-plus'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import useWindowWidthAndHeight from '../../composables/useWindowWidthAndHeight'
const { mapState, mapActions } = createNamespacedHelpers('models/')
const { mapState: relationMapState, mapActions: relationMapActions } = createNamespacedHelpers('relation/')
export default defineComponent({
  setup() {
    const { windowHeight } = useWindowWidthAndHeight()
    // 36 is top tool bar height
    // 4 is the property navigation view top padding
    // 30 is the property navigation tool bar height
    // 52 is the filter input height plus top and buttom margins
    // 26 is the bottom bar height
    const tableHeight = computed(
      () => windowHeight.value - 36 - 4 - 30 - 52 - 26
    )
    return {
      tableHeight
    }
  },
  name: 'LinkView',
  extends: Property,
  data() {
    return {
      isRelation: true
    }
  },
  computed: {
    ...mapState([
      'currentModelNode',
      'currentProperty'
    ]),
    ...relationMapState(['modelNavigationTree', 'relationCurrentModelNodeSource']),
    propertyList() {
      if (!this.modelNavigationTree || !this.displayModelTreeNavi || !this.relationCurrentModelNodeSource) return []
      const currentNode = treeFind(this.modelNavigationTree, (node) => node.id === this.relationCurrentModelNodeSource.id)
      // it's model or no find parent
      if (!currentNode?.parentNode?.id) return []
      // it's model
      const { type, id } = getModelNavigationNodeIdAndType(currentNode.parentNode.id)
      if (type === ModelNodeType.models) return []
      // no find
      const targetParentMask = modelsDataSource.getCompleteModelBlock(id)
      if (!targetParentMask) return []

      return Object.values(targetParentMask.links).filter(link => {
        const filterText = this.filterText ? link.name.toLowerCase().includes(this.filterText.toLowerCase()) : true
        const filterClassifyName = this.filterClassifyName ? link.classify.toLowerCase().includes(this.filterClassifyName.toLowerCase()) : true
        const filterTarget = link && link.target && link.target.maskName === this.relationCurrentModelNodeSource.name
        return filterText && filterClassifyName && filterTarget
      }).map(link => {
        const { classify, creator, id, modifiedAt, name, source } = link
        return { classify, creator, id, modifiedAt: this.formatDate(modifiedAt), name, source, type: PropertyType.links }
      })
    }
  },
  methods: {
    ...relationMapActions(['selectProperty'])
  }
})
</script>
<style lang="scss" scoped>
@import "../scss/property-navi.scss";
</style>
