<template>
  <div class="add-property-dialog-box">
    <el-dialog
      title="新建属性"
      v-model="visible"
      destroy-on-close
      @close="closeDialog"
    >
      <div class="property-type-selector">
        <span
        v-if="!isRelation"
          :class="[
            'property-type-item',
            'variables',
            { checked: type === 'variables' },
          ]"
          @click="createProperty('variables')"
        >
          <el-icon class="icon"><ticket /></el-icon>
          <span>变量</span>
        </span>
        <span
        v-if="!isRelation"
          :class="[
            'property-type-item',
            'series',
            { checked: type === 'series' },
          ]"
          @click="createProperty('series')"
        >
          <el-icon class="icon"><comment /></el-icon>
          <span>序列</span>
        </span>
        <span
          :class="[
            'property-type-item',
            'links',
            { checked: type === 'links' },
          ]"
          @click="createProperty('links')"
        >
          <el-icon class="icon"><share /></el-icon>
          <span>链接</span>
        </span>
        <span
          v-if="!isRelation"
          :class="[
            'property-type-item',
            'methods',
            { checked: type === 'methods' },
          ]"
          @click="createProperty('methods')"
        >
          <el-icon class="icon"><Menu /></el-icon>
          <span>方法</span>
        </span>
      </div>
      <!-- <template #footer>
      <el-button style="margin-right: 8px" @click="visible = false"
        >取 消</el-button
      >
      <el-button
        style="margin-right: 8px"
        type="primary"
        @click="createProperty"
        >新 建</el-button
      >
    </template> -->
    </el-dialog>
    <add-property-form
      ref="AddVariableForm"
      :isRelation="isRelation"
      @closeCurType="closeCurType"
      :type1="curType"
    />
  </div>
</template>

<script lang="ts">
/* eslint-disable no-undef */
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { UnsavedPropertyExistsError } from '../../../errors'
import { propertyMixin, copyTypeOptionsMixin } from './../PropertyDetails/mixins'
import AddPropertyForm from './AddPropertyForm.vue'
const { mapActions: PropertyMapActions } = createNamespacedHelpers('models/')

export default defineComponent({
  props: {
    isRelation: {
      type: Boolean,
      required: false
    }
  },
  // mixins: [propertyMixin, copyTypeOptionsMixin],
  components: { AddPropertyForm },
  data() {
    return {
      visible: false,
      // type: 'variables'
      type: '',
      addVisible: false,
      curType: ''
    }
  },
  computed: {
    component() {
      console.log(this.type)
      return this.type
    }
  },
  methods: {
    ...PropertyMapActions(['addProperty']),
    closeDialog() {
      this.visible = false
      this.type = ''
    },
    closeCurType() {
      this.curType = ''
    },
    createProperty(type) {
      this.curType = type

      this.visible = false

      // this.addProperty(this.type).finally(() => {
      //   this.visible = false
      // }).catch(err => {
      //   if (err instanceof UnsavedPropertyExistsError) {
      //     this.$message.warning('当前存在新建的未保存变量/序列/链接/方法，请先对其设置')
      //   } else {
      //     this.$message.warning('未知错误')
      //   }
      // })
    },

    clickPropertySelector(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (target.classList.contains('variables') ||
        target.parentElement?.classList.contains('variables')) {
        this.type = 'variables'
      } else if (target.classList.contains('series') ||
        target.parentElement?.classList.contains('series')) {
        this.type = 'series'
      } else if (target.classList.contains('links') ||
        target.parentElement?.classList.contains('links')) {
        this.type = 'links'
      } else if (target.classList.contains('methods') ||
        target.parentElement?.classList.contains('methods')) {
        this.type = 'methods'
      }
    }

  }
})
</script>

<style lang="scss" scoped>
.add-property-dialog-box {
  &:deep(.el-dialog__body) {
    overflow: hidden;
  }
  &:deep(.el-dialog__footer) {
    text-align: center;
  }
}
.property-type-selector {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-evenly;
}
.property-type-item {
  padding: 10px 0;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  text-align: center;
  align-content: center;
  user-select: none;
  width: 100px;
  height: 120px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0);
  cursor: pointer;

  &:hover {
    border: 1px solid #0091ff;
  }
  &.checked {
    color: #0091ff;
    border: 1px solid #0091ff;
  }

  .icon {
    width: 100%;
    font-size: 50px;
    margin-bottom: 10px;
  }
}
</style>
