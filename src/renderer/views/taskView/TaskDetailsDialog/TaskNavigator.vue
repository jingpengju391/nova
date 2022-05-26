<template>
  <div class="task-nav-box">
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
      :root-config="rootConfig1"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, toRefs, computed } from 'vue'
import DirectoryTree from '@/views/components/DirectoryTree/index.vue'
import type { DTNode, DTNodeConfig } from '@/views/components/DirectoryTree/types'
import { useDataInputsAPIs } from '../../../hooks/apis'
import TaskTreeNode from './TaskTreeNode.vue'
import { createNamespacedHelpers } from 'vuex'
import type { ModelFileNavigationNode } from '@shared/dataModelTypes/models/models'

const { mapGetters, mapMutations, mapState } = createNamespacedHelpers('outputs/')
export default defineComponent({
  components: { DirectoryTree },
  props: {
    FolderPath: {
      type: Object
    },
    hanldeChangeTaskNodeBtn: {
      type: Function
    },
    hanldeChangeTaskNodeBtnCur: {
      type: Function
    }
  },
  data() {
    return {
      expandKeys: [],
      filename: '' as string,
      rootConfig1: [] as DTNodeConfig[]
    }
  },
  async mounted() {
    this.expandKeys = Object.keys(this.$refs.dtree.mapId2Node)
    this.rootConfig1 = await this.setConfig(this.FolderPath.path)
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
          isDirectory: true,
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
  watch: {
    FolderPath: {
      async handler(newName, oldName) {
        this.rootConfig1 = await this.setConfig(newName.path)
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations(['changeFileName']),
    log(evt, ...args) {
    },
    async setConfig(path) {
      const res = await useDataInputsAPIs().readDirectory(path)
      // console.log(res)
      const nameReg = /(.+(?=[.csv]$))/
      const nameReg1 = /(.+(?=[.txt]$))/
      const childrenArr = res.filter(item => { return nameReg.test(item.name) })
      childrenArr.push(...res.filter(item => { return nameReg1.test(item.name) }))
      this.$emit('hanldeChangeTaskNodeBtnCur', childrenArr[0].absolutePath)
      return [{
        value: this.FolderPath.id,
        label: this.FolderPath.name,
        isDirectory: false,
        children: childrenArr.map((item, index) => {
          return {
            value: item.absolutePath,
            label: item.name,
            isDirectory: item.isDirectory,
            isFile: item.isFile,
            children: []
          }
        })
      }]
    },
    loadFile(node: DTNode) {
      this.$emit('hanldeChangeTaskNodeBtn', node)
      if (node.isFile) {
        this.$emit('hanldeChangeTaskNodeBtn', node)
        this.filename = node.value
      }
    },
    refresh(node) {
      this.$refs.dtree.refresh(node)
    },
    renderTreeNode(h, { node, data, store }) {
      return h(TaskTreeNode, {
        freshFunc: this.refresh,
        node
      })
    }
  }
})
</script>
<style scoped lang="scss">
.task-nav-box {
  width: 100%;
  height: 100%;
  background: #f4f9fd;
  padding-top: 10px;
}
</style>
