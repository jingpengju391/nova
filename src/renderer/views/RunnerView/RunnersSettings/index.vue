<template>
  <div class="run-setting" style="padding: 30px 20px">
    <el-button
      id="add-button"
      type="primary"
      icon="document-add"
      @click="onCreatClick"
      >新增运行设置</el-button
    >
    <el-table
      :data="runnersTableData"
      :row-class-name="tableRowClassName"
      :header-cell-style="{ background: '#eef1f6', color: '#606266' }"
      @row-contextmenu="onRightClick"
      @row-dblclick="editRunner"
    >
      <el-table-column
        v-for="column in $options.tableColumns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :sortable="column.prop === 'name'"
      >
        <template #header>
          <!-- <p> -->
          <span v-if="!column.filter">{{ column.label }}</span>

          <table-column-header-search
            :column="column"
            v-else
            @handelFilter="handelFilterRunName"
          ></table-column-header-search>
        </template>

        <template #default="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="scope.row[column.prop]"
            placement="top"
          >
            <span
              style="
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
              >{{ scope.row[column.prop] }}</span
            >
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      custom-class="add-ruuner-setting-dialog"
      v-model="dialogVisible"
      width="80%"
      destroy-on-close
      append-to-body
    >
      <el-form
        ref="ass"
        id="runner-baisc-settings-form"
        :model="currentRunner"
        :rules="currentRunnerRules"
      >
        <el-form-item label="选择模型">
          <el-select v-model="currentRunner.modelId" placeholder="请选择模型">
            <el-option
              v-for="option in modelOptions()"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="运行名称" prop="name">
          <el-input v-model="currentRunner.name" />
        </el-form-item>
      </el-form>
      <div id="setting-view">
        <selectable-vertical-steps
          v-model="activeStep"
          style="width: 150px; margin-right: 30px; flex: 0; padding: 60px 20px"
          :stepOptions="$options.tableColumns.slice(2)"
        />
        <keep-alive>
          <component :is="activeComponent" style="flex: 1" />
        </keep-alive>
      </div>
      <template #title>
        <span id="dialog-title">
          <el-icon style="margin-right: 6px; font-size: 120%; color: #409eff"
            ><video-play
          /></el-icon>
          新增运行设置
        </span>
      </template>
      <template #footer>
        <span id="dialog-footer">
          <el-button size="small" style="margin-right: 8px" @click="closeDialog"
            >取 消</el-button
          >
          <el-button size="small" type="primary" @click="onConfirmClick"
            >确 认</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, unref, computed, Component } from 'vue'
import DataInputSelection from './DataInputSelection/index.vue'
import TargetSelection from './TargetSelection/index.vue'
import AssumptionSelection from './AssumptionSelection.vue'
import OutputSelection from './OutputSelection/index.vue'
import SelectableVerticalSteps from '@/views/components/SelectableVerticalSteps.vue'
import TableColumnHeaderSearch from '@/views/components/TableColumnHeaderSearch.vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import dataInputsDataSource from '@/store/modules/dataInputsDataSource'
import type { Runner } from '@shared/dataModelTypes/runs/runners'
import { createNamespacedHelpers } from 'vuex'
import { calcWarningForRunner } from '@/store/modules/tasksSource'
import { ElMessage, ClickOutside as vClickOutside, ELPopover } from 'element-plus'
import { asyncForEach, inputNameLength, inputTextLength } from '@shared/commonUtils'
import { clone } from '@shared/functional'

const { mapState, mapGetters, mapActions, mapMutations } = createNamespacedHelpers('runs/')
const { mapGetters: mapOutputsGetters } = createNamespacedHelpers('outputs/')
const { mapActions: mapAssumptionVarActions } = createNamespacedHelpers('assumptionVar/')
const popoverRef = ref()

export default defineComponent({
  tableColumns: [
    { label: '模型名称', prop: 'modelName', filter: false, filterType: 'txt' },
    { label: '设置名称', prop: 'name', filter: true, filterType: 'txt' },
    { label: '数据', prop: 'dataInput', status: 'wait', filter: false, filterType: 'txt' },
    { label: '目标', prop: 'targets', status: 'wait', filter: false, filterType: 'txt' },
    { label: '假设', prop: 'assumption', status: 'wait', filter: false, filterType: 'txt' },
    { label: '输出', prop: 'outputs', status: 'wait', filter: false, filterType: 'txt' }
  ],
  components: {
    DataInputSelection, TargetSelection, AssumptionSelection, OutputSelection, SelectableVerticalSteps, TableColumnHeaderSearch
  },
  data() {
    return {
      dialogVisible: false,
      activeStep: 0,
      assumption: {} as any,
      currentRunnerData: {} as Runner,
      currentRunnerRules: {
        name: [
          { required: true, message: '请输入运行名称', trigger: 'blur' },
          { validator: this.duplicatedPropertyNameValidator, trigger: 'blur' },
          { pattern: /^[a-zA-Z]\w{0,63}$/, message: '只允许以字母开头,包含下划线、字母或数字,长度1-' + inputNameLength + '位' },
          { validator: this.keywordsValidator }
        ]
      },
      runnersTableData: [] as any,
      visible: false,
      filterRunName: '',
      filterList: [],
      isEdit: false
    }
  },
  computed: {
    ...mapState(['runners', 'runSetingSelectTargets', 'runSetingSelectOutputs', 'targetNaviTree']),
    ...mapGetters(['targetIdMap', 'currentRunner']),
    ...mapOutputsGetters(['outputIdMap']),
    activeComponent(): Component {
      switch (this.activeStep) {
        case 0: return DataInputSelection
        case 1: return TargetSelection
        case 2: return AssumptionSelection
        default: return OutputSelection
      }
    }
    // runnersTableData() {
    //   console.log(this.runners)
    //   const sss = JSON.parse(JSON.stringify(this.runners))
    //   console.log(sss)
    //   return this.runners.map(r => {
    //     const dateFile = dataInputsDataSource.getCurrentFile(r.modelId)?.find(f => f.id === r.inputId)?.name ?? '空'
    //     console.log(dateFile, 'dateFile')
    //     let dateFiles = ''
    //     if (dateFile === undefined) {
    //       dateFiles = -1
    //     } else {
    //       dateFiles = dateFile
    //     }
    //     dateFiles = ''
    //     return {
    //       id: r.id,
    //       modelName: modelsDataSource.getModel(r.modelId).name,
    //       name: r.name,
    //       targets: (r.targets.map(targetId => { return this.targetIdMap.get(targetId)?.name ?? '空' })).join(','),
    //       dataInput: dateFiles,
    //       outputs: (r.outputs.map(outputId => { return this.outputIdMap?.get(outputId)?.name ?? '空' })).join(','),
    //       assumption: (() => this.assumption[r.id] ? this.assumption[r.id].join(' ') : '')(),
    //       warning: calcWarningForRunner(r)
    //     }
    //   })
    // }
  },
  watch: {
    runners: {
      async handler(newObj) {
        await this.handleAssumption(newObj)
        this.runnersTableData = this.getRunnersTableData()
      },
      deep: true,
      immediate: true
    },
    currentRunner: {
      async handler(newObj) {
        await this.handleAssumption(this.runners)
      },
      deep: true,
      immediate: true
    }

  },
  async mounted() {
    await this.handleAssumption(this.runners)
    this.runnersTableData = this.getRunnersTableData()
  },
  methods: {
    ...mapActions(['createNewRunner', 'saveCurrentRunner', 'selectCurrentRunner',
      'deleteRunner', 'duplicateRunner']),
    ...mapMutations(['setRunSetingSelectTargets', 'setRunSetingSelectOutputs']),
    ...mapAssumptionVarActions(['rollBackAssumptionVarPageName', 'rollBackAssumptionSectionFromDB']),
    tableRowClassName({ row }) {
      return row.warning !== 'success' ? 'warning-row' : ''
    },
    onClickOutside() {
      unref(popoverRef).popperRef?.delayHide?.()
    },
    getRunnersTableData() {
      let RunnersData = this.runners.map(r => {
        const dateFile = dataInputsDataSource.getCurrentFile(r.modelId)?.find(f => f.id === r.inputId)?.name ?? '空'
        let dateFiles = ''
        if (dateFile === undefined) {
          dateFiles = -1
        } else {
          dateFiles = dateFile
        }
        return {
          id: r.id,
          modelName: modelsDataSource.getModel(r.modelId).name,
          name: r.name,
          targets: (r.targets.map(targetId => { return this.targetIdMap.get(targetId)?.name ?? '空' })).join(','),
          dataInput: dateFiles,
          outputs: (r.outputs.map(outputId => { return this.outputIdMap?.get(outputId)?.name ?? '空' })).join(','),
          assumption: (() => this.assumption[r.id] ? this.assumption[r.id].join(' ') : '')(),
          warning: calcWarningForRunner(r)
        }
      })
      const returnRunnerData = []
      if (this.filterList.length) {
        RunnersData.map(item => {
          let flag = true
          for (let i = 0; i < this.filterList.length; i++) {
            if (this.filterList[i].filterType === 'txt' && this.filterList[i].value.value1 !== '') {
              if (item[this.filterList[i].prop].indexOf(this.filterList[i].value.value1) !== -1) {
                flag = true
              } else {
                flag = false
              }
            }
            if (flag === false) break
          }
          if (flag) returnRunnerData.push(item)
        })
      } else {
        returnRunnerData.push(...RunnersData)
      }
      return returnRunnerData
    },
    isCppKeywords(value: string): boolean {
      const list = [
        'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const',
        'continue', 'default', 'delete', 'do', 'double', 'else', 'enum', 'false',
        'float', 'for', 'friend', 'goto', 'if', 'inline', 'int', 'long',
        'mutable', 'namespace', 'new', 'operator', 'private', 'protected', 'public',
        'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
        'template', 'this', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
        'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'while', 'name', 'profile', 'links', 'series', 'variables'
      ]
      return list.indexOf(value) !== -1
    },
    keywordsValidator(rule: any, runnerName: string, callback: any) {
      if (this.isCppKeywords(runnerName)) {
        callback(new Error('不允许包含C++关键字'))
      } else {
        callback()
      }
    },
    duplicatedPropertyNameValidator(rule: any, runnerName: string, callback: any) {
      const checkResult = this.checkNewPropertyName(runnerName)
      if (checkResult) {
        callback(new Error('名称重复，请换个名字'))
      }
      callback()
    },
    checkNewPropertyName(newName: string): number {
      const arr = this.runnersTableData.filter(item => item.name === newName && item.id !== this.currentRunner.id)
      return arr.length
    },
    modelOptions() {
      return modelsDataSource.getAllModels().map(model => {
        return { label: model.name, value: model.id }
      })
    },
    async handleAssumption(newObj: Runner[]) {
      await asyncForEach(newObj, async (r: Runner | any) => {
        const arr: string[] = []
        const key = Object.keys(r.assumption)
        await asyncForEach(key, async item => {
          const page = await this.rollBackAssumptionVarPageName(Number(item))
          if (page !== undefined) {
            const section = await this.rollBackAssumptionSectionFromDB(r.assumption[item])
            arr.push(`page: ${page?.name} / section: ${section?.label}`)
          } else {
            arr.length = 0
          }
        })
        this.assumption[r.id.toString()] = arr
      })
    },
    onCreatClick() {
      this.createNewRunner().then(() => {
        this.isEdit = false
        this.dialogVisible = true
      })
      this.setRunSetingSelectTargets([])
      this.setRunSetingSelectOutputs([])
    },
    async onConfirmClick() {
      this.$refs.ass.validate(async (flag) => {
        if (flag) {
          if (this.validateRunner()) {
            this.currentRunner.targets = this.runSetingSelectTargets
            this.currentRunner.outputs = this.runSetingSelectOutputs
            await this.saveCurrentRunner()
            await this.handleAssumption(this.runners)
            this.runnersTableData = this.getRunnersTableData()
            this.closeDialog()
          }
        }
      })
    },
    closeDialog() {
      this.dialogVisible = false
      this.activeStep = 0
    },
    validateRunner(): boolean {
      const key = Object.keys(this.assumption)
      if (!this.currentRunner) {
        return false
      }
      const curnamelist = this.runnersTableData.filter(item => {
        return (item.name === this.currentRunner.name && item.id !== this.currentRunner.id)
      })

      if (this.runSetingSelectTargets.length === 0) {
        ElMessage.error('请选择目标')
        return false
      } else if (curnamelist.length) {
        ElMessage.error('运行名称已存在')
        return false
      } else if (Object.keys(this.currentRunner?.assumption).length === 0) {
        ElMessage.error('请选择假设')
        return false
      } else if (this.runSetingSelectOutputs.length === 0) {
        ElMessage.error('请选择输出')
        return false
      }
      // else if (this.currentRunner?.inputId === null) {
      //   ElMessage.error('模型未选择数据！请确认模型不需要数据！')
      //   return false
      // }
      if (curnamelist.length) {
        ElMessage.error('运行名称已存在')
        return false
      }
      // this.currentRunner?.targets = this.runSetingSelectTargets
      return true
    },
    onRightClick(runner: Runner, column: any, event: MouseEvent) {
      this.$contextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        menuItems: [
          {
            title: '编辑',
            shortCut: '',
            onClick: event => this.editRunner(runner)
          },
          {
            title: '拷贝',
            shortCut: '',
            onClick: async (event) => {
              this.duplicateRunner(runner.id)
              await this.handleAssumption(this.runners)
              this.runnersTableData = this.getRunnersTableData()
            }
          },
          {
            title: '删除',
            shortCut: '',
            onClick: (event) => this.tryToDeleteRunner(runner)
          }
        ]
      })
    },
    editRunner(runner: Runner) {
      this.selectCurrentRunner(runner.id).then(() => {
        // this.currentRunnerData = resultArr
        this.isEdit = true
        this.dialogVisible = true
      })
      this.setRunSetingSelectTargets(this.currentRunner.targets)
      this.setRunSetingSelectOutputs(this.currentRunner.outputs)
    },
    tryToDeleteRunner(runner: Runner) {
      this.$alert(`确定要删除运行设置 ${runner.name}?`, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
        showCancelButton: true
      }).then(async () => {
        await this.deleteRunner(runner.id)
        await this.handleAssumption(this.runners)
        this.runnersTableData = this.getRunnersTableData()
      }).catch(() => { })
    },
    openOrCloseScreen() {
      this.visible = false
    },
    handelFilterRunName(filterOptions) {
      let flag = true
      this.filterList.forEach((item) => {
        if (item.prop === filterOptions.prop) {
          item.value = filterOptions.value
          flag = false
        }
      })
      if (flag) this.filterList.push(filterOptions)
      // this.filterRunName = val
      this.runnersTableData = this.getRunnersTableData()
    }
  }
})
</script>

<style lang="scss" scoped>
#add-button {
  margin-bottom: 20px;
}

#setting-view {
  display: flex;
  flex-flow: row nowrap;
  height: 60vh;
}

#dialog-footer {
  display: flex;
  justify-content: center;
}
.run-setting {
  overflow-y: auto;
  &:deep(.el-table th.el-table__cell > .cell) {
    display: flex;
    align-items: center;
    z-index: 9999;
    .down-screen {
    }
  }
}
.down-serch {
  padding: 10px 5px;
  &:deep(.el-input--prefix .el-input__inner) {
    font-size: 12px;
  }
}
</style>
<style lang="scss">
$borderRadius: 10px;

.add-ruuner-setting-dialog {
  border-radius: $borderRadius !important;
  #runner-baisc-settings-form {
    padding: 20px 30px;
    margin-bottom: 0 !important;
    border-bottom: 1px solid var(--nova-border-color);
  }
  .el-dialog__header {
    padding: 10px 20px !important;
    border-bottom: 1px solid var(--nova-border-color) !important;
    background: white;
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    font-size: 15px !important;
    border-top-left-radius: $borderRadius !important;
    border-top-right-radius: $borderRadius !important;

    .el-dialog__headerbtn {
      position: static !important;
    }
    #dialog-title {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
    }
  }

  .el-dialog__body {
    padding: 0;
    overflow-x: hidden;
  }
  .el-dialog__footer {
    border-top: 1px solid var(--nova-border-color);
    padding: 10px 0;
  }
}
</style>
<style>
.run-setting .el-table .warning-row {
  --el-table-tr-background-color: var(--el-color-warning-lighter);
}
</style>
