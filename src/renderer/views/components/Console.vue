<template>
  <el-empty v-show="!taskTabs.length" style="height: 100%" />
  <el-tabs
    v-show="taskTabs.length"
    :model-value="currentTaskId"
    type="card"
    class="console-tabs"
    closable
    @tab-remove="taskId => changeTab(taskId, 'clearPrintLines')"
    @tab-click="pane => changeTab(pane.paneName, 'updateCurrentTaskId')"
  >
    <el-tab-pane
      v-for="item in taskTabs"
      :key="item.taskId"
      :label="item.label"
      :name="item.taskId"
    >
    </el-tab-pane>
  </el-tabs>
  <div v-show="taskTabs.length" class="content-box"  ref="contentRef">
    <el-scrollbar ref="scrollRef" class="scrollbar-box" :height="height">
      <ul class="inner-box" ref="innerRef">
        <li class="feedLine" v-for="(line, index) in printLines[currentTaskId]" :key="index" v-html="escapeHTML(line)" />
      </ul>
    </el-scrollbar>
  </div>
</template>
<script setup lang=ts>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import ElementResizeDetectorMaker from 'element-resize-detector'
import type { ElScrollbar } from 'element-plus'
const store = useStore()
const taskTabs = computed(() => store.state.tasks.tasks)
const printLines = computed(() => store.state.tasks.printLines)
const currentTaskId = computed(() => store.state.tasks.currentTaskId)

function escapeHTML(line: string): string {
  return line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const changeTab = (taskId: string, path:string) =>
  store.commit(`tasks/${path}`, taskId)

// dynamic scroll height
const contentRef = ref<HTMLElement>()
const height = ref<number>(0)
const scrollRef = ref<InstanceType<typeof ElScrollbar>>()
const innerRef = ref<HTMLElement>()
const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(contentRef.value as HTMLElement, (element: HTMLElement) =>
    (height.value = element.offsetHeight))
  Erd.listenTo(innerRef.value as HTMLElement, (element: HTMLElement) =>
    scrollRef.value!.setScrollTop(innerRef.value!.clientHeight))
}

// init
onMounted(() => nextTick(() => initData()))
const initData = () => onHeight()

</script>
<style lang="scss" scoped>
@import './scss/console.scss';
</style>
