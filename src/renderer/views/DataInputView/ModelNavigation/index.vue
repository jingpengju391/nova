<template>
  <div class="model-navigation">
    <el-input class="filterInput" prefix-icon="search" placeholder="输入关键字过滤" v-model="filterText" />
    <el-tree class="model-tree" ref="modelNaviTree" node-key="id"
        :data="dataNaviTree" :props="defaultProps" default-expand-all
        :expand-on-click-node="false" :filter-node-method="filterNode" empty-text="无匹配结果"
        :check-on-click-node="false" :highlight-current="true" @node-click="onClickModelNaviNode">
      <template #default="{ node }">
        <span class="mask-block-node">
          <span class="title"><el-icon class="icon"><document /></el-icon>
 {{node.data.name}}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { ElTree } from 'element-plus'
import type { ModelBlock } from '@shared/dataModelTypes'

const { mapMutations, mapState, mapGetters } = createNamespacedHelpers('dataInputs/')

export default defineComponent({
  components: { },

  data() {
    return {
      filterText: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },

  computed: {
    ...mapState(['currentDataModelNode']),
    ...mapGetters(['dataNaviTree'])
  },

  watch: {
    filterText(value: string) {
      (this.$refs.modelNaviTree as InstanceType<typeof ElTree >).filter(value)
    },
    currentDataModelNode: {
      handler(newObj) {
        !newObj && this.setCurrentDataModelNode()
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    ...mapMutations(['switchModel']),
    filterNode(value: string, data: Partial< ModelBlock >) {
      if (!value) {
        return true
      }
      return data.name?.toLowerCase().indexOf(value.toLowerCase()) !== -1
    },

    onClickModelNaviNode(modelNaviNode:typeof ElTree) {
      console.log(modelNaviNode, 'modelNaviNode')

      this.switchModel(modelNaviNode)
    },
    setCurrentDataModelNode() {
      this.switchModel(this.dataNaviTree[0])
      this.$nextTick(() => {
        const naviTree = this.$refs.modelNaviTree as InstanceType<typeof ElTree>
        naviTree.setCurrentKey(this.currentDataModelNode.id)
      })
    }
  }
})
</script>

<style lang="scss" scoped>
@import '../scss/ModelNavigation.scss';
</style>
