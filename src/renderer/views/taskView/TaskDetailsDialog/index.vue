<template>
  <div class="dialog-box">
    <el-dialog v-model="dialogTableVisible" title="详情" width="90%" top="5vh">
      <div class="dialog-inner-box">
        <split-panel
          class="coder-panes"
          adsorbent
          :mainPaneMinimumRatio="0.1"
          @toggleViewDisplay="toggleAssumptionViewDisplay"
        >
          <template #main>
            <TaskNavigator
              @hanldeChangeTaskNodeBtn="hanldeChangeTaskNodeBtn"
              @hanldeChangeTaskNodeBtnCur="hanldeChangeTaskNodeBtnCur"
              :FolderPath="FolderPath"
            />
          </template>
          <template #side>
            <result-details
              height="100%"
              width="100%"
              :filename="currentFileName"
            />
          </template>
        </split-panel>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, watch } from 'vue'
import { SplitPanel } from '@/views/components'
import ResultDetails from './ResultDetails.vue'
import { useDataInputsAPIs } from '../../../hooks/apis'
import TaskNavigator from './TaskNavigator.vue'

export default defineComponent({
  props: {
    FolderPath: {
      type: Object
    }
  },
  components: { SplitPanel, ResultDetails, TaskNavigator },
  setup(props) {
    const state = reactive({
      dialogTableVisible: false,
      dialogFormVisible: false,
      currentFileName: '',
      toggleAssumptionViewDisplay: true
    })
    const hanldeChangeTaskNodeBtn = (node) => {
      if (node.label.indexOf('.csv') > 1) {
        state.currentFileName = node.value
      } else if (node.label.indexOf('.txt') > 1) {
        state.currentFileName = node.value
      }
    }
    const hanldeChangeTaskNodeBtnCur = (path) => {
      state.currentFileName = path
    }
    watch(props, (newVal: any, oldVal: any) => {
      // console.log(newVal, 'curData')
      if (newVal.FolderPath) {
        state.dialogTableVisible = true
        // state.currentFileName = newVal.FolderPath.path
      }
    })
    return {
      ...toRefs(state),
      hanldeChangeTaskNodeBtn,
      hanldeChangeTaskNodeBtnCur
    }
  }

})
</script>
<style scoped lang="scss">
.dialog-box {
  &:deep(.el-dialog) {
    height: 90vh;
  }
  &:deep(.el-dialog__body) {
    max-height: 90vh;
    overflow-x: hidden;
    overflow-y: scroll;
    overflow: hidden;
    height: 95%;
    padding: 0;
  }
  .dialog-inner-box {
    height: 100%;
    .coder-panes {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
  }
}
</style>
