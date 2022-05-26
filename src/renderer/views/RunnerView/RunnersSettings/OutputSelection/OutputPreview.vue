<template>
  <div class="preview pane-content" v-show="outputsTabsList.data.length > 0">
    <h4 id="side-content-title">输出预览</h4>
    <div class="">
      <el-tabs
        type="card"
        @tab-click="previewTabsHandle"
        v-model="outputsTabsSelect"
      >
        <el-tab-pane
          v-for="item in outputsTabsList.data"
          :key="item.id"
          :label="item.name"
          :name="item.id.toString()"
        >
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="outputToPreview.value">
      <div class="preview-item">
        <span class="label">名称</span>
        <span class="value">{{ outputToPreview.value.name }}</span>
      </div>
      <div class="preview-item">
        <span class="label">目标链接</span>
        <span class="value">{{ linkChainOfOutputToPreview }}</span>
      </div>
      <div class="preview-item">
        <span class="label">已选序列</span>
        <ul class="value series-list">
          <li v-for="item in outputToPreview.value.series" :key="item.id">
            {{ item.name }}
          </li>
        </ul>
      </div>
      <div class="preview-item">
        <span class="label">Periods</span>
        <span class="value"
          >{{ outputToPreview.value.periodFrom }} -
          {{ outputToPreview.value.periodTo }}</span
        >
      </div>
      <div class="preview-item">
        <span class="label">Block Copy</span>
        <span class="value">{{
          outputToPreview.value.blockCopy ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Block Depth</span>
        <span class="value">{{
          outputToPreview.value.blockDepth ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Series Copy</span>
        <span class="value">{{
          outputToPreview.value.seriesCopy ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Series Depth</span>
        <span class="value">{{
          outputToPreview.value.seriesDepth ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Separate Copy Page</span>
        <span class="value">{{
          outputToPreview.value.separateCopyPage ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">File Separate By Copy</span>
        <span class="value">{{
          outputToPreview.value.fileSeparateByCopy ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">File Separate By Node</span>
        <span class="value">{{
          outputToPreview.value.fileSeparateByNode ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">File Separate By Depth</span>
        <span class="value">{{
          outputToPreview.value.fileSeparateByDepth ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Output All Levels</span>
        <span class="value">{{
          outputToPreview.value.outputAllLevels ? "是" : "否"
        }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Block Copy Min Level</span>
        <span class="value">{{ outputToPreview.value.blockCopyMinLevel }}</span>
      </div>
      <div class="preview-item">
        <span class="label">Block Copy Max Level</span>
        <span class="value">{{ outputToPreview.value.blockCopyMaxLevel }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="OutputPreview">
import { reactive, computed, watch, ref } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const currentRunner = store.getters['runs/currentRunner']
const outputIdMap = store.getters['outputs/outputIdMap']
const outputToPreview: any = reactive({})
const outputsTabsList: any = reactive({ data: [] })
const outputsTabsSelect = ref('0')
const linkChainOfOutputToPreview: any = computed(() => {
  if (!outputToPreview.value?.linkChain) return ''
  return outputToPreview.value.linkChain.map((item: any) => {
    return item.split('->')[0]
  }).join(' -> ')
})
const runSetingSelectOutputs = ref(computed(() => {
  return store.state.runs.runSetingSelectOutputs
}))
const initData = (curId) => {
  outputToPreview.value = null
  outputToPreview.value = outputIdMap.get(parseInt(curId)) ?? null
}
const initOutputsTabsListData = () => {
  outputsTabsList.data = []
  if (runSetingSelectOutputs.value && runSetingSelectOutputs.value.length > 0) {
    runSetingSelectOutputs.value.map(itemId => {
      if (outputIdMap.get(itemId)?.name !== undefined) {
        outputsTabsList.data.push({
          id: itemId,
          name: outputIdMap.get(itemId)?.name
        })
      }
    })
    outputsTabsSelect.value = runSetingSelectOutputs.value[runSetingSelectOutputs.value.length - 1].toString()
    initData(outputsTabsSelect.value)
  }
}
const previewTabsHandle = () => {
  initData(outputsTabsSelect.value)
}
initOutputsTabsListData()

watch(() => runSetingSelectOutputs.value, () => {
  initOutputsTabsListData()
})
</script>
<style lang="scss" scoped>
@import "../global.scss";
.series-list {
  list-style: none;
  padding: 0;
}
</style>
