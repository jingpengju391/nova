<template>
  <ul class="Global-Search-Replace-Item-Variable">
    <li @click="isHide = !isHide">
      <el-icon :class="isHide ? 'active' : ''" color="#adadad" :size="18"><caret-bottom/></el-icon>
      <el-icon color="#fecf80" :size="18"><expand /></el-icon>
      <span class="block-name">{{ props.variable.name }}</span>
      <span class="path">{{ props.variable.path }}</span>
    </li>
    <li v-show="!isHide" :class=" currMonacoModels?.monacoModelId === props?.variable?.monacoModelId ? 'activeFormula' : '' "
      @click="handleClick"
    >
      <span>{{ htmlValue[0] }}</span>
      <span
        :class="
          replaceValue && !hideReplace
            ? 'through-search-text search-text'
            : 'search-text'
        "
        >{{ htmlValue[1] }}</span
      >
      <span v-if="replaceValue && !hideReplace">{{ replaceValue }}</span>
      <span>{{ htmlValue[2] }}</span>
    </li>
  </ul>
</template>

<script setup lang=ts name="ItemVariable">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
// import { selectProperty } from './item-variable'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { getParentKeysAndKeys } from '@/store/modules/globalSearchReplaceSource'
import { ElMessage } from 'element-plus'
import { ModelNodeType } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { source } from '../config'
const store = useStore()
const props = defineProps<{ variable: any }>()
const isHide = ref(false)
const hideReplace = computed(() => store.getters['globalSearchReplace/gettersHideReplace'])
const replaceValue = computed(() => store.getters['globalSearchReplace/gettersReplaceValue'])
const currMonacoModels = computed(() => store.getters['globalSearchReplace/gettersCurrMonacoModels'])
const matchPath = computed(() => store.state.globalSearchReplace.matchPath)
const currentModelNode = computed(() => store.state.models.currentModelNode)

const htmlValue = computed(() => {
  const text = props.variable.text
  const startColumn = props.variable.range.startColumn - 1
  const endColumn = props.variable.range.endColumn - 1
  const pre = text.substring(0, startColumn)
  const middle = text.substring(startColumn, endColumn)
  const next = text.substring(endColumn, text.length)
  return [pre, middle, next]
})

const handleClick = () => {
  store.commit('globalSearchReplace/updateCurrMonacoModels', props.variable)
  let blockId
  if (props.variable.keys.length < 3) {
    ElMessage.error('索引解析错误！')
  }
  const { keys, parentKeys } = getParentKeysAndKeys(props.variable.keys)
  const modelBlock = parentKeys.reduce((newObj, key) => newObj[key], source)
  if (modelBlock) blockId = modelBlock.id
  store.dispatch('models/selectProperty', {
    id: keys[1],
    type: keys[0],
    key: keys[2],
    blockId
  })
}
</script>
<style lang="scss" scoped>
@import "../scss/item-variable.scss";
</style>
<style>
.h-l:hover {
  background: #d4d4d4;
}
</style>
