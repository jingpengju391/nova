<template>
  <div
    style="
      flexflow: column nowrap;
      padding-top: 12px;
      width: 100%;
      height: calc(100% - 40px);
    "
  >
    <div class="toolBar">
      <!-- don't need to float from now on，poor float performance 11.3 -->
      <!-- as little DOM structure as possible 11.3 -->
      <el-button
        type="primary"
        icon="download"
        @click="onImportClick"
        :disabled="!currentDataModelNode"
        >导入</el-button
      >
      <el-button
        class="delete-btn"
        icon="delete"
        :disabled="selections.length <= 0 || !currentDataModelNode"
        @click="onDeleteClicked"
        >删除</el-button
      >
      <!-- have to declar style inline here, otherwise, the float won't work -->
      <!-- have to declar style inline here, otherwise, the float won't work -->

      <el-date-picker
        v-model="dateFilter"
        type="datetimerange"
        class="dateFilter"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
      />
      <el-input
        v-model="keywordFilter"
        class="keywordFilter"
        placeholder="请输入关键词/文件路径"
        prefix-icon="search"
        clearable
      />
      <i class="iconfont">&#xe663;</i>
      <el-input
        v-model="keywordReplace"
        class="keywordReplace"
        placeholder="请输入替换内容"
        clearable
      >
        <template #prefix>
          <el-icon @click="handleReplace">
            <finished />
          </el-icon>
        </template>
      </el-input>
      <!-- have to declar style inline here, .dateFilter::after won't work -->
      <!-- <div style="clear: both; margin-bottom: 10px"></div> -->
    </div>
    <el-table
      :data="filteredDataInputs"
      @selection-change="onSelectionChange"
      tooltip-effect="light"
      :header-cell-style="{
        background: '#eef1f6',
        color: '#606266',
        textAlign: 'center',
      }"
      v-loading="filteredDataInputs.length === 0 && !flag"
      class="data-table-box"
      :cell-style="{ textAlign: 'center' }"
      style="width: 100%; flex: 1; margin-top: 20px; userselect: none；"
      height="90%"
      @row-dblclick="onPreviewDataInput"
      @row-click="temporaryImportName = ''"
      @row-contextmenu="onDataInputRightClick"
      :row-class-name="tableRowClassName"
    >
      <template #empty>无数据源</template>
      <el-table-column type="selection" width="55" fixed />
      <el-table-column prop="name" label="数据源名称" width="150">
        <template #default="scopedProps">
          <el-input
            @change="
              (value) => {
                onNameChange(scopedProps.row, value);
              }
            "
            v-model="scopedProps.row.name"
            :input-style="{
              border: 'none',
              textAlign: 'center',
              color: scopedProps.row.isExistsAbsolutePath ? '' : '#f56c6c',
            }"
          />
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" width="100" />
      <el-table-column
        prop="relativePath"
        label="相对路径"
        show-overflow-tooltip
      >
        <template #default="scopedProps">
          <el-input
            :step="false"
            @change="(value) => onRelativePathChange(scopedProps.row, value)"
            v-model="scopedProps.row.relativePath"
            :input-style="{ border: 'none', textAlign: 'center' }"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="absolutePath"
        label="绝对路径"
        show-overflow-tooltip
      >
        <template #default="scopedProps">
          <el-input
            @change="(value) => onAbsolutePathChange(scopedProps.row, value)"
            v-model="scopedProps.row.absolutePath"
            :input-style="{
              border: 'none',
              textAlign: 'center',
              color: scopedProps.row.isExistsAbsolutePath ? '' : '#f56c6c',
            }"
          />
        </template>
      </el-table-column>
      <el-table-column
        prop="createdAt"
        sortable
        label="文件创建日期"
        width="160"
      />
      <el-table-column prop="updatedAt" label="最近修改日期" width="160" />
    </el-table>

    <el-drawer
      v-model="isPreviewOpen"
      :destroy-on-close="true"
      :modal="true"
      :title="previewTitle"
      size="50%"
      direction="rtl"
    >
      <div id="previewBox" ref="previewBoxRef">
        <el-table
          id="previewTable"
          :height="height"
          :data="previewTableData"
          border
          :header-cell-style="{
            background: '#eef1f6',
            color: '#606266',
            textAlign: 'center',
          }"
        >
          <el-table-column
            v-for="(columnHeader, index) in previewTableHeaders"
            :key="index"
            :label="columnHeader"
            :prop="columnHeader"
          />
        </el-table>
      </div>
    </el-drawer>

    <!-- <import-file-dialog v-if="dialogFileVisible" extension=".csv" @chooseFile="chooseFile" @closeDialog="closeChooseFileDialog"/> -->
    <!-- <upload-file v-if="uploadFileVisible" extension=".csv" @closeDialog="handleUploadFile"/> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue'
import { createNamespacedHelpers, useStore } from 'vuex'
import type { DataInputFile } from '@shared/dataModelTypes'
import { parseDateString, formateTime } from './utils'
import { evalRight, getModelNavigationNodeIdAndType } from '@/utils'
import { useDataInputsAPIs, useAssumptionTableAPIs, userAPIs, useAppSettingsAPIs } from '../../hooks/apis'
import dataInputsDataSource from '@/store/modules/dataInputsDataSource'
import { ElMessageBox } from 'element-plus'
import { ModelNavigationNodeType } from '@shared/dataModelTypes/models/models'
import ElementResizeDetectorMaker from 'element-resize-detector'
import ImportFileDialog from '../components/ImportFileDialog/index.vue'
import UploadFile from '../components/Workspace/UploadFile.vue'
import { clone } from '@shared/functional'
// import * as AsyncComputed from 'vue3-async-computed'
const { mapState, mapActions, mapGetters } = createNamespacedHelpers('dataInputs/')
export default defineComponent({
  components: {
    ImportFileDialog, UploadFile
  },
  data() {
    return {
      height: 0,
      flag: false,
      filteredDataInputsIL: [] as DataInputFile[],
      selections: [] as DataInputFile[],
      keywordFilter: '',
      keywordReplace: '',
      dateFilter: [] as Date[],
      isPreviewOpen: false,
      previewTitle: '',
      temporaryImportName: '',
      previewData: [] as string[], // contains both the table header and the table cell data
      dialogFileVisible: false,
      relativePath: '',
      uploadFileVisible: false
    }
  },
  computed: {
    ...mapGetters(
      {
        dataInputs: 'getFiles',
        dataNaviTree: 'dataNaviTree'
      }
    ),
    ...mapState({
      currentDataModelNode: 'currentDataModelNode'
    }),
    previewTableHeaders(): string[] {
      if (this.previewData.length > 0) {
        return this.previewData[0].split(',')
      }
      return []
    },
    previewTableData(): any[] {
      if (this.previewData.length > 0) {
        const tableHeaders = this.previewTableHeaders
        const dataPointsArray = this.previewData.slice(1).map(line => line.split(',')).filter(a => a.length === tableHeaders.length)
        const tableData = dataPointsArray.map(data => {
          const dataSourcePoint = {} as any
          data.forEach((item, itemIndex) => {
            dataSourcePoint[tableHeaders[itemIndex]] = item
          })
          return dataSourcePoint
        })
        return tableData
      }
      return []
    },
    filteredDataInputs(): DataInputFile[] {
      if (!this.filteredDataInputsIL || !this.flag) return []
      return this.filteredDataInputsIL.filter((d: DataInputFile) => {
        const fileDate = parseDateString(d.createdAt)
        let dateFilterResult = true
        if (this.dateFilter && this.dateFilter.length && this.dateFilter.length === 2) {
          dateFilterResult = fileDate?.getTime() >= this.dateFilter[0]?.getTime() &&
            fileDate?.getTime() <= this.dateFilter[1]?.getTime()
        }
        const keywordFilterResult = d.name.includes(this.keywordFilter) ||
          d.absolutePath.includes(this.keywordFilter) ||
          d.relativePath.includes(this.keywordFilter)
        return dateFilterResult && keywordFilterResult
      })
    },
    moduleName() {
      if (this.workspace) {
        const pathList = this.workspace.dirPath.replace(/\\/g, '/').split('/')
        return pathList.pop()
      }
      return ''
    }
  },
  methods: {
    ...mapActions([
      'addDataInputWithDBSync',
      'deleteDataInputsWithDBSync',
      'updateDataInputsFilesWithDBSync',
      'rollBackDataInputName',
      'updateDataInputsFilesBatchWithDBSync'
    ]),
    tableRowClassName({ row }) {
      return row.name === this.temporaryImportName ? 'success-row' : ''
    },
    async onImportClick() {
      this.temporaryImportName = ''
      try {
        const relativePath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, this.currentDataModelNode.name)
        if (userAPIs().login) {
          this.uploadFileVisible = true
          //   // this.dialogFileVisible = true
          // this.relativePath = relativePath
        } else {
          this.addDataInputWithDB(relativePath)
        }
      } catch (err) {
        this.$message.error(`无法导入数据源，请重启软件继续操作: ${err.message}`)
      }
    },
    async addDataInputWithDB(relativePath: string, filePath = '') {
      const { canceled, dataInputFile } = await useDataInputsAPIs().import(relativePath, filePath)
      if (canceled || !dataInputFile) return
      // eslint-disable-next-line no-unmodified-loop-condition
      const { id, type } = getModelNavigationNodeIdAndType(this.currentDataModelNode.id)
      const distr = type === ModelNavigationNodeType.models ? 'modelId' : 'blockId'
      dataInputFile[distr] = id
      while (!this.validateName(dataInputFile!.id, dataInputFile!.name)) {
        dataInputFile!.name = dataInputFile!.name + '_copy'
      }
      dataInputFile.blockKey = 'field'
      dataInputFile.blockVal = dataInputFile.name
      this.addDataInputWithDBSync(dataInputFile).then(res => {
        this.temporaryImportName = dataInputFile.name
        this.$message.success(`导入数据源${dataInputFile.name}成功！`)
        this.dialogFileVisible = false
      })
    },
    handleUploadFile(filePath: string) {
      this.uploadFileVisible = false
      if (filePath) { this.addDataInputWithDB(this.relativePath, filePath) }
    },
    chooseFile(filePath: string) {
      this.addDataInputWithDB(this.relativePath, filePath)
    },
    closeChooseFileDialog() {
      this.dialogFileVisible = false
    },
    onSelectionChange(dataInputs: DataInputFile[]) {
      this.selections = dataInputs
    },
    onDeleteClicked() {
      const dataInputIds = this.selections.map(s => s.id)
      const selectObDataInputs = this.filteredDataInputs.filter(s => dataInputIds.indexOf(s.id) !== -1)
      const names = selectObDataInputs.map(s => s.name)
      let str = ''
      if (names.length > 1) {
        str = '批量'
      }
      ElMessageBox.confirm(`确定${str}删除 [ ${names} ] 吗？`, {
        type: 'warning'
      })
        .then(() => {
          this.deleteDataInputsWithDBSync(dataInputIds)
        })
        .catch(() => { })
    },
    onNameChange(row: DataInputFile, newValue: string) {
      if (this.validateName(row.id, newValue)) {
        this.updateDataInputsFilesWithDBSync(row)
      } else {
        this.$message.error(`“${newValue}”与其他数据源重名，请重新修改名称`)
        this.rollBackDataInputName(row)
      }
    },
    onRelativePathChange(row: DataInputFile) {
      const relativePath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, this.currentDataModelNode.name)
      row.absolutePath = row.isRelative ? useDataInputsAPIs().pathJoin(relativePath, row.relativePath) : row.relativePath
      this.updateDataInputsFilesWithDBSync(row)
    },
    onAbsolutePathChange(row: DataInputFile) {
      const relativePath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, this.currentDataModelNode.name)
      const isRelative = row.absolutePath.indexOf(relativePath) !== -1
      row.relativePath = isRelative ? row.absolutePath.split(relativePath)[1] : row.absolutePath
      row.isRelative = isRelative
      this.updateDataInputsFilesWithDBSync(row)
    },
    async onPreviewDataInput(row: DataInputFile, column: any, event: Event) {
      this.temporaryImportName = ''
      try {
        const data = await useDataInputsAPIs().getDataInputPreview(row.absolutePath)
        this.previewData = data
        this.previewTitle = row.name + ' 预览'
      } catch (err) {
        this.$message.error(`无法预览数据源: ${err.message}`)
        this.isPreviewOpen = false
        return
      }
      this.isPreviewOpen = true
    },
    onDataInputRightClick(dataInput: DataInputFile, column: any, event: MouseEvent) {
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: [
          {
            title: '删除',
            shortCut: 'Ctrl+D',
            onClick: () => {
              this.$alert(`确定要删除数据源 ${dataInput.name}?`, '提示', {
                confirmButtonText: '确 定',
                cancelButtonText: '取 消',
                showCancelButton: true
              }).then(() => {
                this.deleteDataInputsWithDBSync([dataInput.id])
              }).catch(() => { })
            }
          }
        ]
      })
    },
    validateName(currentID: number, newName: string): boolean {
      if (this.dataInputs === undefined) return true
      return !this.dataInputs.some((d: DataInputFile) => d.name === newName && d.id !== currentID)
    },
    async setData() {
      this.flag = false
      setTimeout(() => {
        this.flag = true
      }, 300)
      this.temporaryImportName = ''
      this.filteredDataInputsIL = [] as DataInputFile[]
      this.dataInputs.forEach(async (d: DataInputFile, index: number) => {
        const isExAbsolutePath = await useAssumptionTableAPIs().isExists(d.absolutePath)
        const isExRelativePath = await useAssumptionTableAPIs().isExists(d.relativePath)
        useAssumptionTableAPIs().isDeleteDir(d.absolutePath).then(resu => {
          this.setData()
        })
        if (isExRelativePath) {
          const relativePath = d.isRelative ? useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, this.currentDataModelNode.name, d.relativePath) : d.relativePath
          const params: any = await dataInputsDataSource.handleDataInputsByRelativePath(d, relativePath)
          d.size = params.size
          d.createdAt = formateTime(params.createdAt)
          d.updatedAt = formateTime(params.updatedAt)
          d.isExistsAbsolutePath = isExAbsolutePath
          d.isExistsRelativePath = isExRelativePath
        } else if (isExAbsolutePath) {
          const params: any = await dataInputsDataSource.handleDataInputs(d)
          d.size = params.size
          d.createdAt = formateTime(params.createdAt)
          d.updatedAt = formateTime(params.updatedAt)
          d.isExistsAbsolutePath = isExAbsolutePath
          d.isExistsRelativePath = isExRelativePath
        } else {
          d.size = '0'
          d.isExistsAbsolutePath = isExAbsolutePath
          d.isExistsRelativePath = isExRelativePath
        }

        this.filteredDataInputsIL[index] = d
      })
    },
    async handleReplace() {
      const { keywordFilter, keywordReplace, calcReplacePath } = this
      const relativePath = await useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, this.currentDataModelNode.name, ' ')
      if (keywordFilter && keywordReplace) {
        const result: DataInputFile[] = await this.calcReplacePath(relativePath)
        this.updateDataInputsFilesBatchWithDBSync(result)
        this.keywordFilter = ''
        this.keywordReplace = ''
      } else {
        this.$message.error('请输入正确信息')
      }
    },
    async calcReplacePath(relativePath) {
      const { keywordFilter, keywordReplace, filteredDataInputs } = this
      const rule = new RegExp(keywordFilter, 'g')

      const isWin = useAppSettingsAPIs().isWin()
      let RootPath = {
        relativePath: ''
      }
      RootPath.relativePath = relativePath.trim()// isWin ? relativePath.replace(/\\/g, '\\\\').toString() : relativePath
      const result: DataInputFile[] = []
      for (let i = 0; i < filteredDataInputs.length; i++) {
        filteredDataInputs[i].absolutePath = await filteredDataInputs[i].absolutePath.replace(keywordFilter, keywordReplace)
        const absolutePath = clone(filteredDataInputs[i].absolutePath)
        if (absolutePath.indexOf(RootPath.relativePath.trim()) !== -1) {
          filteredDataInputs[i].isRelative = true
          filteredDataInputs[i].relativePath = absolutePath.slice(RootPath.relativePath.trim().length)
        } else {
          filteredDataInputs[i].isRelative = false
          filteredDataInputs[i].relativePath = absolutePath
        }
        result.push(filteredDataInputs[i])
      }
      return result
    },
    onHeight() {
      const Erd = ElementResizeDetectorMaker()
      Erd.listenTo(this.$refs.previewBoxRef as HTMLElement, (element: HTMLElement) => {
        this.height = element.offsetHeight
      })
    }
  },
  mounted() {
    this.setData()
  },
  watch: {
    dataInputs: {
      handler(val) {
        this.setData()
      },
      deep: true
    },
    isPreviewOpen(val) {
      this.$nextTick(() => {
        val && this.onHeight()
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.toolBar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  .delete-btn {
    margin-right: auto;
  }
  .keywordFilter,
  .keywordReplace {
    max-width: 200px;
  }
  .keywordFilter {
    margin-left: 10px;
  }
  .keywordReplace {
    &:deep(.el-input__prefix) {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 5px;
    }
  }
  .el-message-box {
    width: 600px !important;
  }
}
</style>
<style scoped>
#previewBox {
  width: 100%;
  height: 100%;
}
#previewTable {
  width: 100%;
  /* height: calc(100% - 40px);
  width: 100%; */
}
.el-overlay {
  background-color: rgba(0, 0, 0, 0);
}
.data-table-box .success-row {
  --el-table-tr-background-color: var(--el-color-success-lighter);
}
</style>
