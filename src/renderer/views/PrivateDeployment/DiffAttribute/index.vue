<template>
  <div class="attribute-box" ref="attribute">
    <el-scrollbar class="scrollbar-box" :height="height">
      <div class="title-bar">
        <i :class="['icon', selectedItem?.icon]" />
        <span class="title">{{ selectedItem.title }}</span>
      </div>
      <component :is="selectedItem.component" class="form" label-width="80px" />
    </el-scrollbar>
  </div>
</template>
<script lang="ts" setup name="DiffAttribute">
import { ref, onMounted, nextTick, computed } from 'vue'
import ElementResizeDetectorMaker from 'element-resize-detector'
import { getPropertyType } from '@/utils'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import ModelBasicInfoForm from './ModelBasicInfoForm.vue'
import BlockBasicInfoForm from './BlockBasicInfoForm.vue'
import VariableForm from './VariableForm.vue'
import SeriesForm from './SeriesForm.vue'
import LinkForm from './LinkForm.vue'
import MethodForm from './MethodForm.vue'
import { useStore } from 'vuex'

const store = useStore()
const height = ref(0)
const attribute = ref<HTMLElement>()

const selectedItem = computed(() => {
  const currentProperty = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode
  if (!currentProperty) {
    if (!currentModelNode) {
      return {
        title: '属性',
        icon: 'setting',
        component: 'el-empty'
      }
    }
    if (!currentModelNode.modelId) {
      return {
        title: '模型基础属性',
        icon: 'setting',
        component: ModelBasicInfoForm
      }
    }
    return {
      title: '模块/子模块',
      icon: 'setting',
      component: BlockBasicInfoForm
    }
  }
  const type = getPropertyType(currentProperty)
  if (type === PropertyType.links) {
    return {
      title: '链接属性',
      icon: 'setting',
      component: LinkForm
    }
  } else if (type === PropertyType.methods) {
    return {
      title: '方法属性',
      icon: 'setting',
      component: MethodForm
    }
  } else if (type === PropertyType.variables) {
    return {
      title: '变量属性',
      icon: 'setting',
      component: VariableForm
    }
  } else {
    return {
      title: '序列属性',
      icon: 'setting',
      component: SeriesForm
    }
  }
})

const onHeight = () => {
  const Erd = ElementResizeDetectorMaker()
  Erd.listenTo(attribute.value as HTMLElement, (element: HTMLElement) => {
    height.value = element.offsetHeight
  })
}

onMounted(() => nextTick(() => onHeight()))
</script>
<style lang="scss" scoped>
.attribute-box {
  display: flex;
  width: 100%;
  height: calc(100% - 74px);
  .scrollbar-box {
    display: flex;
    width: 100%;
    &:deep(.el-scrollbar__wrap) {
      width: 100%;
    }
    .title-bar {
      flex: 0 0 auto;
      padding: 0 10px;
      height: 42px;
      line-height: 42px;
      font-weight: 600;
      .icon {
        margin-right: 4px;
      }
      .title {
        font-size: 14px;
      }
    }

    .form {
      padding: 0px 20px 40px 20px;
      flex: 1 1 auto;
    }
  }
}
</style>
