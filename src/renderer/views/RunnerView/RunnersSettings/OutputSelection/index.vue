<template>
  <split-panel
    split-direction="horizontal"
    :main-pane-default-ratio="0.4"
    :mainPaneMinimumRatio="0.3"
  >
    <template #main>
      <el-form class="pane-content">
        <el-form-item class="form-item" label="选择输出">
          <el-select
            v-model="runSetingSelectOutputs"
            multiple
            @change="Outputchange"
          >
            <el-option
              v-for="option in outputOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <!-- <el-button
            type="primary"
            style="margin: 0 20px"
            @click="() => (isComponentId = 'ImportOutputPreview')"
            disabled
            >新建输出</el-button
          > -->
        </el-form-item>
        <el-form-item label="输出分组">
          <el-select
            v-model="currentRunner.groupSeparators"
            filterable
            allow-create
            multiple
            placeholder="选择分组规则"
          >
            <el-option
              v-for="option in groupSeparatorOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </template>
    <template #side>
      <div style="border-left: 1px solid #d0d0d0; height: 100%">
        <component
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
import OutputPreview from './OutputPreview.vue'
import ImportOutputPreview from '@/views/OutputView/index.vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { dataInputBlockIDDelimiter } from '@shared/dataModelTypes/dataInputs'
import { Output } from '@shared/dataModelTypes/runs/outputs'
import { clone } from '@shared/functional'
const { mapState: mapRunsState, mapMutations } = createNamespacedHelpers('runs/')
const { mapGetters: mapOutputsGetters } = createNamespacedHelpers('outputs/')

export default defineComponent({
  components: { SplitPanel, OutputPreview, ImportOutputPreview },
  data() {
    return {
      isComponentId: 'OutputPreview'
    }
  },
  computed: {
    ...mapRunsState(['currentRunner', 'runSetingSelectOutputs']),
    ...mapOutputsGetters(['outputModelIdMap', 'outputIdMap']),

    outputOptions() {
      if (!this.currentRunner.modelId) return []
      const outputs = this.outputModelIdMap.get(this.currentRunner.modelId) ?? []
      return outputs.map((o: Output) => {
        return { value: o.id, label: o.name }
      }).filter((o: { value: number, label: string }) => o.value)
    },
    groupSeparatorOptions(): { label: string, value: string }[] {
      if (!this.currentRunner.modelId) return []
      const dataMappingItems = modelsDataSource.getDataMappingItemsForAModel(this.currentRunner.modelId)
      const options = dataMappingItems.map(item => {
        return { label: item.name, value: item.blockId + dataInputBlockIDDelimiter + item.name }
      })
      return options
    }
  },
  watch: {
    currentRunner: {
      handler() {
        this.isComponentId = 'OutputPreview'
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations(['setRunSetingSelectOutputs']),
    Outputchange(val) {
      this.setRunSetingSelectOutputs(val)
    }
  }
})
</script>
<style lang="scss" scoped>
@import "../global.scss";
</style>
