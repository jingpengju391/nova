<template>
  <div class="task-table-box">
    <div class="table-btn-box">
      <el-button type="danger" @click="handleDeleteAllClick" size="small" round
        >全部删除</el-button
      >
    </div>

    <el-table
      :data="taskMoint"
      border
      style="width: 100%"
      height="98%"
      @selection-change="handleSelectionChange"
      @row-dblclick="handleDblclickChangeRow"
    >
      <!-- <el-table-column type="selection" width="55" /> -->
      <el-table-column
        type="index"
        label="编号"
        width="60"
        show-overflow-tooltip
        sortable
      />
      <el-table-column
        prop="taskName"
        sortable
        label="任务名称"
        show-overflow-tooltip
      />
      <el-table-column
        prop="outputAddress"
        label="输出地址"
        show-overflow-tooltip
        sortable
      >
        <template #default="scope">
          <span
            v-show="!scope.row.isEx && scope.row.outputChildAddress"
            style="color: red"
            >{{ scope.row.outputChildAddress }}
          </span>
          <span
            v-show="!scope.row.isEx && !scope.row.outputChildAddress"
            style="color: red"
            >{{ scope.row.outputChildAddress }}
          </span>
          <span
            v-show="scope.row.isEx && scope.row.outputChildAddress"
            style="cursor: pointer"
            @click="handleOpenDir(scope.row)"
            >{{ scope.row.outputChildAddress }}</span
          >
          <span
            v-show="scope.row.isEx && !scope.row.outputChildAddress"
            style="cursor: pointer"
            @click="handleOpenDir(scope.row)"
            >{{ scope.row.outputAddress }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        sortable
        label="运行状态"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span v-if="scope.row.status === 1">已完成</span>
          <!-- 2 为运行projection失败，8是编译失败 -->
          <span v-else-if="scope.row.status === 2">运行失败</span>
          <span v-else-if="scope.row.status === 3">跳点警告</span>
          <span v-else-if="scope.row.status === 4 || scope.row.status === 5"
            >已停止</span
          >
          <span v-else-if="scope.row.status === 6">停止中</span>
          <span v-else-if="scope.row.status === 7">等待中</span>
          <span v-else-if="scope.row.status === 8">编译失败</span>
          <span v-else-if="scope.row.status === 9">创建失败</span>
          <!-- 排队中任务开始后，status更新为0 -->
          <span v-else>运行中</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="submitTime"
        sortable
        label="开始时间"
        show-overflow-tooltip
      >
        <template #default="scope">
          <span>{{ scope.row.submitTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="completedTime"
        label="完成时间"
        show-overflow-tooltip
        sortable
      />
      <el-table-column prop="submitter" label="提交人" show-overflow-tooltip />
      <el-table-column
        prop="modelName"
        label="模型名称"
        show-overflow-tooltip
        sortable
      />
      <el-table-column
        fixed="right"
        label="Operations"
        width="135"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-button
            type="text"
            size="small"
            @click="handleDblclickChangeRow(scope.row)"
            >详情</el-button
          >
          <el-button
            type="text"
            style="color: #f56c6c"
            @click="handleDeleteClick(scope.row.id)"
            size="small"
            >删除</el-button
          >
          <el-button
            type="text"
            style="color: #f56c6c"
            @click="handleStopClick(scope.row.id)"
            :disabled="scope.row.status == 6 ? true : false"
            size="small"
            >停止</el-button
          >
          <el-button
            v-if="isBS"
            type="text"
            @click="handleDownloadClick(scope.row)"
            size="small"
            >下载</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <TaskDetailsDialog :FolderPath="FolderPath" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { createNamespacedHelpers } from 'vuex'
import { useDataInputsAPIs, useAssumptionTableAPIs, useTasksAPIs, userAPIs } from '../../../hooks/apis'
import { formatDate } from '../utils'
import TaskDetailsDialog from '../TaskDetailsDialog/index.vue'
import { taskMonit } from '@shared/tasks'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { v } from 'vxe-table'
const { mapState, mapMutations, mapActions, mapGetters } = createNamespacedHelpers('tasks/')
export default defineComponent({
  components: {
    TaskDetailsDialog
  },
  data() {
    return {
      multipleSelection: [],
      taskMO: [],
      FolderPath: {
        count: 0,
        path: '',
        name: '',
        id: 0
      },
      isBS: false
    }
  },
  computed: {
    ...mapState(['taskMonits', 'printLines']),
    taskMoint() {
      this.taskMonits.map((item: taskMonit) => {
        if (item.submitTime !== '') {
          item.submitTime = formatDate(item.submitTime)
        } else {
          item.submitTime = ''
        }
        if (item.completedTime !== '') {
          item.completedTime = formatDate(item.completedTime)
        }
        const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
        if (item.outputChildAddress) {
          const folderPath = useDataInputsAPIs().pathJoin(relativePath, item.modelName, item.outputAddress, item.outputChildAddress)
          const isEx = useAssumptionTableAPIs().isExists(folderPath) // change to fit array
          item.isEx = isEx
        } else {
          const folderPath = useDataInputsAPIs().pathJoin(relativePath, item.modelName, item.outputAddress)
          const isEx = useAssumptionTableAPIs().isExists(folderPath) // change to fit array
          item.isEx = isEx
        }
      })
      return this.taskMonits
    }
  },
  mounted() {
    if (userAPIs().login) {
      this.isBS = true
    }
  },
  methods: {
    ...mapActions(['deleteTaskMonitsToDB', 'stopTask']),
    handleClick(index, row) {
    },
    handleSelectionChange(val) {
      const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
    },
    async handleOpenDir(val) {
      const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
      const newPath = useDataInputsAPIs().pathJoin(relativePath, val.modelName, val.outputAddress, val.outputChildAddress, '/')
      const openResult = useTasksAPIs().openTaskListDir(newPath)
    },
    handleDblclickChangeRow(val) {
      if (!val.isEx) {
        this.$message({ message: '输出文件不存在', type: 'error' })
      } else {
        const relativePath = this.$store.getters.getCurrentWorkspaceDirPath

        if (val.outputChildAddress) {
          this.FolderPath.path = useDataInputsAPIs().pathJoin(relativePath, val.modelName, val.outputAddress, val.outputChildAddress)
        } else {
          this.FolderPath.path = useDataInputsAPIs().pathJoin(relativePath, val.modelName, val.outputAddress)
        }

        this.FolderPath.id = val.id
        this.FolderPath.name = val.outputAddress
        this.FolderPath.count += 1
        this.$emit('handelCurrentTask', this.FolderPath)
      }
    },
    handleDeleteClick(id) {
      this.$confirm('是否确认删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteTaskMonitsToDB([id])
        this.$message({ message: '删除成功', type: 'success' })
      }).catch(() => {
        this.$message({ message: '取消删除', type: 'warning' })
      })
    },
    handleDeleteAllClick() {
      this.$confirm('是否确认删除', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.multipleSelection = []
        this.taskMonits.map(item => {
          this.multipleSelection.push(item.id)
        })
        this.deleteTaskMonitsToDB(this.multipleSelection)
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          message: '已取消',
          type: 'warning'
        })
      })
    },
    handleStopClick(id) {
      this.$confirm('是否确认停止任务', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.multipleSelection = []
        this.taskMonits.map(item => {
          this.multipleSelection.push(item.id)
        })
        this.stopTask(id)
        this.$message({
          message: '停止成功',
          type: 'success'
        })
      }).catch(() => {
        this.$message({
          message: '停止取消',
          type: 'warning'
        })
      })
    },
    async handleDownloadClick(val) {
      if (!val.isEx) {
        this.$message({ message: '输出文件不存在', type: 'error' })
      } else {
        const relativePath = this.$store.getters.getCurrentWorkspaceDirPath
        let downloadPath
        if (val.outputChildAddress) {
          downloadPath = useDataInputsAPIs().pathJoin(relativePath, val.modelName, val.outputAddress, val.outputChildAddress)
        } else {
          downloadPath = useDataInputsAPIs().pathJoin(relativePath, val.modelName, val.outputAddress)
        }

        useDataInputsAPIs().downloadFile(downloadPath).then((res) => {
          if (res != null) {
            const link = document.createElement('a')
            link.href = res
            link.click()
          }
        })
      }
    }
  }

})
</script>

<style lang='scss' >
.task-table-box {
  padding: 20px 10px;
  border-right: 1px solid var(--nova-border-color);
  height: calc(100% - 40px);
  .table-btn-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
  }

  .el-table__body-wrapper::-webkit-scrollbar {
    // width: 6px; // 横向滚动条
    // height: 6px; // 纵向滚动条 必写
  }
  .el-table__body-wrapper::-webkit-scrollbar-thumb {
    // background-color: #ddd;
    // border-radius: 3px;
  }
}
</style>
