<template>
  <split-panel
    style="width: 100%; height: 100%"
    :mainPaneDefaultRatio="0.5"
    :mainPaneMinimumRatio="0.3"
    :sidePaneMinimumRatio="0.3"
  >
    <template #main>
      <el-form
        class="output-form-box"
        :class="currentRunner ? 'small-setting-form' : 'output-setting-form'"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="名称">
          <el-input
            v-if="currentOutput.id === 0"
            v-focus
            v-model="currentOutput.name"
            @change="onCurrentOutputChange"
          />
          <el-input
            v-else
            v-model="currentOutput.name"
            @change="onCurrentOutputChange"
          />
        </el-form-item>
        <el-form-item label="模型">
          <el-input disabled :model-value="modelName" />
        </el-form-item>
        <el-form-item label="目标链接">
          <link-chain-select
            class="link-chain-select"
            v-model="currentOutput.linkChain"
            :root-block-id="modelRootBlockId"
            @change="onCurrentOutputChange"
          />
        </el-form-item>
        <el-form-item label="变量/序列">
          <el-checkbox
            class="option-checkbox"
            label="全 选"
            :model-value="checkAll"
            :indeterminate="isIndeterminate"
            @change="handleSelect"
          />
          <el-input
            class="filter-input"
            prefix-icon="search"
            placeholder="输入关键字过滤"
            v-model="filterText"
          />
          <variables-and-series-select
            v-model="currentOutput.series"
            :select-options="filterTextData"
            @change="onCurrentOutputChange(false)"
          />
        </el-form-item>
      </el-form>
    </template>
    <template #side>
      <el-form
        :class="currentRunner ? 'small-setting-form' : 'output-setting-form'"
      >
        <el-form-item label="输出区间">
          <el-col :span="11">
            <el-input-number
              v-model="currentOutput.periodFrom"
              :min="-1400"
              :max="currentOutput.periodTo"
              @change="onCurrentOutputChange"
            />
          </el-col>
          <el-col :span="2" style="margin: 0 10px">-</el-col>
          <el-col :span="11">
            <el-input-number
              v-model="currentOutput.periodTo"
              :min="currentOutput.periodFrom"
              @change="onCurrentOutputChange"
            />
          </el-col>
        </el-form-item>
        <el-form-item label="输出数组模块”">
          <el-radio-group
            v-model="currentOutput.blockCopy"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="输出起点重置">
          <el-radio-group
            v-model="currentOutput.blockDepth"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="输出数组序列">
          <el-radio-group
            v-model="currentOutput.seriesCopy"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- <el-form-item label="Series Depth">
          <el-radio-group
            v-model="currentOutput.seriesDepth"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <!-- <el-form-item label='Separate Series Copy Page'>
          <el-radio-group v-model="currentOutput.separateSeriesCopyPage" @change="onCurrentOutputChange(false)">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="输出分组分文件输出">
          <el-radio-group
            v-model="currentOutput.fileSeparateByNode"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数组模块分文件输出">
          <el-radio-group
            v-model="currentOutput.fileSeparateByCopy"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="File Separate By Depth">
          <el-radio-group
            v-model="currentOutput.fileSeparateByDepth"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <el-form-item label="输出模块所有层级">
          <el-radio-group
            v-model="currentOutput.outputAllLevels"
            @change="onCurrentOutputChange(false)"
          >
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="输出模块最小层级">
          <el-input-number
            v-model="currentOutput.blockCopyMinLevel"
            :precision="0"
            :step="1"
            :min="0"
            :max="currentOutput.blockCopyMaxLevel"
            @change="onCurrentOutputChange"
          />
        </el-form-item>
        <el-form-item label="输出模块最大层级">
          <el-input-number
            v-model="currentOutput.blockCopyMaxLevel"
            :precision="0"
            :step="1"
            :min="currentOutput.blockCopyMinLevel"
            @change="onCurrentOutputChange"
          />
        </el-form-item>
      </el-form>
    </template>
  </split-panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SplitPanel from '@/views/components/SplitPanel.vue'
import VariablesAndSeriesSelect, { SelectOption } from '@/views/components/VariablesAndSeriesSelect.vue'
import LinkChainSelect from '@/views/components/LinkChainSelect.vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { validateNameLegality, validateEmptyName, validateDuplicatedName, validateLinkChain } from '@/utils'
import { Output } from '@shared/dataModelTypes/runs/outputs'
import { createNamespacedHelpers } from 'vuex'
import { VariableType } from '@shared/dataModelTypes/models/helpers'
import { Series, Variable } from '@shared/dataModelTypes'
const { mapState: mapModelState } = createNamespacedHelpers('models/')
const { mapState, mapActions, mapMutations } = createNamespacedHelpers('outputs/')
export default defineComponent({
  components: { SplitPanel, VariablesAndSeriesSelect, LinkChainSelect },
  props: {
    currentRunner: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      modelRootBlockId: 0,
      filterText: '',
      count: 0
    }
  },
  computed: {
    ...mapState(['currentOutput', 'outputs']),
    ...mapModelState(['currentModelNode']),
    modelName(): string {
      return modelsDataSource.getModel(this.currentOutput.modelId).name
    },
    currentRootBlocklId() {
      return this.currentModelNode?.rootBlockId ? this.currentModelNode?.rootBlockId : this.modelRootBlockId
    },
    checkAll() {
      return this.currentOutput.series.length > 0 &&
        this.currentOutput.series.length === this.filterTextData.length
    },
    isIndeterminate() {
      return this.currentOutput.series.length > 0 &&
        this.currentOutput.series.length < this.filterTextData.length
    },
    seriesOptions(): SelectOption[] {
      if (!this.currentOutput.linkChain || this.currentOutput.linkChain.length <= 0) return []
      // const targetLinkInfo = this.currentOutput.linkChain[this.currentOutput.linkChain.length - 1]
      // const targetMaskId = parseInt(targetLinkInfo.split('->')[1])
      // const targetMask = modelsDataSource.getSimplifiedModelBlockForView(targetMaskId)

      try {
        const targetMask = modelsDataSource.getTargetMaskForLinkChain(this.currentOutput.linkChain)
        const variablesOptions = targetMask.variables.filter((variable: Variable) => variable.valueType !== VariableType.table).map((item: Variable) => {
          return { id: item.id, name: item.name, type: item.type }
        })
        const seriesOptions = targetMask.series.map((item: any) => {
          return { id: item.id, name: item.name, type: item.type }
        })
        const seriesOptionsAll = seriesOptions.concat(variablesOptions)
        this.currentOutput.series.map((item: any, index: number) => {
          const findDeleteIndex = seriesOptionsAll.findIndex((find: any) => { return find.id === item.id })
          if (findDeleteIndex === -1) {
            this.currentOutput.series.splice(index, 1)
            this.saveUpdatedCurrentOutputToDB()
          } else if (item.name !== seriesOptionsAll[findDeleteIndex].name) {
            item.name = seriesOptionsAll[findDeleteIndex].name
            this.saveUpdatedCurrentOutputToDB()
          }
        })
        const dd = this.count
        return seriesOptionsAll
      } catch (e) {
        console.log(e, 'maybe linkChain Broken')
        return []
      }
    },
    filterTextData(): SelectOption[] {
      if (this.filterText.length) {
        const list = this.seriesOptions.filter(item => {
          return item.name.toLowerCase().includes(this.filterText.toLowerCase())
        })
        return list
      }
      return this.seriesOptions
    }
  },
  created() {
    if (!this.currentOutput) return
    const rootId = modelsDataSource.getModel(this.currentOutput.modelId).rootBlockId ?? 0
    this.modelRootBlockId = rootId

    // for (const i in this.currentOutput) {
    //   for (const k of this.currentOutput) {
    //     console.log(k)

    //     // if (k === 'fileSeparateByCopy' || k === 'fileSeparateByDepth' || k === 'fileSeparateByNode') {
    //     //   if (this.currentOutput[i] === 1) {
    //     //     this.currentOutput[i] = true
    //     //   }
    //     // }
    //   }
    // }
  },
  watch: {

    $route: {
      handler(newObj) {
        if (newObj.path === '/runner' && this.currentOutput) {
          this.count++
        }
      },
      deep: true,
      immediate: true
    },
    currentRootBlocklId(newVal) {
      const flag = newVal && this.currentModelNode?.id === this.currentOutput.modelId && newVal !== this.modelRootBlockId
      if (flag) {
        this.modelRootBlockId = modelsDataSource.getModel(this.currentOutput.modelId).rootBlockId ?? 0
      }
    },
    currentOutput(newVal: Output, oldVal: Output) {
      if (!newVal) return
      const flag = newVal.modelId !== oldVal.modelId
      if (flag) {
        this.modelRootBlockId = modelsDataSource.getModel(newVal.modelId).rootBlockId ?? 0
      }
      if (newVal !== oldVal) {
        this.filterText = ''
      }
    }
  },
  methods: {
    ...mapActions(['saveUpdatedCurrentOutputToDB', 'setOutputOptionsAsync']),
    ...mapMutations(['updateCurrentOutput']),
    onCurrentOutputChange(clearOptions?: boolean) {
      if (!validateEmptyName(this.currentOutput)) {
        this.$message.error('名称不能留空，请设置名称')
        return
      }

      if (!validateNameLegality(this.currentOutput)) {
        this.$message.error('名称只允许包含字母数字或下划线，且首字符必须是英文字母')
        return
      }

      if (!validateDuplicatedName(this.currentOutput, this.outputs)) {
        this.$message.error('名称不能与其他目标重名，请重新修改名称')
        return
      }
      const { result, errorMessage } = validateCurrentOutputSettings(this.currentOutput)
      if (!result && errorMessage) {
        this.$message.error(errorMessage)
        return
      }

      if (!validateLinkChain(this.currentOutput)) {
        this.$message.error('目标Link不能留空，请选择')
        return
      }
      if (clearOptions === true) {
        this.currentOutput.series.length = 0
      }
      this.saveUpdatedCurrentOutputToDB()
    },
    handleSelect() {
      const options = this.checkAll ? [] : this.filterTextData

      this.setOutputOptionsAsync(options).then(_ => {
        // this.saveUpdatedCurrentOutputToDB()
        this.onCurrentOutputChange(false)
      })
    }
  }
})

function validateCurrentOutputSettings(currentOutput: Output): { result: boolean, errorMessage?: string } {
  if (currentOutput.periodFrom > currentOutput.periodTo) {
    return { result: false, errorMessage: `序列${currentOutput.name}设置不合法，Period From的值应小于Period To的值` }
  } else if (Math.abs(currentOutput.periodFrom) > 1440 ||
    Math.abs(currentOutput.periodTo) > 1440) {
    return { result: false, errorMessage: `序列${currentOutput.name}设置不合法，Period From和Period To的绝对值都应小于1440` }
  }
  return { result: true }
}

</script>

<style lang="scss" scoped>
@use "sass:math";
$checkboxSize: 20px;
.filter-input {
  width: 80%;
}
.output-setting-form {
  height: 100%;
  padding: 20px 40px;
  overflow-y: scroll;
}

.small-setting-form {
  height: 100%;
  padding: 20px 15px;
  overflow-y: scroll;
}
.output-setting-form:nth-of-type(1) {
  border-right: 1px solid var(--nova-border-color);
}
.option-checkbox {
  flex: 0 0 auto;
  margin-left: 20px;
  width: calc(100% - 20px);
  flex-flow: row-reverse;
  &:deep(.el-checkbox__input) {
    padding-left: 8px;
  }
  &:deep(.el-checkbox__inner) {
    width: $checkboxSize;
    height: $checkboxSize;
    border-radius: math.div($checkboxSize, 2);
    border-color: #81858d;
  }
  &:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    border-color: #409eff;
    background-color: #409eff;
  }
  &:deep(.el-checkbox__inner:hover) {
    border-color: #409eff;
  }
  &:deep(.el-checkbox__inner::after) {
    width: math.div($checkboxSize, 4);
    height: math.div($checkboxSize, 2);
    top: 2px;
    left: 6px;
  }
}
</style>
