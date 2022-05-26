<template>
  <div class="task-box">
    <app-tool-bar @left-toggle-click="toggleAssumptionViewDisplay" />
    <div class="table-box">
      <split-panel
        class="coding-pane"
        :main-pane-default-ratio="0.6"
        split-direction="vertical"
        :hide-side-pane="hideConsole"
      >
        <template #main>
          <TaskTableList @handelCurrentTask="handelCurrentTask" />
        </template>
        <template #side>
          <!-- <div class="console-box">       </div> -->
          <TaskConsole :FolderPath="FolderPath" />
        </template>
      </split-panel>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import AppToolBar from '../components/AppToolBar.vue'
import TaskConsole from './TaskConsle/index.vue'
import TaskTableList from './TaskTableList/index.vue'
import { SplitPanel } from '@/views/components'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('tasks/')
export default defineComponent({
  components: {
    AppToolBar,
    // TaskDetailsDialog,
    TaskTableList,
    SplitPanel,
    TaskConsole
  },
  data() {
    return {
      toggleAssumptionViewDisplay: true,
      multipleSelection: [],
      taskMO: [],
      FolderPath: {
        count: 0,
        path: '',
        name: '',
        id: 0
      }
    }
  },
  computed: {
  },
  mounted() {
  },
  methods: {
    handelCurrentTask(curData) {
      this.FolderPath = curData
      console.log(curData)
    }
  }
})
</script>
<style scoped lang="scss">
.task-box {
  overflow: hidden;
  padding: 10px;
  width: 100%;
  .table-box {
    height: calc(100vh - 36px);
    .coding-pane {
      height: 100%;
      // .task-console-box {
      //   height: 100%;
      // }
    }
    .table-btn-box {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      padding: 10px 0;
    }
  }
}
</style>
