<template>
  <div id="dataLink-navigator">
    <div id="header">
      <span>数据链接导航</span>
      <icon-button
        icon-class="document-add"
        tooltip="创建链接"
        @click="onCreateLink"
      />
    </div>
    <div>
      <el-input
        class="search"
        placeholder="请输入内容"
        prefix-icon="search"
        v-model="filterText"
        maxlength="inputNameLength"
      >
      </el-input>
    </div>
    <el-tree
      ref="dataLinkNaviTree"
      class="navi-tree"
      :data="filterTextData"
      default-expand-all
      :expand-on-click-node="false"
      :check-on-click-node="false"
      :highlight-current="true"
      empty-text="暂无数据"
      node-key="id"
      @node-contextmenu="handlew"
       @current-change="onClickDataLink"
    >
      <template #default="{ node,data }">
        <span class="navi-node">
          <span v-if="!node.data.isRename">
            <el-icon class="icon"><document /></el-icon>
            {{ node.data.name }}
          </span>
          <span v-if="node.data.isRename">
            <el-icon class="icon"><document /></el-icon>
              <el-input
            class="node-input"
            v-focus
            v-model="node.data.name"
            placeholder="请输入内容"
            @change="changNavName(data)"
          >
          </el-input>
               <!-- <el-input
                  @blur="changNavName(data)"
             v-model="node.data.name" >
              </el-input> -->
          </span>

          <span class="tool-sets">
            <icon-button
              icon-class="delete"
              @click.stop="deleteDataLinkItem(node.data)"
            />
          </span>
        </span>
      </template>
    </el-tree>
    <add-link-dialog ref="addLinkDialog" />
  </div>
</template>

<script lang="ts">
import { DataLink } from '@shared/dataModelTypes/models/dataLink'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
import { clone } from '@shared/functional'
import { defineComponent } from 'vue'
import IconButton from '../components/IconButton.vue'
import AddLinkDialog from './AddLinkDialog.vue'
import { createNamespacedHelpers } from 'vuex'
import { ElTree, ElMessage } from 'element-plus'
const { mapState, mapActions, mapMutations, mapGetters } = createNamespacedHelpers('dataLink/')

export default defineComponent({
  components: { IconButton, AddLinkDialog },
  data() {
    return {
      filterText: '',
      rename: '',
      temporaryName: ''
    }
  },
  watch: {
    currDataLink: {
      handler(newValue) {
        if (!newValue) return
        const newCurrentKey = newValue.name
        this.$nextTick(() => {
          const naviTree = this.$refs.dataLinkNaviTree as InstanceType<
            typeof ElTree
          >
          naviTree.setCurrentKey(newCurrentKey)
          this.$nextTick(() => {
            const treeElement = naviTree.$el as HTMLElement
            const currentNodeElement = document.getElementsByClassName(
              'el-tree-node is-current'
            )[0] as HTMLElement
            // const yDiff = currentNodeElement.getBoundingClientRect().y -
            //   treeElement.getBoundingClientRect().y
            // if (yDiff > treeElement.getBoundingClientRect().height) {
            //   treeElement.scrollTop = treeElement.scrollTop + yDiff
            // }
          })
        })
      },
      immediate: true
    },
    dataLinks: {
      handler(newValue) {
        if (!this.currDataLink) return
        const newCurrentKey = newValue.name
        this.$nextTick(() => {
          const naviTree = this.$refs.dataLinkNaviTree as InstanceType<
            typeof ElTree
          >
          naviTree.setCurrentKey(this.currDataLink.name)
          this.$nextTick(() => {
            const treeElement = naviTree.$el as HTMLElement
            const currentNodeElement = document.getElementsByClassName(
              'el-tree-node is-current'
            )[0] as HTMLElement
            const yDiff =
              currentNodeElement.getBoundingClientRect().y -
              treeElement.getBoundingClientRect().y
            if (yDiff > treeElement.getBoundingClientRect().height) {
              treeElement.scrollTop = treeElement.scrollTop + yDiff
            }
          })
        })
      }
    }
  },
  computed: {
    ...mapState(['dataLinks', 'currDataLink']),
    ...mapGetters(['dataNaviTree']),
    filterTextData(): DataLink[] {
      if (this.filterText.length) {
        const list = this.dataNaviTree.filter(item => {
          return item.name.toLowerCase().includes(this.filterText.toLowerCase())
        })
        return list
      }
      return this.dataNaviTree
    }
  },
  methods: {
    ...mapMutations(['updateCurrentDataLink']),
    ...mapActions(['deleteDataLink', 'queryCurrentDataLists', 'navNameChange']),
    onCreateLink() {
      const addLinkDialog = this.$refs.addLinkDialog as InstanceType<
        typeof AddLinkDialog
      >
      addLinkDialog.visible = true
    },
    handlew(node, data) {
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: [
          {
            title: '重命名',
            shortCut: '',
            onClick: () => this.renameNav(data)
          }
        ]
      })
    },
    renameNav(data) {
      this.rename = clone(data.name)
      this.temporaryName = data.name
      data.isRename = true
    },
    changNavName(data) {
      if (!data.name) {
        if (data.id) {

        } else {

        }
        data.name = this.temporaryName
        data.isRename = true
        return false
      }
      // data.name = this.temporaryName
      if (this.nameRepeatCheck(data)) {
        ElMessage({
          message: '名称不可以重复！',
          type: 'warning'
        })

        return false
      }
      this.navNameChange({ curName: this.rename, newName: data.name })
      data.isRename = false
    },
    // 名称重复校验
    nameRepeatCheck (data: any) {
      const somes = this.dataLinks.filter((block: any) => block.name === data.name)
      return somes.length > 0
    },
    deleteDataLinkItem(node: DataLink) {
      this.$alert(`确认要删除${node.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      })
        .then(() => {
          this.deleteDataLink(node.name).catch((err) => {
            this.$message.error(err.message)
          })
        })
        .catch(() => { })
    },
    onClickDataLink(dataLinkNaviNode: DataLink) {
      if (!dataLinkNaviNode.isRename) {
        this.updateCurrentDataLink(dataLinkNaviNode)
      }
    }
  },
  created() {
    if (this.dataLinks) {
      this.queryCurrentDataLists(false)
      if (this.dataLinks.length) {
        // this.updateCurrentDataLink(this.dataLinks[0])
      }
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#dataLink-navigator {
  height: 100%;
  border-right: 1px solid var(--nova-border-color);
  background: $naviBgColor;
  padding: 10px;
  #header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    span {
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
  .search {
    margin-bottom: 10px;
  }
    .node-input{
    width: calc(100% - 15px);
    margin-left: 5px;
    &:deep(.el-input__inner) {
      height: 26px;
      line-height: 26px;
    }
  }
  .navi-tree {
    overflow: auto;
  }
}
</style>
