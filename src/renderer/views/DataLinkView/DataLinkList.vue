<template>
  <div id="dataLink-property" @click="serchShow = false">
    <div id="header">
      <span>数据链接列表</span>
      <div class="header-button-box">
        <el-icon class="searchIcon" color="#409EFC" @click.stop="changeSearchShow"
          ><search
        /></el-icon>
        <el-button
          class="delete-btn"
          type="primary"
          icon="download"
          @click="addDataLinkFiles"
          :disabled="!currDataLink"
          >导入</el-button
        >
        <el-button
          class="delete-btn"
          icon="delete"
          :disabled="selections.length <= 0 || !currDataLink"
          @click="onDeleteClicked"
          >删除</el-button
        >
      </div>
    </div>
    <div class="toolBar" v-show="serchShow" @click.stop="serchShow = true">
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
    </div>
    <el-table
      ref="multipleTable"
      :data="dataLinkFilesArr"
      :cell-style="{ textAlign: 'center' }"
      style="width: 100%; flex: 1; margin-top: 20px; userselect: none；"
      height="90%"
      tooltip-effect="light"
      :header-cell-style="{
        background: '#eef1f6',
        color: '#606266',
        textAlign: 'center',
      }"
      @selection-change="onSelectionChange"
      @row-contextmenu="onDataInputRightClick"
      @row-dblclick="onPreviewDataInput"
    >
      <el-table-column fixed type="selection" width="55"> </el-table-column>
      <!-- <el-table-column prop="name" label="名称" width="300"> </el-table-column> -->
      <el-table-column prop="name" label="名称" width="150">
        <template #default="scope">
          <el-input
            @change="
              (value) => {
                onNameChange(scope.row, value);
              }
            "
            v-model="scope.row.name"
           :input-style="{
              border: 'none',
              textAlign: 'center',
              color: scope.row.isExistsAbsolutePath ? '' : '#f56c6c',
            }"
          />
          <!-- <span style="color: #f56c6c">{{ scope.row.name }}</span> -->
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="absolutePath"
        show-overflow-tooltip
        label="绝对路径"
      >
        <template v-slot="scope">{{ scope.row.absolutePath }}</template>
      </el-table-column> -->
      <!-- <el-table-column
        prop="relativePath"
        show-overflow-tooltip
        label="相对路径"
      >
        <template v-slot="scope">{{ scope.row.relativePath }}</template>
      </el-table-column> -->
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
        prop="size"
        width="100"
        label="大小"
        show-overflow-tooltip
      >
      </el-table-column>
      <el-table-column
        prop="updatedAt"
        label="导入日期"
        width="300"
        show-overflow-tooltip
      >
      </el-table-column>
    </el-table>
    <el-drawer
      v-model="isPreviewOpen"
      :destroy-on-close="true"
      :modal="true"
      :title="previewTitle"
      size="50%"
      direction="rtl"
    >
      <el-table
        :data="previewTableData"
        border
        style="width: 100%"
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
    </el-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { useDataInputsAPIs, useAssumptionTableAPIs } from '../../hooks/apis'
import { ElMessageBox } from 'element-plus'
import { DataLink, DataLinkFile } from '@shared/dataModelTypes/models/dataLink'
import { asyncForEach } from '@shared/commonUtils'
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('dataLink/')
export default defineComponent({
  data() {
    return {
      selections: [] as DataLink[],
      temporaryImportName: '',
      isPreviewOpen: false,
      previewData: [] as string[],
      previewTitle: '',
      keywordFilter: '',
      keywordReplace: '',
      serchShow: false,
      dataLinkFilesArr: [] as any[]
    }
  },
  watch: {
    currDataLink: {
      handler(newValue) {
        if (!newValue) return
        if (newValue) {
        }
      },
      deep: true
    },
    file: {
      handler(newValue) {
        if (!newValue) return
        if (newValue) {
          this.getDataLinkFiles()
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapState(['currDataLink', 'file', 'dataLinks']),
    previewTableHeaders(): string[] {
      if (this.previewData.length > 0) {
        return this.previewData[0].split(',')
      }
      return []
    },
    previewTableData(): any[] {
      console.log('previewTableData')
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
    }

  },
  methods: {
    ...mapActions(['deleteDataCleanSource', 'rollBackDataInputName', 'insertDataCleanSourceImpotToDB', 'updateDataCleanFilesBatchWithDBSync']),
    onSelectionChange(dataInputs: DataLink[]) {
      this.selections = dataInputs
    },
    async getDataLinkFiles() {
      this.dataLinkFilesArr = [] as any[]
      this.file.forEach(async (d: any, index: number) => {
        const isExAbsolutePath = await useAssumptionTableAPIs().isExists(d.absolutePath)
        const isExRelativePath = await useAssumptionTableAPIs().isExists(d.relativePath)
        useAssumptionTableAPIs().isDeleteDir(d.absolutePath).then(resu => {
          this.getDataLinkFiles()
        })
        if (isExRelativePath) {
          d.isExistsAbsolutePath = isExAbsolutePath
          d.isExistsRelativePath = isExRelativePath
        } else if (isExAbsolutePath) {
          d.isExistsAbsolutePath = isExAbsolutePath
          d.isExistsRelativePath = isExRelativePath
        } else {
          d.isExistsAbsolutePath = isExAbsolutePath
          d.isExistsRelativePath = isExRelativePath
        }

        this.dataLinkFilesArr[index] = d
      })
    },
    onDeleteClicked() {
      const dataInputIds = this.selections.map(s => s.id)
      const selectObDataInputs = this.file.filter(s => dataInputIds.indexOf(s.id) !== -1)
      const names = selectObDataInputs.map(s => s.name)
      let str = ''
      if (names.length > 1) {
        str = '批量'
      }
      ElMessageBox.confirm(`确定${str}删除 [ ${names} ] 吗？`, {
        type: 'warning'
      })
        .then(() => {
          this.deleteDataCleanSource(dataInputIds)
        })
        .catch(() => { })
    },
    changeSearchShow() {
      this.serchShow = !this.serchShow
    },
    async addDataLinkFiles() {
      const relativePath = useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath)
      const { canceled, dataInputFiles } = await useDataInputsAPIs().dataSourceImport(relativePath)
      dataInputFiles?.forEach(dataInputFile => {
        while (!this.validateName(dataInputFile!.id, dataInputFile!.name)) {
        dataInputFile!.name = dataInputFile!.name + '_copy'
        }
      })
      this.insertDataCleanSourceImpotToDB(dataInputFiles)
    },
    // validateName(currentID: number, newName: string): boolean {
    //   if (!this.dataLinkFilesArr.length) return true
    //   return !this.dataLinkFilesArr.some((d: any) => d.name === newName && d.id !== currentID)
    // },
    async onPreviewDataInput(row: any, column: any, event: Event) {
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
    onRelativePathChange(row: any) {
      row.isRelative = true
      row.absolutePath = row.isRelative ? useDataInputsAPIs().pathJoin(this.$store.getters.getCurrentWorkspaceDirPath, row.relativePath) : row.relativePath
      this.updateDataCleanFilesBatchWithDBSync([row])
    },
    onAbsolutePathChange(row: any) {
      const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
      const isRelative = row.absolutePath.indexOf(relativePath) !== -1
      row.relativePath = isRelative ? row.absolutePath.split(relativePath)[1] : row.absolutePath
      row.isRelative = isRelative
      this.updateDataCleanFilesBatchWithDBSync([row])
    },
    onDataInputRightClick(dataInput: any, column: any, event: MouseEvent) {
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: [
          {
            title: '删除',
            shortCut: '',
            onClick: () => {
              this.$alert(`确定要删除数据源 ${dataInput.name}?`, '提示', {
                confirmButtonText: '确 定',
                cancelButtonText: '取 消',
                showCancelButton: true
              }).then(() => {
                this.deleteDataCleanSource([dataInput.id])
              }).catch(() => { })
            }
          },
          {
            title: '查看详情',
            shortCut: '',
            onClick: () => {
              this.onPreviewDataInput(dataInput, column, event)
            }
          }
        ]
      })
    },
    handleReplace() {
      const { keywordFilter, keywordReplace, calcReplacePath } = this
      if (keywordFilter && keywordReplace) {
        const result: any[] = this.calcReplacePath()
        this.updateDataCleanFilesBatchWithDBSync(result)
        this.keywordFilter = ''
        this.keywordReplace = ''
      } else {
        this.$message.error('请输入正确信息')
      }
    },
    onNameChange(row: any, newValue: string) {
      console.log(newValue, 'dddd')
      if (this.validateName(row.id, newValue)) {
        this.updateDataCleanFilesBatchWithDBSync([row])
      } else {
        this.$message.error(`“${newValue}”与其他数据源重名，请重新修改名称`)
        this.rollBackDataInputName(row)
      }
    },
    validateName(currentID: number, newName: string): boolean {
      if (this.file === undefined) return true
      return !this.file.some((d: any) => d.name === newName && d.id !== currentID)
    },
    calcReplacePath() {
      const getCurrentWorkspaceDirPath = this.$store.getters.getCurrentWorkspaceDirPath
      const { keywordFilter, keywordReplace, filteredDataInputs } = this
      const rule = new RegExp(keywordFilter, 'g')

      const result: any[] = this.file.map((item: any) => {
        if (keywordReplace.indexOf(getCurrentWorkspaceDirPath) !== -1) {
          item.isRelative = true
          item.relativePath = useDataInputsAPIs().pathJoin(keywordReplace.substring(getCurrentWorkspaceDirPath.length), item.relativePath)
        } else {
          item.isRelative = false
        }
        item.absolutePath = item.absolutePath.replace(keywordFilter, keywordReplace)
        item.relativePath = item.relativePath.replace(keywordFilter, keywordReplace)
        return item
      })
      return result
    }

  }
})

</script>

<style lang="scss" scoped>
@import "../../assets/_naviNode.scss";
#dataLink-property {
  height: 100%;
  border-left: 1px solid var(--nova-border-color);
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
    margin-bottom: 10px;
    .header-button-box {
      display: flex;
      align-items: center;
      .searchIcon {
        margin-right: 10px;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
  .toolBar {
    display: flex;
    justify-content: flex-start;
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
  .search {
    margin-bottom: 10px;
  }
  .navi-tree {
    overflow: auto;
  }
}
</style>
