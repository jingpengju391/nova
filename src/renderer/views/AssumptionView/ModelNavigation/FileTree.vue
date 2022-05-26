<template>
  <div class="fileTree" ref="fileTree">
    <el-input
      class="filter-input"
      prefix-icon="search"
      placeholder="输入关键字过滤"
      v-model="filterText"
      maxlength="inputNameLength"
    />
    <directory-tree
      ref="dtree"
      class="el-tree"
      @check-change="log('check_change', $event)"
      @node-click="loadFile"
      :show-checkbox="false"
      :renderContent="renderTreeNode"
      :maxDepth="7"
     :height="tableH-60"
      :expandKeys="expandKeys"
      :lazy="false"
      :root-config="rootConfig"
      :filterText="filterText"
    >
    </directory-tree>
  </div>
</template>
<script lang="ts" >
import { defineComponent, getCurrentInstance } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { navigationTree, modelFile, HTMLElementFilter } from '../types'
import DirectoryTree from '../../components/DirectoryTree/DirectoryTree.vue'
import type { DTNode, DTNodeConfig } from '../components/DirectoryTree/types'
import { useDataInputsAPIs, useAssumptionTableAPIs, useAssumptionVarPagesAPIs } from '../../../hooks/apis'
import type { ModelFileNavigationNode } from '@shared/dataModelTypes/models/models'
import fileTreeNode from './fileTreeNode.vue'
import { inputNameLength } from '@shared/commonUtils'
// const { proxy }: any = getCurrentInstance()
const { mapState, mapMutations, mapGetters, mapActions } = createNamespacedHelpers('assumptionTable/')

export default defineComponent({
  components: {
    DirectoryTree
  },
  props: {
    node: {
      type: Object,
      require: true
    },
    hanldeChangeNode: {
      type: Function,
      require: true
    },
    tableH: {
      type: Number,
      require: true
    }

    // filterText: {
    //   type: String,
    //   require: true
    // }
  },
  data() {
    return {
      showFresh: false,
      expandKeys: [],
      oldNode: '',
      oldNt: [],
      isflog: true,
      rootConfig: [],
      filterText: ''
    }
  },
  computed: {
    // rootConfig(): DTNodeConfig[] {
    //   const nt: ModelFileNavigationNode[] = this.assumptionFileTableNaviTree
    //   return this.setConfig(nt)
    //   return nt.map(v => {
    //     return {
    //       value: v.id,
    //       label: v.name,
    //       isDirectory: false,
    //       children: this.getRootConfigList(v)
    //     }
    //   })
    // },
    ...mapGetters(['assumptionFileTableNaviTree']),
    ...mapState([
      'hideOutputNaviView'])

  },
  async mounted() {
    // this.rootConfig = this.setConfig(this.assumptionFileTableNaviTree)
    // for (let i = 0; i < this.rootConfig.length; i++) {
    //   let newFileList = []
    //   for (let j = 0; j < this.rootConfig[i].children.length; j++) {
    //     newFileList.push({
    //       modelId: this.rootConfig[i].value,
    //       name: this.rootConfig[i].children[j].label,
    //       path: this.rootConfig[i].children[j].value,
    //       relative: true
    //     })
    //   }
    //   await useAssumptionVarPagesAPIs().db.insertAssumptionFileListToDB(this.rootConfig[i].value, newFileList)
    // }
    // await this.recoverFileListFromDB()
    this.rootConfig = this.setConfig(this.assumptionFileTableNaviTree)
    this.expandKeys = Object.keys(this.$refs.dtree)
    this.oldNode = this.node
    // let hei = this.$refs.fileTree.offsetHeight
    // console.log(hei)
  },
  watch: {
    // filterText: function (newVal, oldVal) {
    //   this.rootConfig = this.setConfig(this.assumptionFileTableNaviTree)
    // },
    assumptionFileTableNaviTree: {
      handler(asss) {
        this.rootConfig = this.setConfig(this.assumptionFileTableNaviTree)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapActions(['delNoFileFilelist', 'recoverFileListFromDB']),
    log(evt, ...args) {
      console.log(evt, args)
    },

    setConfig(nt) {
      return nt.map(v => {
        return {
          value: v.id,
          label: v.name,
          isDirectory: false,
          children: this.getRootConfigList(v)
        }
      })
    },
    getRootConfigList(v) {
      let newV = v.folders
      if (this.filterText !== '') {
        newV = v.folders.filter(fit => { return fit.name.toUpperCase().indexOf(this.filterText.toUpperCase()) !== -1 })
      }
      const resultArr = []
      newV.map(f => {
        let docPath = ''
        const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
        if (f.relative) {
          let userAgent = navigator.userAgent.toLowerCase()
          if (userAgent.includes('electron')) {
            docPath = useDataInputsAPIs().pathJoin(relativePath, v.name, f.name)
          } else {
            docPath = (f.path !== undefined && f.path !== '') ? f.path : useDataInputsAPIs().pathJoin(relativePath, v.name, f.name)
          }
        } else {
          docPath = useDataInputsAPIs().pathJoin(f.path)
        }
        const isEx = useAssumptionTableAPIs().isExists(docPath)
        useAssumptionTableAPIs().isDeleteDir(docPath).then(resu => {
          if (!resu) this.rootConfig = this.setConfig(this.assumptionFileTableNaviTree)
        })
        if (isEx) {
          resultArr.push({
            value: docPath, // await useDataInputsAPIs().pathResolve(docPath),
            label: f.name,
            isDirectory: true,
            children: [],
            isEx: !isEx
          })
        } else {
          resultArr.push({
            value: docPath, // useDataInputsAPIs().pathResolve(docPath),
            label: f.name,
            isDirectory: true,
            children: [],
            isEx: !isEx
          })
        }
      })

      // //  this.delNoFileFilelist(resultArr)
      return resultArr
    },
    loadFile(node) {
      console.log(node)
      if (node.isFile) {
        node.changeId = Math.round(Math.random() * 15)
        this.$emit('hanldeChangeNode', node)
        this.filename = node.value
      }
    },
    async refreshParent() {
      const that = this
      setTimeout(() => {
        that.rootConfig = []
        that.$nextTick(() => {
          that.rootConfig = that.setConfig(that.assumptionFileTableNaviTree)
        })
      }, 2000)
      //  this.rootConfig = this.setConfig(this.assumptionFileTableNaviTree)
    },
    refresh(node) {
      this.$refs.dtree.refresh(node)
    },
    renderTreeNode(h, { node, data, store }) {
      return h(fileTreeNode, {
        freshFunc: this.refresh,
        refreshParent: this.refreshParent,
        node,
        data
      })
    }

  }
})
</script>
<style lang="scss" scoped>
@import "../scss/VariablesTree.scss";
.filter-input {
  margin-top: 10px;
  margin-bottom: 10px;
}
.fileTree {
  height: 100%;
  .el-tree {
    background: transparent;
    height: 100%;
  }
  &:deep(.el-tree-node__content) {
    font-size: 14px;
    height: 32px;
    // > .el-tree-node__expand-icon {
    //   // padding: 6px 8px;
    // }
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
}
.otn-node {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  .otn-ocuppy-space {
    flex: 1;
  }
}
</style>
