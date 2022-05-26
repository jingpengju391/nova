<template>
  <div class="output-file">
    <el-button type="info" :icon="Folder"></el-button>
    <el-input
      v-model="taskSettingsData.outputFolder"
      maxlength="inputNameLength"
      placeholder="Please input"
    />
  </div>
</template>

<script setup lang=ts>
import { useWorkspacesAPIs } from '@/hooks'
import { Folder } from '@element-plus/icons-vue'
import { clone } from '@shared/functional'
import { watch, computed } from 'vue'
import { useStore } from 'vuex'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
const store = useStore()
const taskSettingsData = computed(() => store.state.settings.taskSettingsData)
// watch(() => taskSettingsData.value.outputFolder, newvalue => {
//   store.dispatch('settings/updateTaskSettingsData', taskSettingsData.value)
// })

// async function outputDirectory() {
//   // const { canceled, dataInputDirectory } = await useAssumptionTableAPIs().importDirectory(filePath)
//   const { canceled, workspacePath } = await useWorkspacesAPIs().chooseWorkspacePath()
//   if (canceled || !workspacePath) return false
//   const data = clone(taskSettingsData.value)
//   data.outputFolder = workspacePath
//   store.commit('settings/updateTaskData', data)
// }

</script>

<style lang="scss" scope>
.output-file {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
