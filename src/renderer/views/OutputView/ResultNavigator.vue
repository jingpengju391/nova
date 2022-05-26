<template>
  <collapse-item title="结果文件" name="resultFiles" class="">
    <directory-tree
      id="result-file-tree"
      ref="dtree"
      @check-change="log('check_change', $event)"
      @node-click="loadFile"
      :show-checkbox="false"
      :ignore="/index/"
      :renderContent="renderTreeNode"
      :expandKeys="expandKeys"
      :maxDepth="2"
      :lazy="false"
      :root-config="rootConfig"
    />
  </collapse-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CollapseItem from '@/views/components/Collapse/CollapseItem.vue'
import DirectoryTree from '@/views/components/DirectoryTree/index.vue'
import type { DTNode, DTNodeConfig } from '@/views/components/DirectoryTree/types'
import type { ModelFileNavigationNode } from '@shared/dataModelTypes/models/models'
import { useDataInputsAPIs } from '@/hooks/apis'
import OutputTreeNode from './OutputTreeNode.vue'
import { createNamespacedHelpers } from 'vuex'

const { mapGetters, mapMutations, mapState } = createNamespacedHelpers('outputs/')
export default defineComponent({
  components: { CollapseItem, DirectoryTree },
  data() {
    return {
      expandKeys: [],
      filename: '' as string
    }
  },
  mounted() {
    this.expandKeys = Object.keys(this.$refs.dtree.mapId2Node)
  },
  computed: {
    ...mapGetters(['resultFileNaviTree']),
    ...mapState(['currentFileName']),
    rootConfig(): DTNodeConfig[] {
      const nt: ModelFileNavigationNode[] = this.resultFileNaviTree
      return nt.map(v => {
        return {
          value: v.id,
          label: v.name,
          isDirectory: false,
          children: v.folders.map(f => {
            const docPath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, v.name, f)
            return {
              value: useDataInputsAPIs().pathResolve(docPath),
              label: f,
              isDirectory: true,
              children: []
            }
          })
        }
      })
    }
  },
  methods: {
    ...mapMutations(['changeFileName']),
    log(evt, ...args) {
      console.log(evt, args)
    },
    loadFile(node: DTNode) {
      console.log('node click', node)
      if (node.isFile) {
        this.changeFileName(node.value)
        this.filename = node.value
      }
    },
    refresh(node) {
      this.$refs.dtree.refresh(node)
    },
    renderTreeNode(h, { node, data, store }) {
      return h(OutputTreeNode, {
        freshFunc: this.refresh,
        node
      })
    }
  }
})
</script>

<style lang="scss" scoped>
#title {
  font-size: 14px;
  user-select: none;
}
#result-file-tree {
  width: 100%;
  height: 100%;
  &:deep(.el-tree-node__content) {
    font-size: 14px;
    height: 32px;
    > .el-tree-node__expand-icon {
      padding: 6px 8px;
    }
  }
  &:deep(.el-tree-node:focus) {
    > .el-tree-node__content {
      background-color: #d9eeff;
      color: black;
      font-weight: 500;
    }
  }

  &:deep(.el-tree-node.is-current) {
    > .el-tree-node__content {
      background-color: #cce9ff;
      border: 1px solid #3b8bff;
      color: black;
      font-weight: 500;
    }
  }

  &:deep(.el-tree-node__content:hover) {
    background-color: #cce9ff;

    .mask-block-node > .tool-sets {
      opacity: 1;
    }
  }
  .node-input {
    width: calc(100% - 15px);
    margin-left: 5px;
    &:deep(.el-input__inner) {
      height: 26px;
      line-height: 26px;
    }
  }
}
</style>
