<!-- eslint-disable vue/no-v-model-argument -->
<template>
  <div id="navigation-view">
    <tool-bar
      @create-model="onCreateModel"
      @import-model="onImportModel"
      @export-model="onExportModel"
      :naviButtonState="displayModelTreeNavi"
      @update:naviButtonState="setDisplayModelTreeNavi($event)"
    />
    <template v-if="modelNavigationTree.length > 0">
      <mask-navigation class="navi" v-show="!displayModelTreeNavi" />
      <model-tree-navigation class="navi" v-show="displayModelTreeNavi" />
    </template>
    <el-empty id="empty-view" description="暂无模型" v-else>
      <div id="no-model-buttons">
        <el-button class="no-model-item" type="primary" @click="onImportModel"
          >导入模型</el-button
        >
        <span class="no-model-item">或</span>
        <el-button class="no-model-item" type="primary" @click="onCreateModel"
          >新建模型</el-button
        >
      </div>
    </el-empty>
    <model-import-dialog ref="modelImportDialog" />
    <model-export-dialog ref="modelExportDialog" />
    <add-model-dialog ref="addModelDialog" />
    <!-- <import-file-dialog v-if="dialogFileVisible" extension=".json" @chooseFile="chooseFile" @closeDialog="closeChooseFileDialog"/> -->
    <upload-file v-if="uploadFileVisible" extension=".json" @closeDialog="handleUploadFile"/>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ToolBar from './ToolBar.vue'
import MaskNavigation from './MaskNavigation.vue'
import ModelTreeNavigation from './ModelTreeNavigation.vue'
import ModelExportDialog from './ModelExportDialog.vue'
import ModelImportDialog from './ImportDialog.vue'
import AddModelDialog from './AddModelDialog.vue'
import { useModelsAPIs, userAPIs } from '../../../hooks/apis'
import { convertModelJSONToModelTree } from './utils'
import { UnsavedModelBlockExistsError, UnsavedModelExistsError } from '../../../errors'
import { createNamespacedHelpers } from 'vuex'
import { ElMessage } from 'element-plus'
import ImportFileDialog from '../../components/ImportFileDialog/index.vue'
import UploadFile from '../../components/Workspace/UploadFile.vue'

const { mapState, mapActions, mapMutations } = createNamespacedHelpers('models/')
export default defineComponent({
  components: { ToolBar, MaskNavigation, ModelTreeNavigation, ModelImportDialog, ModelExportDialog, AddModelDialog, ImportFileDialog, UploadFile },
  data() {
    return {
      dialogFileVisible: false,
      uploadFileVisible: false
    }
  },
  computed: {
    ...mapState(['modelNavigationTree', 'displayModelTreeNavi'])
  },
  methods: {
    ...mapMutations(['setDisplayModelTreeNavi']),
    ...mapActions(['addModel']),
    onCreateModel() {
      const addModelDialog = this.$refs.addModelDialog as InstanceType<typeof AddModelDialog>
      addModelDialog.visible = true
      // this.addModel().catch(err => {
      //   if (err instanceof UnsavedModelExistsError) {
      //     this.$message.warning('当前存在新建的未保存模型，请先设置该模型')
      //   } else if (err instanceof UnsavedModelBlockExistsError) {
      //     this.$message.warning('当前存在新建的未保存Mask/Block，请先设置该Mask/Block')
      //   }
      // })
    },
    async onImportModel() {
      if (this.displayModelTreeNavi) {
        ElMessage({
          message: '此功能暂时被禁用',
          type: 'warning'
        })
        return true
      }
      try {
        if (userAPIs().login) {
          // this.dialogFileVisible = true
          this.uploadFileVisible = true
        } else {
          const { canceled, filePath } = await useModelsAPIs().openFileDialog()
          if (canceled) return
          this.importModelJSON(filePath)
        }
      } catch (err: any) {
        this.$message.error(`出错了，${err.message}`)
      }
    },
    onExportModel() {
      if (this.displayModelTreeNavi) {
        ElMessage({
          message: '此功能暂时被禁用',
          type: 'warning'
        })
        return true
      }
      const exportDialog = this.$refs.modelExportDialog as InstanceType<typeof ModelExportDialog>
      exportDialog.visible = true
    },
    async importModelJSON(filePath?:string) {
      const modelJSON = await useModelsAPIs().importModelJSON(filePath!)
      if(modelJSON!==null){
        const importDialog = this.$refs.modelImportDialog as InstanceType<typeof ModelImportDialog>
        importDialog.visible = true
        importDialog.$options.modelJSON = { ...modelJSON, codeIndexes: modelJSON.codeIndex ?? [] }
        importDialog.$options.defaultCheckedKeys = modelJSON!.blocks.map(block => block.id)
        importDialog.importedModelTree = convertModelJSONToModelTree(modelJSON!)
      }
    },
    chooseFile(filePath?:string) {
      this.dialogFileVisible = false
      this.importModelJSON(filePath)
    },
    closeChooseFileDialog() {
      this.dialogFileVisible = false
    },
    handleUploadFile(filePath:string) {
      this.uploadFileVisible = false
      this.importModelJSON(filePath)
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../../assets/_naviNode.scss";

#navigation-view {
  padding-top: 4px;
  border-right: 1px solid var(--nova-border-color);
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  background: $naviBgColor;
}

.navi {
  height: calc(100% - 30px);
  display: flex;
  flex-flow: column nowrap;
}

#empty-view {
  height: 100%;
  min-height: 300px;
  &:deep(.el-empty__image svg) {
    width: 80%;
  }
}

#no-model-buttons {
  color: #909399;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  .no-model-item {
    margin: 3px 0;
  }
}
</style>
