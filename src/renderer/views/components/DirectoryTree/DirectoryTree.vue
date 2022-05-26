<template>
  <el-tree-v2
    v-if="flag"
    class="custom-directory-tree"
    ref="tree"
    :data="treeData2"
    :show-checkbox="showCheckbox"
    :filter-node-method="filterNode"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse"
    :default-expanded-keys="defaultExpanedKeys"
    :load="load"
    :lazy="lazy"
    :height="height"
    :render-content="renderContent"
    @node-click="
      (...args) => {
        nodeClick(...args);
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
  </el-tree-v2>
</template>

<script lang=ts>
import { defineComponent } from 'vue'
import type { DTNode, DTNodeConfig } from './types'
import { useDataInputsAPIs } from '../../../hooks/apis'
import type { DirectoryFileDescriptor } from '@shared/dataModelTypes'
import { v4 as uuid } from 'uuid'
import { sortDirectoryAndFile } from '@/views/AssumptionView/config/reorder'
export default defineComponent({
  emits: [
    'node-click',
    'node-contextmenu',
    'check-change'
  ],
  watch: {
    rootConfig() {
      this.initTree()
    },
    filterText(newValue) {
      this.$refs.tree.filter(newValue)
    }
  },
  props: {
    expandKeys: {
      type: Array,
      default() {
        return []
      }
    },
    filterText: {
      type: String,
      default: () => ''
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
    },
    height: { // 当lazy为false的时候生效，会持续展开目录到maxDepth的深度
      type: Number,
      default: 500
    }
  },
  mounted() {
    this.initTree()
  },
  data() {
    return {
      mapId2Node: {},
      flag: true,
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
    },
    treeData2() {
      return sortDirectoryAndFile(this.treeData)
    }
  },
  methods: {
    nodeExpand(data: any) {
      this.flag = false
      data.isExpand = true
      this.treeData.forEach(item => {
        if (item.id === data.id) {
          item.children = data.children
        }
      })
      this.doExpandTree(data, data.level + 2, true)
      this.$nextTick(() => {
        this.flag = true
      })
    },
    nodeCollapse(data) {
      data.isExpand = false
      if (!data.children) return
      for (let i = 0; i < data.children.length; i++) {
        this.nodeCollapse(data.children[i])
      }
    },

    counter(val) {
      return uuid()
    },
    nodeClick(node) {
      this.doExpandTree(node, node.level + 2, true)
    },
    async refresh(node) {
      const k = node.data.id
      const level = node.data.level
      const n = this.mapId2Node[k]
      await this.doExpandTree(n, level + 2, false)
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
      if (!force) {
        await this.expandNodeData(tree, maxDepth, true)
        force = true
        if (!tree.isEx) {
          await this.doExpandTree(tree, maxDepth, force)
        }
      } else {
        return await Promise.all(tree.children.map(async v => {
          if (v.isDirectory && v.level + 1 === maxDepth && !v.isEx) {
            await this.expandNodeData(v, false)
            await this.doExpandTree(v, maxDepth, force)
          }
          return tree
        }))
      }
    },
    async expandAll() {
      const tdata: DTNode[] = []
      for (const td of this.treeData) {
        tdata.push(await this.doExpandTree(td, 1, false))
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
      node.isEx = cfg.isEx
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
      // for (const rc of this.rootConfig as DTNodeConfig[]) {
      //   const treeData: DTNode = {}
      //   this.nodeFromConfig(0, treeData, rc)
      //   const index = this.treeData.findIndex(tree => tree.label === treeData.label)
      //   console.log(this.treeData)
      //   if (index === -1) {
      //     this.treeData.push(treeData)
      //   } else {
      //     this.treeData = this.treeData.splice(index, 1)
      //   }
      // }
    },
    async expandNodeData(data: DTNode, force = false) {
      data.value = await data.value
      if (data.isDirectory) {
        if (!force && data.expanded && !data.isEx) return
        var files: DirectoryFileDescriptor[] = await useDataInputsAPIs()
          .readDirectory(data.value)
        data.expanded = true
        if (files === undefined) {
          const dirPath = this.$store.getters.getCurrentWorkspaceDirPath
          files = await useDataInputsAPIs()
            .labelReadDirectory(dirPath, data.label)
        }
        const children = files.filter(v => this.loadFilter(v)).map((v) => {
          if (v.name.indexOf('/') !== -1) {
            v.name = v.name.split('/')[0]
          }
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
<style lang="scss" scoped>
.custom-directory-tree {
  background: transparent;
}
</style>
