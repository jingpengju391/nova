<template>
  <div id="project-navigator">
    <div id="header">
      <span>项目导航</span>
      <icon-button
        icon-class="document-add"
        tooltip="新建项目"
        @click="onCreateProject"
      />
    </div>
    <div>
      <el-input
        class="search"
        placeholder="请输入内容"
        prefix-icon="search"
        v-model="filterText"
        maxlength="inputNameLength"
      >
      </el-input>
    </div>
    <el-tree
      ref="variablesTree"
      class="navi-tree"
      :data="projectList"
      node-key="id"
      :highlight-current="true"
      :check-on-click-node="true"
      empty-text="无匹配结果"
      :expand-on-click-node="true"
      @current-change="handleCurrentChange"
       @node-contextmenu="handlew"
      @node-click="onClickDataTree"
    >
      <template #default="{ node, data }">
        <span class="navi-node">
          <span v-if="node.data.status">
            <el-icon>
              <fold />
            </el-icon>
            <el-input
              class="node-input"
              v-focus
              size="small"
              v-model="node.data.name"
              placeholder="请输入内容"
              @blur="hanldeEnter(data)"
              @keyup.enter="$event.target.blur()"
              maxlength="inputNameLength"
            >
            </el-input>
          </span>

          <span v-if="!node.data.status" class="title">
            <el-icon class="icon">
              <document />
            </el-icon>
            {{ node.data.name }}
          </span>
          <span class="tool-sets">
            <icon-button
              v-if="
                !node.data.status && node.data.id && node.data.name !== 'Coding'
              "
              icon-class="delete"
              @click.stop="deleteProjectItem(node, data)"
            />
            <icon-button
              v-if="
                !node.data.status &&
                !node.data.id &&
                node.data.children !== undefined &&
                node.data.name !== 'Coding'
              "
              icon-class="document-add"
              @click.stop="addProjectFeatures(node, data)"
            />
          </span>
        </span>
      </template>
    </el-tree>
    <div class="add-data-source">
      <el-dialog
        v-model="visible"
        width="500px"
        title="导入DataSource"
        destroy-on-close
      >
        <el-form :model="addDataSource" :rules="formRules" ref="addDataSource">
          <el-form-item
            label="projection"
            :label-width="formLabelWidth"
            prop="projectName"
          >
            <el-input
              v-model="addDataSource.projectName"
              disabled
              autocomplete="off"
              maxlength="inputNameLength"
            ></el-input>
          </el-form-item>
          <el-form-item
            label="data source"
            prop="nameList"
            :label-width="formLabelWidth"
          >
            <el-tree-select
              v-model="dataSourceSelect"
              :data="dataSourceOptions"
              multiple
            />
          </el-form-item>
        </el-form>
        <template #footer center>
          <el-button @click="closeDialog()">取 消</el-button>
          <el-button type="primary" @click="onSubmitDataSource">保存</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import IconButton from '../components/IconButton.vue'
import { createNamespacedHelpers } from 'vuex'
import { UnsavedProjectExistsError } from '@/errors'
import { ElMessage, ElTree } from 'element-plus'
import { ValidationName } from '@/utils'
import store from '@/store'
import { Project } from '@shared/dataModelTypes/project'
import { DataLink } from '@shared/dataModelTypes/dataLink'
import { useDataCleanAPIs } from '../../hooks/apis'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
const { mapState, mapMutations, mapActions, mapGetters } = createNamespacedHelpers('project/')
const { mapState: dataSourceState } = createNamespacedHelpers('dataLink/')

export default defineComponent({
  components: { IconButton },
  data() {
    return {
      dataSourceName: [],
      id: 0,
      props: {
        expandTrigger: 'hover',
        multiple: true
      },

      showDataSource: false,
      temporaryName: '',
      addDataSource: {
        id: 0,
        projectName: '',
        child: true,
        type: ''
      },
      formRules: {
        nameList: [
          { required: true, message: '请选择文件', trigger: 'blur' }
        ]
      },
      // dataSourceOptions: [
      // ] as any,
      visible: false,
      dataSourceSelect: '',
      filterText: ''
      // dataLinksFileListArr: []
    }
  },
  computed: {
    ...mapState(['projects', 'currProject', 'currentDataSurceVariable']),
    ...mapGetters(['projectsNav']),
    ...dataSourceState(['dataLinks']),
    projectList() {
      if (!this.currentDataSurceVariable && this.projectsNav.length) {
        this.updateCurrentProjectActions(this.projectsNav[0])
      }
      return this.projectsNav
    },
    dataSourceOptions() {
      const newOptions = []
      const dataLinks = JSON.parse(JSON.stringify(this.dataLinks))
      dataLinks.map(item => {
        const children = []
        item.fileList.map(file => {
          children.push({
            value: file.id,
            label: file.name + '(' + item.name + ')'
          })
        })

        newOptions.push({
          value: item.id,
          label: item.name,
          children: children
        })
      })

      return newOptions
    },
    dataLinksFileListArr() {
      const AllArr = []
      const dataLinks = JSON.parse(JSON.stringify(this.dataLinks))
      for (let i = 0; i < dataLinks.length; i++) {
        for (let j = 0; j < dataLinks[i].fileList.length; j++) {
          AllArr.push(dataLinks[i].fileList[j])
        }
      }
      return AllArr
    }
  },
  watch: {
    currProject: {
      handler(newValue, oldValue) {
        if (!newValue) return
        this.$nextTick(() => {
          const naviTree = this.$refs.variablesTree as InstanceType<
          typeof ElTree
        >
          naviTree.setCurrentKey(newValue.id)
        })
      },
      deep: true,
      immediate: true
    },
    dataLinks: {
      handler(newValue, oldValue) {
        if (!newValue) return
        const fileListArr = [] as any []
        newValue.map((item:any) => {
          fileListArr.push(...item.fileList)
        })
        console.log(this.projects, 'projects')
        console.log(fileListArr, 'fileListArr')
        this.formatDataSource(fileListArr)
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.queryAllCleanProjectFromDB()
  },
  methods: {
    ...mapMutations(['showOutPutView', 'hideOutPutView', 'showFormulaItem', 'hideFormulaItem', 'updateCurrentProject']),
    ...mapActions(['addProjectDataSourceDialog', 'formatDataSource', 'updateCleanProjectOutputName', 'updateCleanProjectName', 'deleteProject', 'updateCurrentProjectActions', 'deleteProjectDataSource', 'deleteProjectOutput', 'addNewProject', 'createNewEmptyCleanProject', 'createNewCleanProject', 'queryAllCleanProjectFromDB', 'createNewCleanProjectOutput']),

    closeDialog() {
      try {

      } catch (error) {

      }
      this.addDataSource = {
        nameList: [],
        id: 0,
        projectName: '',
        child: true,
        type: ''
      }
      this.visible = false
    },
    handlew(node, data) {
      console.log(data)
      let meArr = []
      const m = [
        {
          title: '重命名',
          shortCut: '',
          onClick: () => this.renameNav(data)
        }
      ]
      if (data.parentId === '0') {
        meArr.push(...m)
      } else if (data.id && data.type === 'output') {
        meArr.push(...m)
      }
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: meArr
      })
    },
    renameNav(data) {
      console.log(data)
      data.status = 1
      data.isRename = true
    },
    setCurKey(data) {
      this.$nextTick(() => {
        const naviTree = this.$refs.variablesTree as InstanceType<
          typeof ElTree
        >
        naviTree.setCurrentKey(data.id)
        this.$nextTick(() => {
          const treeElement = naviTree.$el as HTMLElement
          const currentNodeElement = document.getElementsByClassName(
            'el-tree-node is-current'
          )[0] as HTMLElement
          const yDiff =
            currentNodeElement.getBoundingClientRect().y -
            treeElement.getBoundingClientRect().y
          if (yDiff > treeElement.getBoundingClientRect().height) {
            treeElement.scrollTop = treeElement.scrollTop + yDiff
          }
        })
      })
    },
    onClickDataTree(node: any) {
      console.log(node)
      this.updateCurrentProjectActions(node)
    },
    dataSourceOptionsList() {
    },
    handleCurrentChange(data: any) {
      if (data.type === 'output') {
        this.showOutPutView()
        this.hideFormulaItem()
      } else if (data.type === 'coding') {
        this.showFormulaItem()
        this.hideOutPutView()
      } else {
        this.hideOutPutView()
        this.hideFormulaItem()
      }
    },
    addProjectFeatures(node, data) {
      if (data.name === 'DataSource') {
        const currProject = this.projects.filter(filter => filter.id === data.parentId)[0]
        this.dataSourceSelect = []
        currProject.children[0].children?.map(item => {
          this.dataSourceSelect.push(item.id)
        })
        this.visible = true
        this.addDataSource.type = data.type
        this.projectList.map(item => {
          if (item.id === data.parentId) {
            this.addDataSource.projectName = item.name
            this.addDataSource.id = item.id
            this.addDataSource.child = true
          }
        })
        this.dataSourceOptionsList()

        // data.children = this.dataSourceName
      } else if (data.name === 'Output') {
        node.expanded = true
        const outPutChildren = {
          id: new Date().getTime(),
          status: 1,
          parentId: data.parentId,
          child: true,
          name: '',
          value: '',
          type: data.type
        }
        data.children.push(outPutChildren)
      }
    },
    onCreateProject() {
      const projectItem = {
        id: 'newProject-' + this.id++,
        status: 1,
        name: '',
        parentId: '0',
        child: true,
        type: '',
        children: [
          {
            name: 'DataSource',
            type: 'dataSource',
            children: []
          },
          {
            name: 'Coding',
            type: 'coding'
          },
          {
            name: 'Output',
            type: 'output',
            children: []
          }
        ]
      }
      this.createNewEmptyCleanProject(projectItem)
    },
    deleteProjectItem(node: Project, data: any) {
      this.$alert(`确认要删除${data.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      })
        .then(() => {
          if (data.type === 'output') {
            this.deleteProjectOutput(data)
          } else if (data.type === 'dataSource') {
            this.deleteProjectDataSource(data)
          } else {
            const index = this.projectList.findIndex(item => item.id === data.id)
            this.projectList.splice(index, 1)
            this.deleteProject(data.id).catch((err) => {
              this.$message.error(err.message)
            })
          }
        })
        .catch(() => { })
    },
    hanldeEnter(data: any) {
      if (data.name === '') {
        ElMessage({
          message: '名称不可以为空！',
          type: 'error'
        })
        return false
      }
      if (this.nameRepeatCheck(data)) {
        ElMessage({
          message: '名称不可以重复！',
          type: 'warning'
        })
        return false
      }
      if (!ValidationName(data?.name)) {
        ElMessage({
          message: '名称格式错误，请重新输入！',
          type: 'warning'
        })
        return false
      }
      data.status = 0
      // this.addNewProject(data)
      if (data.type !== 'output') {
        if (data?.isRename) {
          this.updateCleanProjectName(data)
        } else {
          this.createNewCleanProject(data)
        }

        this.setCurKey(data)
      } else {
        if (data?.isRename) {
          this.updateCleanProjectOutputName(data)
        } else {
          this.createNewCleanProjectOutput(data)
        }

        this.setCurKey(data)
      }
    },
    nameRepeatCheck(data) {
      const somes = this.projectList.filter(item => item.name === data.name)
      return somes.length > 1
    },
    async onSubmitDataSource() {
      const fileList = []
      this.dataSourceSelect.map(item => {
        const filterInfo = this.dataLinksFileListArr.filter((datalink: any) => { return datalink.id === item })[0]
        filterInfo.baseName = filterInfo.name
        if (filterInfo.name.indexOf(filterInfo.navName) === -1) {
          filterInfo.name = filterInfo.name + '(' + filterInfo.navName + ')'
        }

        fileList.push(filterInfo)
      })

      this.addDataSource.fileList = []
      this.addDataSource.fileList.push(...fileList) //= fileList
      this.addProjectDataSourceDialog(this.addDataSource).then(result => {
        this.closeDialog()
        this.saveUpdatedCurrentDataSourceToDB()
      }).catch(err => {
        if (err instanceof UnsavedProjectExistsError) {
          this.$message.warning('当前存在新建的未保存Data Source，请先设置该Data Source')
        }
      }
      )
    }
  }
})
</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#project-navigator {
  height: 100%;
  border-right: 1px solid var(--nova-border-color);
  background: $naviBgColor;
  padding: 10px;
  #header {
    display: flex;
    justify-content: space-between;
    align-content: center;
    span {
      font-size: 110%;
      font-weight: 500;
      color: var(--el-text-color-regular);
    }
  }
  .search {
    margin-bottom: 10px;
  }
  .navi-tree {
    overflow: auto;
  }
  .project-box {
    background: $naviBgColor;
    .el-overlay.is-message-box {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      margin: auto;
    }
  }
  .add-data-source {
    &:deep(.el-dialog__body) {
      overflow: hidden;
    }
    &:deep(.el-dialog__footer) {
      text-align: center;
    }
    .chooseFileButton {
      margin-bottom: 4px;
    }
  }
}
</style>
