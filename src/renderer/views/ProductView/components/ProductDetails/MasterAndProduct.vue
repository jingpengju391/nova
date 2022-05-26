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
        <div class="set-box" :style="{ height: contentHeight + 'px' }">
          <div class="title-bar" v-if="currentMasterNode">
            <el-icon class="icon">
              <component :is="selectedItem.icon"/>
            </el-icon>
            <span class="title" v-if="currentMasterNode" >{{ selectedItem.title }}</span>
          </div>
          <div class="form-box">
            <master-product-form v-if="currentMasterNode" :formDataSources="isMaster ? masterFormData : productFormData" :formSources="formSources"/>
            <el-empty v-else description="暂无数据" />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script setup lang=ts name="MasterAndProduct">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { useStore } from 'vuex'
import { Form as MasterProductForm } from '@/views/components'
import { masterFormData, productFormData, currentCollapse } from '../../config'
import { getMasterNavigationNodeIdAndType, MasterNodeType } from '@/utils'
import { basic, transmit, calcHeight } from '@/views/CoderView/config'
import { AnchorProduct, Product } from '@shared/dataModelTypes/product/products'
import masterDataSource from '@/store/modules/masterDataSource'
import ElementResizeDetectorMaker from 'element-resize-detector'
const store = useStore()
const currentMasterNode = computed(() => store.state.masters.currentMasterNode)
const isMaster = computed(() => {
  const { id, type } = getMasterNavigationNodeIdAndType(currentMasterNode.value.id)
  return type === MasterNodeType.master
})
const formSources = computed(() => {
  let sources:AnchorProduct | Product
  const { id, type } = getMasterNavigationNodeIdAndType(currentMasterNode.value.id)
  if (type === MasterNodeType.master) {
    sources = masterDataSource.getCompleteMaster(id)
  } else {
    sources = masterDataSource.getCompleteProduct(currentMasterNode.value.id)
  }
  return sources
})

const collapses = computed(() => [basic])
const collapseNavigation = ref<HTMLElement>()
const contentHeight = ref<number>(0)
const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(collapseNavigation.value as HTMLElement, (element: HTMLElement) => {
    contentHeight.value = calcHeight(element, collapses.value)
  })
}
const selectedItem = computed(() => {
  if (isMaster.value) {
    return {
      title: 'master基础属性',
      icon: 'setting'
    }
  }
  return {
    title: 'product基础属性',
    icon: 'setting'
  }
})
onMounted(() => nextTick(() => onHeight()))
</script>
<style lang="scss" scoped>
@import '../../../CoderView/scss/collapse-navigation.scss';
.set-box{
  display: flex;
  flex-direction:column;
  width: 100%;
  .title-bar{
    display: flex;
    align-items: center;
    font-size: 14px;
    flex: 0 0 auto;
    padding: 0 10px;
    height: 42px;
    line-height: 42px;
    font-weight: 600;
    .icon{
      margin-right: 4px;
    }
  }
  .form-box{
    padding: 20px 20px 40px 20px;
    flex: 1 1 auto;
  }
}
</style>
