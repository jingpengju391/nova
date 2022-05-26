<template>
  <div class="projection-top-btn-box">
    <span>任务详情</span>
    <el-button @click="cancelHandler" size="small">取消</el-button>
    <el-button type="primary" size="small" @click="saveProjectionToDB"
      >保存</el-button
    >
  </div>
  <div id="header">
    <span>任务属性</span>
  </div>
  <el-form
    id="projection-basice-settings"
    ref="basicSettingsForm"
    :rules="basicSettingsRules"
    :model="currentProjection"
    label-width="100px"
  >
    <el-form-item label="名称" prop="name">
      <el-input
        v-focus
        v-model="currentProjection.name"
        placeholder="请输入名称"
        maxlength="inputNameLength"
      />
    </el-form-item>
    <!-- <el-form-item label="评估时点" prop="evaluationTimePoint">
          <el-date-picker
            v-model="currentProjection.evaluationTimePoint"
            type="date"
            placeholder="Pick a day"
          >
          </el-date-picker>
        </el-form-item> -->

    <!-- <el-form-item label="运行方式">
          <el-select
            placeholder="请选择运行方式"
            v-model="currentProjection.mode"
            @change="onProjectionModeChange"
          >
            <el-option
              v-for="option in ProjectionModes"
              :key="option.label"
              :label="option.name"
              :value="option.label"
            />
          </el-select>
        </el-form-item> -->
    <el-form-item label="分文件夹输出">
      <span class="switch">关</span>
      <el-switch v-model="currentProjection.subFolderOutput" />
      <span class="switch">开</span>
    </el-form-item>

    <el-form-item label="输出文件夹">
      <el-input type="text" v-model="currentProjection.outputFolder" />
    </el-form-item>
    <el-form-item label="输出精度">
      <el-input-number v-model="currentProjection.outputPrecision" :min="0" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input
        type="textarea"
        :rows="3"
        v-model="currentProjection.description"
        maxlength="inputTextLength"
      />
    </el-form-item>
    <!-- <el-form-item
          label="运行设置"
          v-for="(_, index) in currentProjection.runnerSelections"
          :key="index"
        >
          <single-select
            v-if="currentProjection.mode === 'series'"
            v-model="currentProjection.runnerSelections[index]"
            @change="onSelectChange"
          >
            <el-option
              v-for="option in runnerSelectionOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </single-select>
          <el-select
            v-else
            placeholder="请选择（多选）"
            multiple
            :multiple-limit="10"
            v-model="currentProjection.runnerSelections[index]"
            @change="onSelectChange"
          >
            <el-option
              v-for="option in runnerSelectionOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="" v-if="currentProjection.mode !== 'parallel'">
          <el-button
            v-if="currentProjection.runnerSelections.length > 0"
            plain
            type="danger"
            @click="deleteRunnerSelection"
            >删除运行设置</el-button
          >
          <el-button plain type="primary" @click="addRunnerSelection"
            >添加运行设置</el-button
          >
        </el-form-item> -->
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ProjectionMode } from '@shared/dataModelTypes/runs/projections'
// import SingleSelect from '@/views/components/SingleSelect.vue'
import { ElForm, ElMessage } from 'element-plus'
import SplitPanel from '@/views/components/SplitPanel.vue'
import Console from '@/views/components/Console.vue'
import { createNamespacedHelpers } from 'vuex'
import RunUtilityViews from '../RunUtilityViews/index.vue'
import { clone, omit, equals } from '@shared/functional'
import { inputNameLength, inputTextLength } from '@shared/commonUtils'
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('runs/')
const { mapState: mapTasksState, mapMutation: mapTasksMutation } = createNamespacedHelpers('tasks/')

export default defineComponent({
  // components: { SplitPanel, RunUtilityViews },
  watch: {
    currentProjection: {
      handler(newValue, oldValue) {
        const content = this as any
        if (!newValue) {
          content.oldCurrentProjection = undefined
          return
        }
        content.newCurrentProjection = omit(['runQueueSelections', 'runnerSelections'], newValue)
        if (content.oldCurrentProjection && content.newCurrentProjection.id === content.oldCurrentProjection.id) {
          const flag = equals(content.newCurrentProjection, content.oldCurrentProjection)
          if (!flag) {
            this.changeIsProjectionSaveStatus(false)
          }
        }

        content.oldCurrentProjection = clone(content.newCurrentProjection)
        // const basicSettingsForm = this.$refs.basicSettingsForm as InstanceType<typeof ElForm>
        // basicSettingsForm?.validate(valid => {
        //   valid && this.saveUpdatedCurrentProjectionToDB(newValue)
        // })
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapState(['currentProjection', 'projections', 'runners']),
    ...mapTasksState(['hideConsole']),
    ProjectionModes() {
      return Object.values(ProjectionMode).map((type: ProjectionMode) => {
        if (type === ProjectionMode.series) {
          return { label: ProjectionMode.series, name: '顺序运行' }
        } else if (type === ProjectionMode.parallel) {
          return { label: ProjectionMode.parallel, name: '并行运行' }
        } else {
          return { label: ProjectionMode.mixed, name: '组合运行' }
        }
      })
    },
    runnerSelectionOptions() {
      return this.runners.map(r => ({ label: r.name, value: r.id }))
    },
    basicSettingsRules() {
      return {
        name: [
          { required: true, message: '名称不允许为空', trigger: 'blur' },
          { validator: this.duplicatedNameValidator, trigger: 'blur' },
          { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
          { pattern: /^[A-z]/, message: '首字母只允许是字母' }
        ],
        evaluationTimePoint: [
          { required: true, message: '名称不允许为空', trigger: 'blur' },
          { validator: this.duplicatedevaluationTimePointValidator, trigger: 'blur' }
        ]
      }
    },
    duplicatedNameValidator() {
      return (rule: any, newName: string, callback: any) => {
        try {
          this.projections.forEach(p => {
            if (p.id !== this.currentProjection.id && p.name === newName) {
              throw new Error('与其他任务重名')
            }
          })
          callback()
        } catch (err) {
          callback(err)
        }
      }
    },
    duplicatedevaluationTimePointValidator() {
      return (rule: any, evaluationTimePoint: string, callback: any) => {
        try {
          if (evaluationTimePoint === 'NaNNaNNaN') {
            throw new Error('评估时点不可为空！！！')
          }
          callback()
        } catch (err) {
          callback(err)
        }
      }
    }
  },
  methods: {
    ...mapActions(['saveUpdatedCurrentProjectionToDB', 'saveUpdatedCurrentQueueToDB', 'queryCurrentProjection', 'queryProjectionQueuesFromDB']),
    ...mapMutations(['changeIsProjectionSaveStatus']),
    onSelectChange(value) {
    },
    onProjectionModeChange(value) {
      this.currentProjection.runnerSelections = [[]]
      this.queryProjectionQueuesFromDB()
    },
    addRunnerSelection() {
      this.currentProjection.runnerSelections.push([])
    },
    deleteRunnerSelection() {
      this.currentProjection.runnerSelections.pop()
    },
    async saveProjectionToDB() {
      const basicSettingsForm = this.$refs.basicSettingsForm as InstanceType<typeof ElForm>
      basicSettingsForm?.validate(async (valid) => {
        if (valid) {
          await this.saveUpdatedCurrentProjectionToDB(this.currentProjection)
          ElMessage.success('保存成功')
        }
        //  this.queryProjectionQueuesFromDB()
      })
    },
    cancelHandler() {
      if (this.currentProjection.id === 0 || this.currentProjection.id === undefined) return

      this.queryCurrentProjection(this.currentProjection.id)
      this.queryProjectionQueuesFromDB()
    }

  }
})
</script>

<style lang="scss" scoped>
#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 4px 10px;
  background-color: transparent;
  flex: 0 0 1;
  span {
    font-size: 110%;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}
#projection-basice-settings {
  padding: 40px 20px 20px 0;
  height: 100%;
  width: 100%;
  border-right: 1px solid var(--nova-border-color);
  overflow-y: scroll;
  &:deep(.el-form-item__content) {
    span.switch {
      padding: 0 10px;
    }
  }
}
.projection-top-btn-box {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  // height: 40px;
  // line-height: 40px;
  padding: 10px 0;
  span {
    margin-left: 20px;
    font-size: 14px;
  }
  button {
    margin-left: 10px;
  }
}
</style>
