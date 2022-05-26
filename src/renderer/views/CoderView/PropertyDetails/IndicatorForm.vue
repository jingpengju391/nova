<template>
  <teleport to="#app">
    <el-dialog
      v-model="isShowMasterDialog"
      :title="title"
      :width="dialogStaticAttr.width"
    >
      <master-form :formDataSources="productFormData" :formSources="currentMasterNode2"/>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" :loading="dialogMasterLoading" @click="onSure">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </teleport>
</template>

<script setup lang=ts name="Update">
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import { isShowMasterDialog, dialogMasterLoading, addNewMaster, masterFormData, openLoading } from '../../config'
import { Form as MasterForm } from '@/views/components'
import IndicatorLibrary from './IndicatorLibrary.vue'
const store = useStore()
const dialogStaticAttr = {
  width: '80%'
}
const currentMasterNode2 = {
  id: 1,
  name: '2222',
  description: '2222',
  creator: '2222',
  updatedAt: 121212,
  modelId: 65656
}
const currentMasterNode = computed(() => store.state.masters.currentMasterNode)
const title = computed(() => {
  let operation = '新增'
  if (currentMasterNode.value && currentMasterNode.value.id) (operation = '修改')
  return `${operation}-Master`
})

const onSure = () => {
  openLoading()
  addNewMaster()
}
</script>
<style lang="scss" scope>
@import "../../scss/global-master-style.scss";
.dialog-footer{
  display: inline-block;
  width: 100%;
  text-align: center;
}
.form-box{
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 15px;
  background: #f9f9fb;
}
</style>
