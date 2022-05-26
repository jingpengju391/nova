<template>
  <div class="control-source-center" ref="ControlSourceCenter">
    <el-scrollbar :height="height">
      <div
        :class="
          diff?.original[1] === 'deleted'
            ? 'through-txt diff-list'
            : 'diff-list'
        "
        v-for="diff in diffList"
        :key="diff.id"
        @click="setCurrentDiffFormulaItems(diff)"
      >
        <el-icon><document-copy /></el-icon>
        <span class="name-txt">{{ diff.name }}</span>
        <span class="path-text">{{ path(diff) }}</span>
        <span :style="{ color: filter(diff.original).color }">{{
          filter(diff.original).value
        }}</span>
      </div>
      <el-empty v-if="!diffList.length" description="description"></el-empty>
    </el-scrollbar>
  </div>
</template>
<script setup lang="ts" name="source-control-center">
import { ref, onMounted, nextTick, computed } from 'vue'
import { setCurrentDiffFormulaItems, height } from '../config'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { useStore } from 'vuex'
import { dLink } from '@shared/dataModelTypes/models/links'

const store = useStore()

const ControlSourceCenter = ref<HTMLElement>()
const diffList = computed(() => store.state.privateDeployment.original)

const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(ControlSourceCenter.value as HTMLElement, (element: HTMLElement) => {
    height.value = element.offsetHeight
  })
}

const filter = (r: string[]) => {
  const obj = {
    value: 'M',
    color: '#e7be86'
  }

  switch (r[1]) {
    case 'deleted':
      obj.value = 'D'
      obj.color = '#f47869'
      break
    case 'created':
      obj.value = 'U'
      obj.color = '#54c78c'
      break
  }
  return obj
}

const path = (property: dLink) => {
  const OldObjModels = store.state.privateDeployment.originalModels
  const NewObjModels = store.state.privateDeployment.currentModels
  const Models = property.original[1] === 'deleted' ? OldObjModels : NewObjModels
  const pathArr: string[] = []
  try {
    property.original[0].split(' ').reduce((newObj, k) => {
      newObj[k].name && pathArr.push(newObj[k].name)
      return newObj[k]
    }, Models)
  } catch { }
  return pathArr.join('/')
}

onMounted(() => nextTick(() => onHeight()))
</script>
<style lang="scss" scoped>
@import "../scss/source-control-center.scss";
</style>
