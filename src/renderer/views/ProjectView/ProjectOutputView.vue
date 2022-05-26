<template>
  <div id="project-output-view">
    <el-empty
      style="height: 100%"
      v-if="!editableTabs.length"
      description="公式区域"
    />
    <el-tabs
      v-else
      v-model="editableTabsValue"
      class="tabs"
      type="border-card"
      closable
      @edit="handleTabsEdit"
    >
      <el-tab-pane
        class="tab-pane"
        :key="item.name"
        v-for="item in editableTabs"
        :name="item.id"
        :label="item.name"
      >
        <output-transfer :selectData="item" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import { defineComponent, VNodeProps, VNode } from 'vue'
import OutputTransfer from './OutputTransfer.vue'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations, mapActions } = createNamespacedHelpers('project/')
interface Option {
  key: number
  label: string
  disabled: boolean
}
export default defineComponent({
  components: { OutputTransfer },
  data() {
    return {

      outputData: [],
      editableTabsValue: '1',
      editableTabs: [
        // {
        //   title: 'Tab 1',
        //   name: '1',
        //   content: 'Tab 1 content'
        // },
        // {
        //   title: 'Tab 2',
        //   name: '2',
        //   content: 'Tab 2 content'
        // }
      ] as any [],

      tabIndex: 2

    }
  },
  computed: {
    ...mapState(['projects', 'currProject'])
  },
  watch: {
    currProject: {
      handler(newValue, oldValue) {
        if (!newValue) return
        if (newValue.parentId === '0') {
          this.hideOutPutView()
          this.hideFormulaItem()
          return
        }
        if (newValue.type === 'output' && this.editableTabs.length === 0 && newValue.children !== undefined) {
          // if (newValue.children.length) {
          //   this.editableTabs.push(...newValue.children)
          //   this.editableTabsValue = this.editableTabs[this.editableTabs.length - 1].id
          // }
        } else if (newValue.type === 'output' && this.editableTabs.length !== 0 && newValue.children !== undefined && newValue.parentId !== this.editableTabs[0].parentId) {
          this.editableTabs = []
          if (newValue.children.length) {
            this.editableTabs.push(...newValue.children)
            this.editableTabsValue = this.editableTabs[this.editableTabs.length - 1].id
          }
        } else if (newValue.type === 'output' && (newValue.children === undefined || !newValue.children.length)) {
          let flag = false
          this.editableTabs.map(item => {
            if (item.id === newValue.id) {
              flag = true
              this.editableTabsValue = newValue.id
            }
          })
          if (!flag) {
            if (oldValue && newValue.parentId !== oldValue.parentId) {
              this.editableTabs = [] as any []
            }
            this.editableTabs.push(newValue)
            this.editableTabsValue = newValue.id
          }
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['hideOutPutView', 'showFormulaItem', 'hideFormulaItem', 'updateCurrentProject']),
    ...mapActions(['updateCurrentProjectActions']),
    toRight() {
      // const se
    },
    toLeft() { },

    handleTabsEdit(targetName, action) {
      if (action === 'remove') {
        let tabs = this.editableTabs
        let activeName = this.editableTabsValue
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.id === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1]
              if (nextTab) {
                activeName = nextTab.id
              }
            }
          })
        }
        this.editableTabsValue = activeName
        this.editableTabs = tabs.filter((tab) => tab.id !== targetName)
        if (targetName === this.currProject.id) {
          if (this.editableTabs.length) {
            const curOutputs = this.projects.filter((fil:any) => {
              return fil.id === this.currProject.parentId
            })[0].children.find((fin:any) => { return fin.type === 'output' }).children.find((fin:any) => { return fin.id === this.editableTabs[this.editableTabs.length - 1].id })
            this.updateCurrentProjectActions(curOutputs)
          } else {
            const curOutputs = this.projects.filter((fil:any) => {
              return fil.id === this.currProject.parentId
            })[0].children.find((fin:any) => { return fin.type === 'output' })
            this.updateCurrentProjectActions(curOutputs)
          }
        }
      }
    }
  }
})
</script>

<style lang="scss" scoped>
// @import "../scss/code-navigation.scss";
#project-output-view {
  width: 100%;
  height: 100%;
  // display: flex;
  &:deep(.el-tabs--border-card) {
    height: 100%;
  }
  &:deep(.el-tabs--border-card > .el-tabs__content) {
    height: calc(100% - 39px);
    // display: flex;
    // width: 100%;
    // justify-content: space-around;
  }

  .tab-pane {
    height: 100%;
  }

  .varView {
    height: 100%;
    display: flex;
    position: relative;
    .variables {
      width: 30%;
      height: 90%;
      border: 1px solid lightgray;
      margin: 20px;
      position: absolute;
      .variablesHeader {
        width: 100%;
        height: 40px;
        background: #81d3f8;
        display: flex;
        font-weight: 600;
        color: white;
        padding: 10px;
        justify-content: space-between;
      }
      .variablesBody {
        ul {
          list-style: none;
          padding: 10px;
          margin: 0;
          li {
            line-height: 30px;
            font-size: 16px;
            input {
              margin-right: 8%;
            }
          }
        }
      }
    }
    .left-variables {
      top: 2%;
      left: 10%;
    }
    .right-variables {
      top: 2%;
      right: 10%;
    }
    .arrow {
      width: 40px;
      height: 40px;
      background: #81d3f8;
      color: white;
      position: relative;
    }
    .left-arrow {
      position: absolute;
      top: 50%;
      left: 44%;
    }
    .right-arrow {
      position: absolute;
      top: 50%;
      right: 44%;
    }
  }
}
</style>
