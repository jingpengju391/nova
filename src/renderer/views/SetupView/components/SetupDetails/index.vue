<template>
  <div ref="detailBoxRef" class="detailBox">
    <el-scrollbar
      class="setDetailScoll"
      always
      ref="scrollbarRef"
      :height="height"
    >
      <component
        v-for="item in arraySubMenu"
        :key="item.id"
        :is="item.componentId"
        :formDataSources="item.comporentData"
      >
      </component>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts" name="setup">
import { arraySubMenu, scrollTop } from '../../config/setupNavi'
import { ref, watch, nextTick, onMounted } from 'vue'
import type { ElScrollbar } from 'element-plus'
import ElementResizeDetectorMaker from 'element-resize-detector'

const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const detailBoxRef = ref<HTMLElement>()
const height = ref<number>(0)

watch(() => scrollTop.value, newValue => {
  nextTick(() => scrollbarRef.value!.setScrollTop(newValue))
})

const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(detailBoxRef.value as HTMLElement, (element: HTMLElement) => {
    height.value = element.offsetHeight - 100
  })
}

// init
onMounted(() => nextTick(() => initData()))
const initData = () => {
  onHeight()
}

</script>

<style lang=scss scoped>
.detailBox {
  width: 100%;
  height: 100vh;
  .setDetailScoll {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}
</style>
