<template>
  <split-panel
    split-direction="horizontal"
    :main-pane-default-ratio="0.4"
    :mainPaneMinimumRatio="0.3"
  >
    <template #main>
      <el-form
        class="pane-content"
        :model="currentRunner"
        :rules="currentRunnerRules"
      >
        <el-form-item
          class="form-item"
          label="选择目标"
          prop="runSetingSelectTargets"
        >
          <el-select
            v-model="runSetingSelectTargets"
            multiple
            @change="Targetchange"
          >
            <el-option
              v-for="option in targetOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <el-button
            disabled
            type="primary"
            style="margin: 0 20px"
            @click="isComponentId = 'TargetSettings'"
            >新建目标</el-button
          >
        </el-form-item>
      </el-form>
    </template>
    <template #side>
      <div style="border-left: 1px solid #d0d0d0; height: 100%">
        <component
          style="height: 100%"
          :is="isComponentId"
          :currentRunner="currentRunner"
        ></component>
      </div>
    </template>
  </split-panel>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import SplitPanel from '@/views/components/SplitPanel.vue'
import TargetPreview from './TargetPreview.vue'
import TargetSettings from '../../TargetSettings/index.vue'
import { Target } from '@shared/runs/targets'
import { clone } from '@shared/functional'
const { mapState, mapGetters, mapMutations } = createNamespacedHelpers('runs/')
export default defineComponent({
  components: { SplitPanel, TargetPreview, TargetSettings },
  data() {
    var validateTargets = (rule, value, callback) => {
      if (this.runSetingSelectTargets.length === 0) {
        callback(new Error('请选择运行目标'))
      } else {
        callback()
      }
    }
    return {
      isComponentId: 'TargetPreview' as string,
      currentRunnerRules: {
        runSetingSelectTargets: [
          { required: true, validator: validateTargets, trigger: 'change' }
        ]
      },
      targetsSelect: []
    }
  },
  computed: {
    ...mapState(['currentRunner', 'runSetingSelectTargets', 'targetNaviTree']),
    ...mapGetters(['targetModelIdMap']),
    targetOptions() {
      if (!this.currentRunner.modelId) return []
      const targets = this.targetModelIdMap.get(this.currentRunner.modelId) ?? []
      return targets.map((t: Target) => {
        return { value: t.id, label: t.name }
      }).filter((t: { value: number, label: string }) => t.value)
    }
  },
  watch: {
    currentRunner: {
      handler() {
        // this.setRunSetingSelectTargets(clone(this.currentRunner.targets))
        this.isComponentId = 'TargetPreview'
      },
      deep: true,
      immediate: true
    },
    targetNaviTree: {
      async handler(newObj) {
        // await this.handleAssumption(this.runners)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    ...mapMutations(['setRunSetingSelectTargets']),
    Targetchange(val) {
      console.log(val)
      this.setRunSetingSelectTargets(val)
      console.log(this.runSetingSelectTargets)
    }
  }
})
</script>
<style lang="scss" scoped>
@import "../global.scss";
</style>
