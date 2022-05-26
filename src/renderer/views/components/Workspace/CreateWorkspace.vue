<template>
  <el-dialog
    v-model="visible"
    width="500px"
    title="新建workspace"
    :before-close="closeDialog"
  >
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="60px">
      <el-form-item label="名称" prop="newModelName">
        <el-input v-model="ruleForm.newModelName" placeholder="请输入workspace名称"></el-input>
      </el-form-item>
    </el-form>
    <template #footer center>
      <span class="dialog-footer">
        <el-button @click="closeDialog()">取 消</el-button>
        <el-button type="primary" @click="createWorkspacePath(ruleFormRef)">新 建</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup name="CreateWorkspace">
import { useWorkspacesAPIs } from '@/hooks/apis'
import { ref, reactive } from 'vue'
import type { ElForm } from 'element-plus'

type FormInstance = InstanceType<typeof ElForm>
const emit = defineEmits(['closeDialog'])
const ruleFormRef = ref<FormInstance>()
interface RuleForm {
  newModelName: string | undefined,
}

const visible = ref(true)
const ruleForm = reactive<RuleForm>({
  newModelName: 'NewWorkspace'
})
const rules = {
  newModelName: [{
    required: true,
    message: 'workspace名称不能为空',
    trigger: 'blur'
  }]
}

const closeDialog = () => {
  emit('closeDialog')
}

// 创建工作区
const createWorkspacePath = (formEl: FormInstance | undefined) => {
  formEl.validate(async (valid) => {
    if (valid) {
      const { workspacePath } = await useWorkspacesAPIs().createWorkspacePath(ruleForm.newModelName)
      emit('closeDialog', workspacePath)
    }
  })
}
</script>
<style scoped lang="scss">
</style>
