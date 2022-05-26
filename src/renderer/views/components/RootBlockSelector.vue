<template>
  <a-cascader :value="cascaderValue" :options="maskBlockOptions" expand-trigger="hover"
    change-on-select placeholder="请选择入口模块" @change="onChange"
    :field-names="{ label: 'name', value: 'id', children: 'children' }" >
    <template #displayRender="{ labels }">
      <span>{{labels[labels.length - 1]}}</span>
    </template>
  </a-cascader>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import modelsDataSource from '../../store/modules/modelsDataSource'
import { getModelNavigationNodeIdAndType, getModelNodeType, ModelNodeType } from '../../utils'
import { ModelNavigationNode, ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { createNamespacedHelpers } from 'vuex'
import { ElMessage } from 'element-plus'
const { mapState } = createNamespacedHelpers('models/')

export default defineComponent({
  emits: [('update:modelValue' as string)],
  props: {
    modelValue: {
      type: Number,
      required: false
    }
  },
  computed: {
    ...mapState(['currentModelNode', 'modelNavigationTree']),
    cascaderValue(): string[] {
      if (this.modelValue) {
        const ancestorIds = modelsDataSource.getAncestorPathForAModelBlock(this.modelValue)
        const cascaderValue = ancestorIds.slice(1).map(id => {
          return ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + id
        })
        return cascaderValue
      }
      return []
    },
    maskBlockOptions(): ModelNavigationNode[] {
      if (!this.currentModelNode) return []
      const currentNodeType = getModelNodeType(this.currentModelNode)
      let modelNodeId: string
      if (currentNodeType === ModelNodeType.models) {
        modelNodeId = ModelNavigationNodeType.models + NaviNodeIdDelimiter + this.currentModelNode.id
      } else {
        const ancestorIds = modelsDataSource.getAncestorPathForAModelBlock(this.currentModelNode.id)
        const modelId = ancestorIds[0]
        modelNodeId = ModelNavigationNodeType.models + NaviNodeIdDelimiter + modelId
      }
      const index = this.modelNavigationTree.findIndex(node => node.id === modelNodeId)
      return index > -1 ? this.modelNavigationTree[index].children.map(f => {
        return { name: f.name, id: f.id }
      }) : []
    }
  },
  methods: {
    onChange(value: string[]) {
      if (value.length > 0) {
        ElMessage({
          showClose: true,
          message: '所有输出设置、目标设置中的link chain会失效！'
        })
        const { id } = getModelNavigationNodeIdAndType(value[value.length - 1])
        this.$emit('update:modelValue', id)
      } else {
        this.$emit('update:modelValue', 0)
      }
    }
  }
})
</script>
<style lang="scss" scoped>

</style>
