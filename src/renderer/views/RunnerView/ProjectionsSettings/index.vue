<template>
  <split-panel split-direction="horizontal">
    <template #main>
      <projection-navigator />
    </template>
    <template #side>
      <split-panel
        v-if="currentProjection"
        split-direction="horizontal"
        :mainPaneMinimumRatio="0.5"
        :mainPaneDefaultRatio="0.7"
        style="height: calc(100% - 0px)"
      >
        <template #main>
          <split-panel
            v-if="currentProjection"
            split-direction="veritcal"
            :mainPaneMinimumRatio="0.6"
            :mainPaneDefaultRatio="0.6"
            :hide-side-pane="hideConsole"
            style="height: calc(100% - 0px)"
          >
            <template #main>
              <split-panel
                :mainPaneMinimumRatio="0.3"
                :mainPaneDefaultRatio="0.5"
                split-direction="horizontal"
                style="height: 100%"
              >
                <template #main>
                  <projection-basice-settings />
                </template>
                <template #side>
                  <projections-run-queue-setting />
                </template>
              </split-panel>
            </template>
            <template #side>
              <RunUtilityViews />
            </template>
          </split-panel>
        </template>
        <template #side>
          <projection-detailed-settings />
        </template>
      </split-panel>
      <el-empty v-else description="选择或新建一个任务" style="height: 100%" />
    </template>
  </split-panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ProjectionNavigator from './ProjectionNavigator.vue'
import ProjectionBasiceSettings from './ProjectionBasicSettings.vue'
import ProjectionDetailedSettings from './ProjectionDetailedSettings.vue'
import ProjectionsRunQueueSetting from './ProjectionsRunQueueSetting.vue'
import SplitPanel from '../../components/SplitPanel.vue'
import Console from '@/views/components/Console.vue'
import { createNamespacedHelpers } from 'vuex'
import RunUtilityViews from '../RunUtilityViews/index.vue'

const { mapState: mapRunsState, mapActions: mapRunsActions } = createNamespacedHelpers('runs/')
const { mapState: mapTasksState, mapMutation: mapTasksMutation } = createNamespacedHelpers('tasks/')

export default defineComponent({
  components: { ProjectionNavigator, ProjectionBasiceSettings, ProjectionDetailedSettings, SplitPanel, ProjectionsRunQueueSetting, RunUtilityViews },
  computed: {
    ...mapRunsState(['currentProjection']),
    ...mapTasksState(['hideConsole'])
  },
  methods: {
    ...mapRunsActions(['saveUpdatedCurrentQueueToDB', 'queryProjectionQueuesFromDB', 'saveUpdatedCurrentProjectionToDB'])
  }

})
</script>

<style lang="scss" scoped>
.console {
  border-top: 1px solid var(--nova-border-color);
}
.projection-top-btn-box {
  height: 40px;
  line-height: 40px;
  span {
    margin-left: 40px;
    font-size: 16px;
  }
  button {
    margin-left: 40px;
  }
}
</style>
