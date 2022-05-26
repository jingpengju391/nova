<template>
  <teleport to="#app">
    <div class="master-box">
      <el-dialog
        v-model="isShowProductDialog"
        :title="title"
        :width="dialogStaticAttr.width"
        :before-close="onCancel"
      >
        <div class="master-form-box">
          <product-form v-if="currentMasterNode" ref="productForRef" :formDataSources="productFormData" :formSources="currentMasterNode"/>
        </div>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="onCancel">取消</el-button>
            <el-button type="primary" :loading="dialogProductLoading" @click="onSure">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </teleport>
</template>
<script setup lang=ts name="Product">
import { computed, watch, ref } from 'vue'
import { useStore } from 'vuex'
import {
  isShowProductDialog, dialogProductLoading, closeProductDialog, clearTemporaryProductData,
  openProductDialog, closeProductLoading, openProductLoading, productFormData, saveNewProductToDb
} from '../../config'
import { Form as ProductForm } from '@/views/components'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
const store = useStore()
const dialogStaticAttr = {
  width: '80%'
}

const title = computed(() => {
  let operation = '新增'
  if (currentMasterNode.value && currentMasterNode.value.id) (operation = '修改')
  return `${operation}-Product`
})

const currentMasterNode = computed(() => store.state.masters.currentMasterNode)

const productForRef = ref<HTMLElementAny>()
const onSure = () => {
  if (productForRef.value) {
    productForRef.value.validateFn(async () => {
      openProductDialog()
      await saveNewProductToDb(productForRef.value.form)
      closeProductDialog()
      closeProductLoading()
    })
  }
}

const onCancel = () => {
  closeProductDialog()
  clearTemporaryProductData()
}
</script>
<style lang="scss" scope>
@import "../../scss/global-master-style.scss";
.dialog-footer{
  display: inline-block;
  width: 100%;
  text-align: center;
}
.master-form-box{
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  background: #f9f9fb;
}
</style>
