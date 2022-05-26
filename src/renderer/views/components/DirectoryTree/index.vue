<template>
  <el-tree
    class="custom-directory-tree"
    ref="tree"
    :data="treeData"
    :show-checkbox="showCheckbox"
    :filter-node-method="filterNode"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse"
    :default-expanded-keys="defaultExpanedKeys"
    :load="load"
    :lazy="lazy"
    :render-content="renderContent"
    @node-click="
      (...args) => {
        $emit('node-click', ...args);
      }
    "
    @node-contextmenu="
      (...args) => {
        $emit('node-contextmenu', ...args);
      }
    "
    @check-change="
      (...args) => {
        $emit('check-change', ...args);
      }
    "
    node-key="id"
    :props="{ label: 'label', children: 'children', isLeaf: 'isLeaf' }"
  >
  </el-tree>
</template>

<script lang=ts>
import { defineComponent } from 'vue'
import type { DTNode, DTNodeConfig } from './types'
import { useDataInputsAPIs } from '../../../hooks/apis'
import type { DirectoryFileDescriptor } from '@shared/dataModelTypes'
import { v4 as uuid } from 'uuid'

export default defineComponent({
  emits: [
    'node-click',
    'node-contextmenu',
    'check-change'
  ],
  watch: {
    rootConfig() {
      this.initTree()
    }
  },
  props: {
    expandKeys: {
      type: Array,
      default() {
        return []
      }
    },
    preserveLevel: {
      type: Number,
      default: 0
    },
    renderContent: {
      type: Function,
      default: (h, { node, data, store }) => {
        return node.label
      }
    },
    filteredExt: {
      type: String,
      default: '.csv'
    },
    ignore: {
      type: RegExp,
      default: /(^\..*)|(node_modules)/
    },
    lazy: {
      type: Boolean,
      default: true
    },
    showCheckbox: {
      type: Boolean,
      default: false
    },
    rootConfig: {
      type: Object,
      default: [{
        value: 'fake-id',
        name: 'top-level',
        isDirectory: false,
        children: [
          { value: '.', name: 'working-folder', isDirectory: true, children: [] }
        ]
      }] as DTNodeConfig[]
    },
    maxDepth: { // 当lazy为false的时候生效，会持续展开目录到maxDepth的深度
      type: Number,
      default: 2
    }
  },
  setup(props, context) {
  },
  mounted() {
    this.initTree()
  },
  data() {
    return {
      mapId2Node: {},
      treeData: [] as DTNode[]
    }
  },
  computed: {
    defaultExpanedKeys() {
      return Object.values(this.mapId2Node).filter(v => {
        return v.isExpand
      }).map(v => {
        return v.id
      })
    }
  },
  methods: {
    nodeExpand(data) {
      data.isExpand = true
    },
    nodeCollapse(data) {
      data.isExpand = false
    },
    counter(val) {
      return uuid()
    },
    async refresh(node) {
      const k = node.data.id
      const level = node.data.level
      const n = this.mapId2Node[k]
      await this.doExpandTree(n, this.maxDepth - level + 1, true)
      this.treeData = [...this.treeData]
    },
    filter(val) {
      this.$refs.tree.filter(val)
    },
    filterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },
    loadFilter: function (f: DirectoryFileDescriptor) {
      if (this.ignore.test(f.name)) {
        return false
      }
      if (f.isDirectory) return true
      const reservedExt: string[] = this.filteredExt.split('|')
      let reserved = false
      for (const e of reservedExt) {
        if (e === '*') {
          reserved = true
          break
        }
        if (f.name.endsWith(e)) {
          reserved = true
          break
        }
      }
      return reserved
    },
    async doExpandTree(tree: DTNode, maxDepth: number, force = false) {
      if (tree.level < maxDepth) {
        if (force || tree.expanded === false) {
          await this.expandNodeData(tree, force)
          for (const c of tree.children) {
            await this.doExpandTree(c, maxDepth, force)
          }
        }
      }
      return tree
    },
    async expandAll() {
      try {
        const tdata: DTNode[] = []
        for (const td of this.treeData) {
          tdata.push(await this.doExpandTree(td, this.maxDepth, true))
        }
        this.treeData = tdata
      } catch (error) {
        console.log('expandAll' + error)
      }
    },
    nodeFromConfig(level: number, node: DTNode, cfg: DTNodeConfig) {
      node.id = this.counter()
      node.isDirectory = cfg.isDirectory
      if (cfg.isDirectory) {
        node.value = useDataInputsAPIs().pathResolve(cfg.value)
      } else {
        node.value = cfg.value
      }
      node.label = cfg.label
      node.isLeaf = false
      node.isFile = false
      node.isSymbolicLink = false
      node.level = level
      node.expanded = cfg.children?.length
      node.children = []
      if (cfg.children) {
        for (const ch of cfg.children) {
          const item = {} as DTNode
          node.children.push(item)
          this.nodeFromConfig(level + 1, item, ch)
        }
      }
      this.mapId2Node[node.id] = node
    },
    initTree() {
      const td = []
      for (const rc of this.rootConfig as DTNodeConfig[]) {
        const treeData: DTNode = {}
        this.nodeFromConfig(0, treeData, rc)
        td.push(treeData)
      }
      this.treeData = td
      this.expandAll()
    },
    async expandNodeData(data: DTNode, force = false) {
      if (data.isDirectory) {
        if (!force && data.expanded) return
        const files: DirectoryFileDescriptor[] = await useDataInputsAPIs()
          .readDirectory(data.value)
        data.expanded = true
        const children = files.filter(v => this.loadFilter(v)).map((v) => {
          const n = {
            id: this.counter(),
            value: v.absolutePath,
            label: v.name,
            isDirectory: v.isDirectory,
            isFile: v.isFile,
            isSymbolicLink: v.isSymbolicLink,
            isLeaf: !v.isDirectory,
            level: data.level + 1,
            expanded: false,
            children: []
          }
          this.mapId2Node[n.id] = n
          return n
        })
        data.children = children
        return data
      } else {
        data.expanded = true
        return data
      }
    },
    async load(node, resolve) {
      const { level, data } = node as { level: number, data: DTNode }
      if (level === 0) {
        this.initTree()
        resolve(this.treeData)
      } else {
        await this.expandNodeData(data)
        resolve(data.children)
      }
    }
  }
})
</script>
<style scoped>
.custom-directory-tree {
  background: #f4f9fd;
}
</style>
