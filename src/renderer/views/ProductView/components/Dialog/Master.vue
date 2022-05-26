<template>
  <teleport to="#app">
    <div class="master-box">
      <el-dialog
        v-model="isShowMasterDialog"
        :title="title"
        :width="dialogStaticAttr.width"
        :before-close="onCancel"
      >
        <div class="master-form-box">
          <master-form
            v-if="currentMasterNode"
            ref="masterForRef"
            :inline="true"
            :formDataSources="masterFormData"
            :formSources="currentMasterNode"
          />
        </div>
        <indicator-library />
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="onCancel">取消</el-button>
            <el-button
              type="primary"
              :loading="dialogMasterLoading"
              @click="onSure"
              >确定</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </teleport>
</template>

<script setup lang=ts name="Master">
import { computed, watch, ref } from 'vue'
import { useStore } from 'vuex'
import {
  isShowMasterDialog, dialogMasterLoading, addNewMaster, masterFormData, clearTemporaryMasterData,
  saveNewMasterToDb, closeMasterDialog, openMasterDialog, openLoading, closeLoading
} from '../../config'
import { Form as MasterForm } from '@/views/components'
import IndicatorLibrary from './IndicatorLibrary.vue'
import { getMasterNavigationNodeIdAndType, MasterNodeType } from '@/utils'
import { AnchorProduct, Product } from '@shared/dataModelTypes/product/products'
import masterDataSource from '@/store/modules/masterDataSource'
import { HTMLElementAny } from '@shared/dataModelTypes/assumptions'
const store = useStore()
const dialogStaticAttr = {
  width: '80%'
}

const currentMasterNode = computed(() => {
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode) return currentMasterNode
  const { id, type } = getMasterNavigationNodeIdAndType(currentMasterNode.id)
  let currentNode: AnchorProduct | Product
  if (type === MasterNodeType.master) {
    currentNode = masterDataSource.getCompleteMaster(id)
  } else {
    currentNode = masterDataSource.getCompleteProduct(currentMasterNode.id)!
  }
  return currentNode
})
const title = computed(() => {
  let operation = '新增'
  if (currentMasterNode.value && currentMasterNode.value.id) (operation = '修改')
  return `${operation}-Master`
})
const masterForRef = ref<HTMLElementAny>()
const onSure = () => {
  masterForRef.value && masterForRef.value.validateFn(async () => {
    openLoading()
    await saveNewMasterToDb(masterForRef.value!.form)
    closeMasterDialog()
    closeLoading()
  })
}

const onCancel = () => {
  closeMasterDialog()
  clearTemporaryMasterData()
}

</script>
<style lang="scss" scope>
@import "../../scss/global-master-style.scss";
.dialog-footer {
  display: inline-block;
  width: 100%;
  text-align: center;
}
.master-form-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  background: #f9f9fb;
}
</style>
