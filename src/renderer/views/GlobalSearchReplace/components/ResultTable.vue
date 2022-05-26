<template>
  <vxe-table
    class="result-table"
    :loading="loading"
    show-overflow
    :row-config="{isCurrent: true, isHover: true}"
    :column-config="{resizable: true}"
    :data="monacoModels"
    :height="variableHeight"
    @cell-click="handleClick"
  >
    <vxe-column
      v-for="column in columns"
      :key="column.key"
      :field="column.field"
      :title="column.title"
      :type="column.type"
      :sortable="column.sortable"
      :filters="column.filters"
      :filter-method="filterNameMethod"
      :formatter="column.formatter"
    >
    </vxe-column>
  </vxe-table>
</template>
<script lang=ts setup>
import { columns, variableHeight, variableWidth, onScroll, source, highlightKeyword, filterNameMethod, loading, selects, propertyType } from '../config'
import { computed, watch, ref, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { getParentKeysAndKeys } from '@/store/modules/globalSearchReplaceSource'
import { updatedModelBlockByBlockId } from '@/store/baseModules'
import { code } from '@shared/PrivateDeployment'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { onCodeIndexSelected } from '@/views/CoderView/config'
import { ModelNavigationNodeType } from '@shared/dataModelTypes/models/models'
const replaceValue = computed(() => store.getters['globalSearchReplace/gettersReplaceValue'])
const searchValue = computed(() => store.getters['globalSearchReplace/gettersSearchValue'])
const store = useStore()
const monacoModels = computed(() => {
  return store.getters['globalSearchReplace/gettersMonacoModels'].map((item, index) => {
    const keyStr = code.includes(item.key) ? 'formula' : item.key
    return {
      id: index.toString(),
      ...item,
      [keyStr]: highlightKeyword(item, replaceValue.value)
    }
  })
})

const handleClick = cell => {
  store.commit('globalSearchReplace/updateCurrMonacoModels', cell.row)
  let blockId = store.state.globalSearchReplace.matchPath ? source?.id : undefined
  const { keys, parentKeys } = getParentKeysAndKeys(cell.row.keys)
  const modelBlock = parentKeys.reduce((newObj, key) => newObj[key], source)
  if (modelBlock && modelBlock.id) blockId = modelBlock.id
  const findIndex = propertyType.findIndex(p => p.value === cell.row.type)
  if (findIndex !== -1) {
    store.dispatch('models/selectProperty', {
      id: keys[1],
      type: keys[0],
      key: keys[2],
      blockId
    })
    return
  }

  if (cell.row.type === selects[1].options[0].value) {
    const type = modelBlock.modelId ? ModelNavigationNodeType.modelBlocks : ModelNavigationNodeType.models
    updatedModelBlockByBlockId(blockId, type)
  }

  if (cell.row.type === selects[1].options[2].value) {
    const model = modelsDataSource.getCompleteModel(modelBlock.modelId)
    onCodeIndexSelected(modelBlock, model)
  }
}
</script>
<style lang="scss" scoped>
@import "../scss/result-table.scss";
</style>
