<template>
  <div class="property-box">
    <el-empty v-if="!currentNavigation.value" style="height: 100%" />
    <div v-show="currentNavigation.value === 3" class="file-table">
      <FileTable :currFile="currFile" />
    </div>
    <div style="height: 100%" v-show="currentNavigation.value === 1">
      <div class="button-group">
        <el-button
          v-for="item in ButtonGroup"
          :key="item.value"
          :type="item.type"
          :icon="item.icon"
          :disabled="sessionLoading"
          @click="handleDrawer(item)"
        >
          {{ item.label }}</el-button
        >
      </div>
      <split-panel
        class="table-console"
        :main-pane-default-ratio="0.6"
        split-direction="vertical"
        :hide-side-pane="gettersHideConsole"
      >
        <template #main>
          <VariableTable
            ref="variableTableDom"
            :currFile="currFile"
            @createVariable="createVariable"
            @createSection="createSection"
            @handleDrawer="handleDrawer"
          />
        </template>
        <template #side>
          <UtilityViews />
        </template>
      </split-panel>
      <DrawerFrom
        ref="drawerFromDom"
        :drawerData="drawerData"
        :currFile="currFile"
        @createVariable="createVariable"
        @handleDrawer="handleDrawer"
      />
    </div>
  </div>
</template>
<script setup lang="ts" name="PropertyNavigation">
import { watch, reactive, computed, ref } from 'vue'
import { SplitPanel } from '@/views/components'
import { ButtonGroup, newColumnSection } from '../config'
import { FileAy } from '../types'
import { ElMessage } from 'element-plus'
import VariableTable from './VariableTable.vue'
import FileTable from './FileTable.vue'
import DrawerFrom from './DrawerFrom.vue'
import UtilityViews from '../UtilityViews/index.vue'
import { useStore } from 'vuex'
import { getTreeChildNode } from '@/utils'
import { ArrayToString, tableColumnWidth, SimplifieDrawerData, HTMLElementAny } from '@shared/dataModelTypes/assumptions'
import { log } from 'console'

const store = useStore()
const hasCalcFormula = store.getters['assumptionVar/gettersHideConsole']
const S = store.getters['assumptionVar/section']
const currentNavigation = computed(() => store.getters['navigation/currentNavigation'])
const flag = ref(false)
const gettersHideConsole = computed(() => store.getters['assumptionVar/gettersHideConsole'])
const props = defineProps<{ currModel: FileAy }>()
const curSelect: any = reactive({})
const hideAssumptionTbaleView = store.state.hideAssumptionTableNaviView
const variableTableDom = ref<null | HTMLElementAny>(null)
const drawerFromDom = ref<null | HTMLElementAny>(null)
const addSectionDisable = store.state.assumptionVar
// 当前选择文件
const currFile: any = reactive({
  value: {}
})

const drawerData: SimplifieDrawerData = reactive({
  drawer: false,
  direction: 'ltr'
})
const sessionLoading = computed<boolean>(() => {
  if (!currFile.value?.modelId) return true
  const S = store.getters['assumptionVar/section']
  return !!S.filter((item: any) => !item.label).length
})
// 新建table数据
const handleDrawer = (currItem: any) => {
  if (currItem.value) {
    if (addSectionDisable.isAddSectionInputs) {
      setSectionVX()
    } else {
      ElMessage({
        message: '不能为空',
        type: 'error'
      })
    }
  } else {
    drawerData.drawer = currItem.drawer
  }
}

const createVariable = (data: any, callback?:any) => {
  const H = JSON.parse(JSON.stringify(data.form))
  H.source = data.treeIds.join(ArrayToString)
  H.pageId = currFile.value.id
  H.modelId = currFile.value.modelId
  const path = data.form.id ? 'assumptionVar/updateVariableInputsWithDBSync' : 'assumptionVar/addVariableInputsWithDBSync'
  store.dispatch(path, H).then(id => {
    const arr = drawerFromDom.value && drawerFromDom.value.TreeData.arr
    const treeData = arr || []
    treeData.forEach((item: any) => {
      item.children.forEach((iter: any) => {
        if (H.source.indexOf(iter.id) !== -1) {
          iter.assumptionBind = {
            pageId: currFile.value.id,
            variableId: data.variableId || id || data.form.id
          }
        } else if (iter?.assumptionBind?.pageId === currFile.value.id && iter?.assumptionBind?.variableId === data.variableId) {
          iter.assumptionBind = undefined
        } else {
          iter.assumptionBind = iter.assumptionBind || undefined
        }
      })
    })
    store.dispatch('assumptionVar/updateBlockVariableWithDBSync', treeData)
    callback && callback()
  })
}

const createSection = async (data: any, callback?:any) => {
  const H = JSON.parse(JSON.stringify(data))
  const path = data.id ? 'assumptionVar/updateSectionInputsWithDBSync' : 'assumptionVar/addSectionInputsWithDBSync'
  await store.dispatch(path, data)
  callback && callback()
}

const setSectionVX = () => {
  store.commit('assumptionVar/addSectionInputs', newColumnSection)
  variableTableDom.value && variableTableDom.value.addSectionScroll()
}

watch(props, (newValue) => {
  const G = JSON.parse(JSON.stringify(newValue.currModel.value))
  currFile.value = G
})
watch(S, (newValue) => {
  const r = newValue.filter((item: any) => !item.label)
  const l = r.length
  flag.value = !!l
})

</script>
<style lang="scss" scoped>
.property-box {
  padding: 10px;
  height: 100%;
  width: 100%;
  .file-table {
    height: 100%;
    width: 100%;
  }
  .table-console {
    display: flex;
    width: 100%;
    height: calc(100% - 51px);
    flex-direction: column;
  }
}
</style>
