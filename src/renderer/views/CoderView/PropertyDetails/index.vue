<template>
  <div id="property-details"  ref="propertyRef">
    <el-scrollbar ref="scrollRef" class="scrollbar-box" :height="height">
      <div class="title-bar">
        <el-icon class="icon">
          <component :is="selectedItem.icon"/>
        </el-icon>
        <span class="title">{{ selectedItem.title }}</span>
      </div>
      <component :is="selectedItem.component" class="form" label-width="80px" />
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { Component, defineComponent } from 'vue'
import ModelBasicInfoForm from './ModelBasicInfoForm.vue'
import BlockBasicInfoForm from './BlockBasicInfoForm.vue'
import VariableForm from './VariableForm.vue'
import SeriesForm from './SeriesForm.vue'
import LinkForm from './LinkForm.vue'
import CodeIndexForm from './CodeIndexForm.vue'
import MethodForm from './MethodForm.vue'
import { createNamespacedHelpers } from 'vuex'
import { getPropertyType } from '../../../utils'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import ElementResizeDetectorMaker from 'element-resize-detector'
const { mapState } = createNamespacedHelpers('models/')
const { mapState: mapCodeIndexState } = createNamespacedHelpers('codeIndex/')
interface SelectedItem {
  title: string
  icon: string
  component: Component
}

export default defineComponent({
  components: {
    ModelBasicInfoForm, BlockBasicInfoForm, VariableForm, SeriesForm, LinkForm, MethodForm
  },
  computed: {
    ...mapState(['currentProperty', 'currentModelNode']),
    ...mapCodeIndexState(['currentCodeIndex']),
    selectedItem(): SelectedItem {
      if ((!this.currentProperty && !this.currentCodeIndex)) {
        if (!this.currentModelNode) {
          return {
            title: '属性',
            icon: 'setting',
            component: 'el-empty'
          }
        }
        if (!this.currentModelNode.modelId) {
          return {
            title: '模型基础属性',
            icon: 'setting',
            component: ModelBasicInfoForm
          }
        }
        return {
          title: '模块/子模块基础属性',
          icon: 'setting',
          component: BlockBasicInfoForm
        }
      }

      if (this.currentProperty) {
        const type = getPropertyType(this.currentProperty)
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
      } else {
        return {
          title: '代码索引',
          icon: 'setting',
          component: CodeIndexForm
        }
      }
    }
  },
  data() {
    return {
      height: 0
    }
  },
  methods: {
    onHeight() {
      const Erd = ElementResizeDetectorMaker()
      Erd.listenTo(this.$refs.propertyRef as HTMLElement, (element: HTMLElement) => {
        this.height = element.offsetHeight
      })
    }
  },
  mounted() {
    const { onHeight } = this
    onHeight()
  }
})
</script>

<style lang="scss" scoped>
#property-details {
  // border-left: 1px solid #D0D0D0;
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  // overflow-y: scroll;
  .scrollbar-box{
    width: 100%;
  }
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
  padding: 20px 20px 40px 20px;
  flex: 1 1 auto;
}
</style>
