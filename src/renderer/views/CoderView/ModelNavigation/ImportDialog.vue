<template>
  <el-dialog title="导入模型" v-model="visible" destroy-on-close>
    <el-tree
      v-show="importedModelTree"
      :data="importedModelTree"
      :props="defaultProps"
      default-expand-all
      show-checkbox
      node-key="id"
      :default-checked-keys="$options.defaultCheckedKeys"
      ref="importedModelTree"
    />
    <template #footer>
      <span v-show="importedModelTree">
        <el-button style="margin-right: 8px" @click="visible = false"
          >取 消</el-button
        >
        <el-checkbox
          style="margin-right: 8px"
          v-model="checkAllToImport"
          label="全 选"
          border
        />
        <el-button
          style="margin-right: 8px"
          type="primary"
          :loading="importLoading"
          @click="confirmImportModel"
          >导 入</el-button
        >
      </span>
    </template>
    <el-empty v-show="!importedModelTree">
      <template #image
        ><el-icon><loading /></el-icon
      ></template>
      <template #description>模型文件载入中</template>
    </el-empty>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { ElTree } from 'element-plus'
import { ModelNavigationTree, ModelJSON } from '@shared/dataModelTypes'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { useWorkspacesAPIs, useIpcRenderer, useAppSettingsAPIs } from '@/hooks/apis'
import defaultLanguageServer from '@/formulaLanguageServer'
const { mapActions } = createNamespacedHelpers('models/')
const { mapActions: mapActionsCodeIndex } = createNamespacedHelpers('codeIndex/')
export default defineComponent({
  // using static option modelJSON for database import
  // to avoid the deep clone of the proxy(modelJSON) defined under data()
  modelJSON: null as ModelJSON | null,
  // using static option to avoid Vue create reactivity which is time consuming and will block UI
  defaultCheckedKeys: [] as (number | string)[],
  data() {
    return {
      visible: false,
      importedModelTree: null as ModelNavigationTree | null,
      checkAllToImport: true,
      importLoading: false,
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  watch: {
    checkAllToImport(value: boolean) {
      const keys: (number | string)[] = value ? this.$options.defaultCheckedKeys : [];
      (this.$refs.importedModelTree as InstanceType<typeof ElTree>).setCheckedKeys(keys, false)
    }
  },
  methods: {
    ...mapActions(['importModelsWithDBSync']),
    ...mapActionsCodeIndex(['importCodeIndexFromDB']),
    async confirmImportModel() {
      const modelJSON = {
        name: this.$options.modelJSON.name,
        rootBlockId: this.$options.modelJSON.rootBlockId,
        rootBlockName: this.$options.modelJSON.rootBlockName,
        time: this.$options.modelJSON.time,
        blocks: []
      }
      const checkedArr = this.$refs.importedModelTree.getCheckedNodes()
      if (checkedArr.length) {
        await this.$options.modelJSON.blocks.map(item => {
          return checkedArr.map(checks => {
            if (item.id === checks.id) {
              modelJSON.blocks.push(item)
            }
          })
        })
        this.importLoading = true
        const model = await this.importModelsWithDBSync(modelJSON!)
        await this.importCodeIndexFromDB(this.$options.modelJSON!.codeIndexes)
        this.visible = false
        this.importLoading = false
        const models = await modelsDataSource.getModelAndItsModelBlocks()
        await defaultLanguageServer.addModelForParsing(model)
      }
    },
    async handleAppBeforeQuit() {
      defaultLanguageServer.terminate()
    }
  }
})
</script>
