<template>
  <div class="preview pane-content" v-show="targetTabsList.data.length > 0">
    <h4 id="side-content-title">目标预览</h4>
    <div class="">
      <el-tabs
        type="card"
        @tab-click="previewTabsHandle"
        v-model="targetTabsSelect"
      >
        <el-tab-pane
          v-for="item in targetTabsList.data"
          :key="item.id"
          :label="item.name"
          :name="item.id.toString()"
        >
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-if="targetToPreview">
      <div class="preview-item">
        <span class="label">名称</span>
        <span class="value">{{ targetToPreview.value?.name }}</span>
      </div>
      <div class="preview-item">
        <span class="label">目标链接</span>
        <span class="value">{{ linkChainOfTargetToPreview }}</span>
      </div>
      <div class="preview-item">
        <span class="label">已选变量/序列</span>
        <el-table
          class="value"
          :data="targetToPreview?.value?.variablesAndSeries ?? []"
          :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
        >
          <el-table-column
            v-for="column in vsTableColumns"
            :key="column.prop"
            :prop="column.prop"
            :label="column.label"
          />
        </el-table>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts" name="TargetPreview">
import { reactive, computed, watch, ref } from 'vue'
import { useStore } from 'vuex'
import { vsTableColumns } from './config'
const store = useStore()
const currentRunner = store.getters['runs/currentRunner']
const targetIdMap = store.getters['runs/targetIdMap']
const runSetingSelectTargets = ref(computed(() => {
  return store.state.runs.runSetingSelectTargets
}))
const targetToPreview: any = reactive({})
const targetTabsList: any = reactive({ data: [] })
const targetTabsSelect = ref('0')
const linkChainOfTargetToPreview: any = computed(() => {
  if (!targetToPreview.value) return ''
  return targetToPreview.value.linkChain.map((item: any) => {
    return item.split('->')[0]
  }).join(' -> ')
})
const initData = (curId) => {
  targetToPreview.value = null
  targetToPreview.value = targetIdMap.get(parseInt(curId)) ?? null
  // targetToPreview.value = null
}
const initTargetTabsListData = () => {
  targetTabsList.data = []
  console.log(runSetingSelectTargets)
  if (runSetingSelectTargets.value && runSetingSelectTargets.value.length > 0) {
    runSetingSelectTargets.value.map((itemId, index) => {
      if (targetIdMap.get(itemId)?.name !== undefined) {
        targetTabsList.data.push({
          id: itemId,
          name: targetIdMap.get(itemId)?.name || ''
        })
      } else {
        // currentRunner.targets.splice(index, 1)
      }
    })
    targetTabsSelect.value = runSetingSelectTargets.value[runSetingSelectTargets.value.length - 1].toString()
    initData(targetTabsSelect.value)
  }
}
initTargetTabsListData()
// initData()
const previewTabsHandle = (targetName, event) => {
  initData(targetTabsSelect.value)
}

watch(() => runSetingSelectTargets.value, (newVal) => {
  console.log(newVal)
  initTargetTabsListData()
})

</script>
<style lang="scss" scoped>
@import "../global.scss";
.preview {
  height: 100%;
  width: 100%;
}
</style>
