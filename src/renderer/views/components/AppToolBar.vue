<template>
  <div id="coder-view-tool-bar">
    <div class="tool-set-box">
      <span id="left-tool-set">
        <icon-button
          tooltip="模型导航"
          icon-class="turn-off"
          @click="$emit('left-toggle-click')"
        />
      </span>
      <el-dropdown
        v-if="isBS"
        class="workspace-set"
        @command="handleWorkspaceCommand"
      >
        <span class="el-dropdown-link">
          {{ moduleName }}
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="a">上传workspace</el-dropdown-item>
            <el-dropdown-item command="b">新建workspace</el-dropdown-item>
            <el-dropdown-item command="c">切换workspace</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <span v-show="!isDataClean">
      <icon-button
        tooltip="保存公式"
        iconClass="finished"
        :disabled="saveCurrentFormulaDisabled"
        @click="$emit('save-button-click')"
      />
      <icon-button
        :tooltip="isCompiling ? '暂停' : '编译'"
        :iconClass="compileButtonClass"
        :disabled="compileDisabled"
        @click="clickCompileButton"
      />
      <icon-button
        :tooltip="'运行'"
        :iconClass="runButtonClass"
        @click="runProjectionDialogVisible = true"
        :disabled="runDisabled"
      />
    </span>
    <span v-show="isDataClean">
      <icon-button
        :tooltip="'运行数据清洗'"
        :iconClass="runButtonClass"
        @click="runDataCleanDialogVisibleShow"
        :disabled="runDisabled"
      />
    </span>
    <div class="tool-set-box user-set-box">
      <span id="right-tool-set">
        <icon-button
          tooltip="属性窗口"
          icon-class="open"
          @click="$emit('right-toggle-click')"
        />
      </span>
      <el-dropdown @command="handleSetCommand">
        <span class="el-dropdown-link">
          深轻科技 - {{ userInfo.username }}
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              ><el-icon><postcard /></el-icon
              >contact@deeplightconnect.com</el-dropdown-item
            >
            <el-dropdown-item>深轻（上海）科技有限公司</el-dropdown-item>
            <el-dropdown-item divided command="a">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
  <el-dialog
    title="编译模型"
    width="400px"
    v-model="compileModelDialogVisible"
    destroy-on-close
  >
    <el-form
      ref="modelSelectionForm"
      :rules="modelSelectionFormRules"
      :model="modelSelectionForm"
      @submit.prevent
    >
      <el-form-item label="模型" prop="selectedModel">
        <el-select v-model="modelSelectionForm.selectedModel">
          <el-option
            v-for="option in modelOptions"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
        <el-button
          style="margin-right: 8px"
          @click="compileModelDialogVisible = false"
          >取 消</el-button
        >
        <el-button style="margin-right: 8px" type="primary" @click="compile"
          >编 译</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="运行任务"
    width="400px"
    v-model="runProjectionDialogVisible"
    destroy-on-close
  >
    <el-form
      ref="projectionSelectionForm"
      :rules="projectionSelectionFormRules"
      :model="projectionSelectionForm"
      @submit.prevent
    >
      <el-form-item label="任务" prop="selectedProjection">
        <el-select v-model="projectionSelectionForm.selectedProjection">
          <el-option
            v-for="option in projectionOptions"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="">
        <el-checkbox
          v-model="projectionSelectionForm.childFolderSelect"
          label="是否添加子文件夹"
          @change="handleChildFolderSelect"
        ></el-checkbox>
      </el-form-item>
      <el-form-item
        label="子文件夹"
        prop="childFolderPath"
        v-if="projectionSelectionForm.childFolderSelect"
      >
        <el-input
          v-model="projectionSelectionForm.childFolderPath"
          placeholder="Please input"
        />
        <!-- <el-autocomplete
          v-model="projectionSelectionForm.childFolderPath"
          :fetch-suggestions="querySearch"
          popper-class="my-autocomplete"
          placeholder="Please input"
          @select="handleSelect"
        >
          <template #default="{ item }">
            <div class="value">{{ item.value }}</div>
          </template>
        </el-autocomplete> -->
      </el-form-item>
      <!-- <el-form-item label="" prop="">
        <el-checkbox
          v-model="projectionSelectionForm.useCluster"
          label="使用集群运算"
          @change="checkNamespace"
        ></el-checkbox>
      </el-form-item>
      <el-form-item
        label="namespace"
        prop="namespace"
        v-if="projectionSelectionForm.useCluster"
      >
        <el-input
          v-model="projectionSelectionForm.namespace"
          placeholder="Please input"
        />
      </el-form-item> -->
    </el-form>
    <template #footer>
      <span>
        <el-button
          style="margin-right: 8px"
          @click="runProjectionDialogVisible = false"
          >取 消</el-button
        >
        <el-button style="margin-right: 8px" type="primary" @click="run"
          >运 行</el-button
        >
      </span>
    </template>
  </el-dialog>
  <el-dialog
    title="运行数据清洗"
    width="600px"
    v-model="runDataCleanDialogVisible"
    destroy-on-close
  >
    <el-form
      ref="dataCleanSelectionForm"
      :rules="dataCleanSelectionFormRules"
      :model="dataCleanSelectionForm"
      @submit.prevent
    >
      <el-form-item label="任务" prop="selectedProjection">
        <el-select
          v-model="dataCleanSelectionForm.selectedProjection"
          @change="handleDataCleanSelect"
        >
          <el-option
            v-for="option in dataCleanProjectOptions"
            :key="option.id"
            :label="option.name"
            :value="option.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据源" prop="dataSource">
        <el-input
          v-model="dataCleanSelectionForm.dataSource"
          disabled
        ></el-input>
      </el-form-item>
        <el-form-item label="输出文件夹" prop="outputPath">
        <el-input v-model="dataCleanSelectionForm.outputFileName"></el-input>
      </el-form-item>
      <el-form-item label="输出路径" prop="outputPath">
        <el-input v-model="dataCleanSelectionForm.outputPath"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span>
        <el-button
          style="margin-right: 8px"
          @click="runDataCleanDialogVisible = false"
          >取 消</el-button
        >
        <el-button
          style="margin-right: 8px"
          type="primary"
          @click="runDataCleanProject"
          >运 行</el-button
        >
      </span>
    </template>
  </el-dialog>
  <import-file-dialog
    v-if="dialogFileVisible"
    extension=".feiyanworkspace"
    @chooseFile="chooseFile"
    @closeDialog="closeChooseFileDialog"
  />
  <create-workspace
    v-if="dialogCreateWorkspaceVisible"
    @closeDialog="closeCreateWorkspaceDialog"
  />
  <upload-file
    v-if="uploadFileVisible"
    type="dir"
    @closeDialog="uploadFileVisible = false"
  />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from './IconButton.vue'
import { useWorkspacesAPIs, userAPIs } from '@/hooks/apis'
import { ElLoading } from 'element-plus'
import { createNamespacedHelpers, mapActions, mapState, mapMutations } from 'vuex'
import { getModelNavigationNodeIdAndType } from '../../utils'
import { Projection } from '@shared/dataModelTypes/runs/projections'
import { ModelNavigationNode } from '@shared/dataModelTypes/models/models'
import { activeValue } from '@/views/CoderView/config/tabs'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import defaultLanguageServer from '@/formulaLanguageServer'
import modelsDataSource from '@/store/modules/modelsDataSource'
import ImportFileDialog from './ImportFileDialog/index.vue'
import CreateWorkspace from './Workspace/CreateWorkspace.vue'
import UploadFile from './Workspace/UploadFile.vue'
import { useDataInputsAPIs, useDataCleanAPIs, useRunsAPIs } from '../../hooks/apis'
import { clone } from '@shared/functional'

const { mapState: mapTaskState, mapGetters: mapTaskGetters, mapActions: mapTaskActions } = createNamespacedHelpers('tasks/')
const { mapState: mapModelState } = createNamespacedHelpers('models/')
const { mapState: mapRunsState, mapActions: mapRunsActions } = createNamespacedHelpers('runs/')
const { mapState: mapDataCleanState, mapActions: mapDataCleanActions } = createNamespacedHelpers('project/')

const restaurants = [
  {
    value: 'task_1'
  },
  {
    value: 'task_2'
  },
  {
    value: 'task_3'
  },
  {
    value: 'task_4'
  }
]
export default defineComponent({
  components: { IconButton, ImportFileDialog, CreateWorkspace, UploadFile },
  emits: ['left-toggle-click', 'right-toggle-click', 'save-button-click', 'compile-button-click'],
  data() {
    const checkChildFolderPath = (rule, value, callback) => {
      if (this.projectionSelectionForm.childFolderSelect) {
        if (!value) {
          return callback(new Error('年龄不能为空'))
        }
        const pattern1 = /^[A-Za-z][_\w]*$/
        if (!pattern1.test(value)) {
          return callback(new Error('名称只允许包含英文字母或下划线，且首字符必须是英文字母'))
        } else {
          return true
        }
      } else {
        return true
      }
    }
    return {
      compileModelDialogVisible: false,
      runProjectionDialogVisible: false,
      runDataCleanDialogVisible: false,
      modelSelectionForm: {
        selectedModel: null
      },
      restaurants,
      projectionSelectionForm: {
        selectedProjection: null,
        childFolderSelect: true,
        childFolderPath: '',
        useCluster: false,
        namespace: 'ChinaLifeModel'
      },
      dataCleanSelectionForm: {
        selectedProjection: null,
        dataSource: null,
        outputPath: '',
        outputFileName: ''
      },
      curModelIdArr: [],
      curModelNameArr: [],
      modelSelectionFormRules: {
        selectedModel: [{ required: true, message: '请选择模型', trigger: 'change' }]
      },
      projectionSelectionFormRules: {
        selectedProjection: [{ required: true, message: '请选择任务', trigger: 'change' }],
        childFolderPath: [{ required: true, type: 'string', validator: checkChildFolderPath, message: '名称只允许包含英文字母或下划线，且首字符必须是英文字母', trigger: ['blur', 'change'] }],
        namespace: [{ required: true, type: 'string', validator: checkChildFolderPath, message: '名称只允许包含英文字母或下划线，且首字符必须是英文字母', trigger: ['blur', 'change'] }]
      },
      dataCleanSelectionFormRules: {
        selectedProjection: [{ required: true, message: '请选择任务', trigger: 'change' }],
        dataSource: [{ required: true, message: '请选择任务', trigger: 'change' }],
        outputPath: [{ required: true, message: '请选择任务', trigger: 'change' }]
      },
      dialogFileVisible: false,
      isBS: false,
      dialogCreateWorkspaceVisible: false,
      uploadFileVisible: false,
      isDataClean1: false
    }
  },
  watch: {
    currentModelNode(newValue: ModelNavigationNode) {
      if (!newValue) return
      const newID = newValue.modelId
        ? newValue.modelId : newValue.id
      this.modelSelectionForm.selectedModel = newID
    },
    currentProjection(newValue: Projection) {
      if (!newValue) return
      this.projectionSelectionForm.selectedProjection = newValue.id
    },
    runProjectionDialogVisible(val) {
      this.initData(val)
    },
    '$route'(newValue) {
      if (this.$route.path === '/dcsview') {
        this.setDataCleanShow(true)
      } else {
        this.setDataCleanShow(false)
      }
    }

  },
  computed: {
    ...mapState(['workspace', 'userInfo', 'isDataCleanShow']),
    ...mapTaskState(['isCompiling', 'isRunning', 'taskMonits']),
    ...mapTaskGetters(['compileDisabled', 'runDisabled']),
    ...mapModelState(['modelNavigationTree', 'currentFormulaItem', 'currentModelNode']),
    ...mapRunsState(['projections', 'currentProjection', 'runners', 'isProjectionSave']),
    ...mapDataCleanState(['projects']),
    compileButtonClass(): string {
      return this.isCompiling ? 'video-pause' : 'help'
    },
    runButtonClass(): string {
      return 'video-play'
    },
    modelOptions(): { id: number, name: string }[] {
      return this.modelNavigationTree.map(modelNaviNode => {
        const { id } = getModelNavigationNodeIdAndType(modelNaviNode.id)
        return { id, name: modelNaviNode.name }
      })
    },
    projectionOptions(): { id: number, name: string }[] {
      return this.projections.map(p => ({ id: p.id, name: p.name }))
    },
    dataCleanProjectOptions(): { id: number, name: string }[] {
      return this.projects.map(p => ({ id: p.id, name: p.name }))
    },
    saveCurrentFormulaDisabled(): boolean {
      return this.currentFormulaItem ? !this.currentFormulaItem.unsaved : true
    },
    moduleName() {
      if (this.workspace) {
        const pathList = this.workspace.dirPath.replace(/\\/g, '/').split('/')
        return pathList.pop()
      }
      return ''
    },
    isDataClean(): boolean {
      return this.isDataCleanShow
    }

  },
  mounted() {
    if (userAPIs().login) {
      this.isBS = true
    }
  },
  methods: {
    ...mapMutations(['setLoginMask', 'setIsAuthor', 'setIsAppStarted', 'setDataCleanShow']),
    ...mapTaskActions(['compileModel', 'stopCompile', 'runProjection', 'insertTaskMonits']),
    ...mapActions(['resetWorkspace']),
    ...mapRunsActions(['saveUpdatedCurrentProjectionToDB']),
    ...mapDataCleanActions(['queryAllCleanProjectFromDB']),
    initData(flag: boolean) {
      if (!flag) {
        this.projectionSelectionForm.childFolderPath = ''
        return
      }
      const num: number = this.taskMonits?.length ? this.taskMonits?.length - 1 : -1
      if (num === -1) {
        this.projectionSelectionForm.childFolderPath = 'task_1'
      } else {
        this.projectionSelectionForm.childFolderPath = `task_${this.taskMonits[num].id + 1}`
      }
    },
    querySearch(queryString, cb) {
      var results = this.restaurants
      // var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    handleDataCleanSelect(val) {
      this.projects.map(async (item) => {
        if (item.id === val) {
          this.dataCleanSelectionForm.dataSource = item.children[0].children[0].navName

          const outputPath = await useDataInputsAPIs().pathJoin(this.workspace.dirPath, 'dataCleanOutput')
          const outputPath1 = await useDataInputsAPIs().pathJoin(this.workspace.dirPath, 'dataCleanOutput')
          const ddd = await useDataInputsAPIs().readDirectory(outputPath)
          console.log(ddd)
          if (!outputPath) {
            this.dataCleanSelectionForm.outputFileName = 'task_0'
          } else {
            this.dataCleanSelectionForm.outputFileName = 'task_' + ddd.length
          }
          this.dataCleanSelectionForm.outputPath = outputPath
        }
      })
    },
    handleChildFolderSelect(val) {
      if (!val) {
        this.projectionSelectionForm.childFolderPath = ''
      }
    },
    checkNamespace(val) {
      // if (!val) {
      //   this.projectionSelectionForm.namespace =
      // }
    },
    clickCompileButton() {
      if (this.isCompiling) {
        this.stopCompile()
      } else {
        this.compileModelDialogVisible = true
      }
    },
    compile() {
      this.$refs.modelSelectionForm.validate(valid => {
        if (valid) {
          activeValue.value = '0'
          if (!this.isCompiling && !this.isRunning) {
            this.compileModel(this.modelSelectionForm.selectedModel)
          } else if (this.isCompiling) {
            this.compileModel(this.modelSelectionForm.selectedModel)
          }
          this.compileModelDialogVisible = false
        }
      })
    },
    resultTaskMoint() {
      const taskMOint = {}
      const that = this
      this.projections.map((item: Projection) => {
        if (item.id === this.projectionSelectionForm.selectedProjection) {
          taskMOint.outputChildAddress = this.projectionSelectionForm.childFolderPath
          taskMOint.taskName = item.name
          taskMOint.outputAddress = item.outputFolder
          taskMOint.submitTime = new Date().getTime()
          taskMOint.completedTime = ''
          taskMOint.submitter = ''
          taskMOint.runnerSelections = item.runnerSelections
          taskMOint.status = 0
          taskMOint.projectionId = item.id
        }
      })
      return taskMOint
    },

    run() {
      this.$refs.projectionSelectionForm.validate(async valid => {
        let userAgent = navigator.userAgent.toLowerCase()
        if (!userAgent.includes('electron')) {
          const ot = await useRunsAPIs().db.queryCpusFromDB(this.projectionSelectionForm.selectedProjection)
          console.log('cpus:', ot)
        }
        if (!this.isProjectionSave) {
          const sp = await this.saveUpdatedCurrentProjectionToDB()
          console.log(sp)
        }
        if (valid) {
          activeValue.value = '0'
          if (!this.isCompiling) {
            // this.runProjection(this.projectionSelectionForm.selectedProjection)
            // if (this.projectionSelectionForm.childFolderSelect) {
            const { taskIds, processId } = await this.insertTaskMonits(this.resultTaskMoint())
            this.runProjection({
              projectionId: this.projectionSelectionForm.selectedProjection,
              childFolder: this.projectionSelectionForm.childFolderPath,
              useCluster: this.projectionSelectionForm.useCluster,
              namespace: this.projectionSelectionForm.namespace,
              taskIds: taskIds,
              processId: processId
            })
            // }
          }
          this.runProjectionDialogVisible = false
        }
      })
    },
    runDataCleanProject() {
      this.$refs.dataCleanSelectionForm.validate(async valid => {
        if (valid) {
          const dataCleanSelectionForm1 = clone(this.dataCleanSelectionForm)
          const ss = await useDataCleanAPIs().runDataClean({
            selectedProjection: dataCleanSelectionForm1.selectedProjection,
            dataSource: dataCleanSelectionForm1.dataSource,
            outputPath: dataCleanSelectionForm1.outputPath,
            dirPath: this.workspace.dirPath,
            outputFileName: this.dataCleanSelectionForm.outputFileName
          })
          this.runDataCleanDialogVisible = false
          if (ss) {
            this.runDataCleanDialogVisible = false
          }
        }
      })
    },
    handleWorkspaceCommand(command: string) {
      if (command === 'a') {
        this.uploadFileVisible = true
      } else if (command === 'b') {
        this.dialogCreateWorkspaceVisible = true
      } else {
        this.openWorkspace()
      }
    },
    async chooseFile(file: string) {
      this.dialogFileVisible = false
      await this.openWorkspaceWithPath(file)
    },
    closeChooseFileDialog() {
      this.dialogFileVisible = false
    },
    async openWorkspace() {
      if (!userAPIs().login) {
        const { canceled, workspacePath } = await useWorkspacesAPIs().chooseWorkspacePath()
        if (canceled) return
        await this.openWorkspaceWithPath(workspacePath)
      } else {
        this.dialogFileVisible = true
      }
    },
    async openWorkspaceWithPath(workspacePath: string) {
      document.title = workspacePath
      const loading = ElLoading.service({
        lock: true,
        text: '载入数据中'
      })
      const workspace = await window.apis.initializeWorkspace(workspacePath, false)
      await this.resetWorkspace(workspace)
      const models = modelsDataSource.getAllModelsWithTheirModelBlocks()
      defaultLanguageServer.addModelsForParsing(models)
      loading.close()
    },
    closeCreateWorkspaceDialog(workspacePath: string) {
      this.dialogCreateWorkspaceVisible = false
      if (workspacePath) {
        this.createWorkspaceWithPath(workspacePath)
      }
    },
    async createWorkspaceWithPath(workspacePath: string) {
      const loading = ElLoading.service({
        lock: true,
        text: '载入数据中'
      })
      const workspace = await window.apis.initializeWorkspace(workspacePath, true)
      // this.setWorkspace(workspace)
      await this.resetWorkspace(workspace)
      loading.close()
    },
    async handleSetCommand(command: string | undefined) {
      if (command === 'a') {
        await userAPIs().logout()
        this.$router.push('/')
        this.setLoginMask(true)
        this.setIsAuthor(true)
        this.setIsAppStarted(false)
      }
    },
    async runDataCleanDialogVisibleShow() {
      if (!this.projects.length) {
        await this.queryAllCleanProjectFromDB()
        this.runDataCleanDialogVisible = true
      } else {
        this.runDataCleanDialogVisible = true
      }
    }
  }

})
</script>

<style lang="scss" scoped>
#coder-view-tool-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 36px;
  border-bottom: 1px solid #d0d0d0;
  .tool-set-box {
    display: flex;
    align-items: center;
  }
  .user-set-box {
    margin-right: 15px;
  }
  #left-tool-set {
    margin-left: 20px;
  }
  #right-tool-set {
    margin-right: 10px;
  }
  .workspace-set {
    margin-left: 5px;
  }
}
</style>
