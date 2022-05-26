<template>
    <div class="drawer-box">
      <el-drawer
          title="新增变量"
          :model-value="visible"
          :direction="props.drawerData.direction"
          :before-close="handleClose">
          <div class="con-box">
            <Form v-if="props.drawerData.drawer" ref="refFormDom" class="form-box" :formDataSources="formData.arr" :formSources="currForm"/>
            <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
            <el-tree
              ref="refTreeDom"
              class="tree-box"
              :data="TreeData.arr"
              show-checkbox
              node-key="id"
              :filter-node-method="filterNode"
              :default-checked-keys="defaultCheckedKeys.arr"
              :props="defaultProps"
              :default-expand-all="true"
            >
            </el-tree>
          </div>
          <div class="button-group">
            <el-button
                v-for="item in SectionButtonGroup"
                :key="item.value"
                :type="item.type"
                :size="item.size"
                @click="handleClick(item)"
                >
                {{ item.label }}</el-button>
        </div>
      </el-drawer>
    </div>
</template>
<script setup lang=ts name="DrawerFrom">
import { watch, ref, reactive, computed } from 'vue'
import { Form } from '@/views/components'
import { formDataVariable, SectionButtonGroup, defaultProps } from '../config'
import { useStore } from 'vuex'
import { HTMLElementAny, ArrayToString, CheckedHalflimiter } from '@shared/dataModelTypes/assumptions'
import { sectionData } from '../types'
import { filterNavigationTree } from '../config/combination'

const props = defineProps<{ drawerData: any, currFile:any }>()

const emit = defineEmits(['handleDrawer', 'createVariable'])

const store = useStore()

const filterText = ref('')

const currForm = computed(() => store.getters['assumptionVar/currVariable'])

const visible = computed(() => props.drawerData.drawer)

const TreeData:any = reactive({
  arr: []
})

const defaultCheckedKeys:any = reactive({
  arr: []
})

const refFormDom = ref<null | HTMLElementAny>(null)

const refTreeDom = ref<null | HTMLElementAny>(null)

const formData:any = reactive({
  arr: formDataVariable
})

const handleClose = () => {
  emit('handleDrawer', { drawer: false })
}

const handleClick = async (currItem:sectionData) => {
  if (currItem.value) {
    refFormDom.value.validateFn(() => {
      const obj = {
        variableId: currForm.value.id,
        form: refFormDom.value ? refFormDom.value.form : {},
        treeIds: getCheckedHalfKeys()
      }
      emit('createVariable', obj)
      handleClose()
    })
  } else {
    handleClose()
  }
}

const getCheckedHalfKeys = () => {
  return refTreeDom.value && refTreeDom.value.getCheckedKeys()
}

const filterNode = (value:any, data:any) => {
  if (!value) return true
  return data.name.indexOf(value) !== -1
}

watch(filterText, (newValue) => {
  refTreeDom.value && refTreeDom.value.filter(newValue)
})

watch(() => props.drawerData.drawer, async (flag) => {
  if (flag) {
    const modelId = props.currFile.value.modelId
    const fileid = props.currFile.value.id
    const formId = currForm.value.id
    TreeData.arr = await filterNavigationTree(modelId, fileid, formId)
    const source = currForm?.value?.source?.split(ArrayToString) ?? []
    defaultCheckedKeys.arr = source.map((item:any) => typeof (item) === 'string' ? item.split(CheckedHalflimiter)[0] : item)
  } else {
    defaultCheckedKeys.arr = []
    store.commit('assumptionVar/addCurrVariable', {})
  }
})

defineExpose({ TreeData })
</script>
<style lang="scss" scoped>
@import '../scss/DrawerFrom.scss';
</style>
