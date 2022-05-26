<template>
   <div class="con-box">
    <search-range class="left-box" v-show="searchRange" />
    <div class="right-box" ref="conBox">
      <search-replace />
      <result-table />
      <!-- <el-scrollbar :height="variableHeight" ref="itemVariable" @scroll="scroll => onScroll(scroll, itemVariable)">
          <item-variable v-for="(item,index) in monacoModels" :key="index" :variable="{
            ...item,
            monacoModelId:item.model.id
          }" />
      </el-scrollbar> -->
    </div>
   </div>
</template>
<script setup lang=ts name="GlobalSearchReplace">
import { computed, watch, ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import ElementResizeDetectorMaker from 'element-resize-detector'
import SearchReplace from './components/SearchReplace.vue'
import ItemVariable from './components/ItemVariable.vue'
import SearchRange from './components/SearchRange.vue'
import ResultTable from './components/ResultTable.vue'
import { conBoxHeight, searchReplaceHeight, variableHeight, variableWidth, someContentToFind, onScroll, getUpdateData, updateMonacoModels } from './config'
const store = useStore()
const monacoModels = computed(() => store.getters['globalSearchReplace/gettersMonacoModels'])
const searchRange = computed(() => store.getters['globalSearchReplace/gettersSearchRange'])
const itemVariable = ref<HTMLElement>()

const conBox = ref<HTMLElement>()
const handleConBoxHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(conBox.value as HTMLElement, async (element: HTMLElement) => {
    conBoxHeight.value = element.offsetHeight
    variableWidth.value = element.offsetWidth
    const data = await getUpdateData()
    updateMonacoModels(data)
  })
}
watch(() => [conBoxHeight.value, searchReplaceHeight.value], _ => {
  variableHeight.value = conBoxHeight.value - searchReplaceHeight.value
})

onMounted(() => nextTick(() => handleConBoxHeight()))

const search = computed(() => store.getters['globalSearchReplace/gettersSearchValue'])
watch(() => search.value, _ => someContentToFind())

</script>
<style lang="scss" scoped>
   .con-box{
    width: 100%;
    height: calc(100% - 40px);
    display: flex;
    .left-box{
      width: 200px;
    }
    .right-box{
      flex-grow: 1;
      height: 100%;
      overflow-x:hidden;
    }
   }
</style>
