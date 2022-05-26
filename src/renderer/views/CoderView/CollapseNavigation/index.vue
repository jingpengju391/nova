<template>
  <div class="collapse-box" ref="collapseNavigation">
    <el-collapse class="collapse-navigation" accordion v-model="currentCollapse">
      <el-collapse-item
        v-for="collapse in collapses"
        :key="collapse.value"
        :title="collapse.title"
        :name="collapse.value">
        <template #title>
          <i  class="iconfont" v-html="collapse.icon"></i>
          <span>{{collapse.title}}</span>
        </template>
        <div :style="{ height: contentHeight + 'px' }">
          <component :is="collapse.component" />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts" setup name="CollapseNavigation">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useStore } from 'vuex'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { currentCollapse, basic, transmit, calcHeight } from '../config'
import PropertyDetails from '../PropertyDetails/index.vue'
import TransmitDetails from '../TransmitDetails/index.vue'
import { getPropertyType } from '@/utils'
import { PropertyType, LinkSource } from '@shared/dataModelTypes/models/helpers'
const store = useStore()
const currentProperty = computed(() => store.state.models.currentProperty)
const collapseNavigation = ref<HTMLElement>()
const contentHeight = ref<number>(0)

const collapses = computed(() => {
  basic.component = PropertyDetails
  transmit.component = TransmitDetails
  if (!currentProperty.value) return [basic]
  const type = getPropertyType(currentProperty.value)
  return type === PropertyType.links && currentProperty.value.source === LinkSource.transmit ? [basic, transmit] : [basic]
})

const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(collapseNavigation.value as HTMLElement, (element: HTMLElement) => {
    contentHeight.value = calcHeight(element, collapses.value)
  })
}

watch(() => collapses.value, () => {
  contentHeight.value = collapseNavigation.value
    ? calcHeight(collapseNavigation.value, collapses.value) : 0
})

watch(() => currentProperty.value, () => {
  const collapse = collapses.value.filter((collapse) => collapse.value === currentCollapse.value)
  currentCollapse.value = collapse.length ? currentCollapse.value : '1'
})

onMounted(() => nextTick(() => onHeight()))
</script>
<style lang="scss" scoped>
@import '../scss/collapse-navigation.scss';
</style>
