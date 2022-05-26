<template>
  <div class="settingNaviBox" ref="naviTitleRef">
    <h2 class="mb-2">默认设置</h2>
    <el-scrollbar class="scrollbarBox" :height="height" always>
       <el-tabs
        class="demo-tabs"
        v-model="addid"
        :tab-position="'left'"
        @tab-click="showRightContent"
      >
        <el-tab-pane
          v-for="item in arraySubMenu"
          :key="item.id"
          :label="item.title"
          :name="item.id"
        >
        </el-tab-pane>
      </el-tabs>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts" name="setup">
import { arraySubMenu, arrNode, showRightContent, addids } from '../../config/setupNavi'
import { ref, onMounted, nextTick, watch } from 'vue'
import ElementResizeDetectorMaker from 'element-resize-detector'
const addid = ref<number>(0)
const naviTitleRef = ref<HTMLElement>()
const height = ref<number>(0)

const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(naviTitleRef.value as HTMLElement, (element: HTMLElement) => {
    height.value = element.offsetHeight
  })
}
watch(() => addid.value, (newvalue) => {
  addids.value = newvalue
})
// init
onMounted(() => nextTick(() => initData()))
const initData = () => {
  onHeight()
}

</script>

<style lang=scss scoped>
@import "../../scss/navi.scss";
</style>
