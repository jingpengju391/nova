<template>
  <split-panel
    class="data-input"
    split-direction="horizontal"
    :main-pane-default-ratio="0.4"
    :mainPaneMinimumRatio="0.3"
  >
    <template #main>
      <el-form class="pane-content" :model="currentRunner">
        <el-divider content-position="left" v-if="inputOptions.length"
          >选择模型数据</el-divider
        >
        <el-form-item
          :label-width="150"
          class="form-item"
          :label="moduleName"
          prop="inputId"
        >
          <!-- <template #label="label">
            <el-tooltip
              class="item"
              effect="dark"
              :content="label.label"
              placement="top-end"
            >
              <span class="form-item-label"> {{ label.label }}</span>
            </el-tooltip>
          </template> -->
          <el-select
            v-model="currentRunner.inputId"
            @change="
              setDataPreview(currentRunner.modelId, currentRunner.inputId, 1)
            "
          >
            <el-option
              v-for="option in inputOptions"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <el-button
            disabled
            type="primary"
            style="margin: 0 20px"
            @click="
              handleComponent('ImportDataPreview', currentRunner.modelId, 1)
            "
            >展示数据</el-button
          >
        </el-form-item>

        <el-divider content-position="left" v-if="blockOptions.length"
          >选择模块数据</el-divider
        >
        <el-form-item
          class="form-item"
          :label-width="150"
          v-for="(block, index) in blockOptions"
          :key="block.value"
          :label="block.label"
        >
          <template #label="label">
            <el-tooltip
              class="item"
              effect="dark"
              :content="label.label"
              placement="top-end"
            >
              <span class="form-item-label">{{ label.label }}</span>
            </el-tooltip>
          </template>
          <el-select
            v-model="currentRunner.blockInputId[index]"
            @change="
              setDataPreview(block.value, currentRunner.blockInputId[index], 2)
            "
          >
            <el-option
              v-for="option in block.children"
              :key="option.value"
              :value="option.value"
              :label="option.label"
            />
          </el-select>
          <el-button
            type="primary"
            :disabled="!currentRunner.blockInputId[index]"
            style="margin: 0 20px"
            @click="handleComponent('ImportDataPreview', block.value, 2)"
            >展示数据</el-button
          >
        </el-form-item>
      </el-form>
    </template>
    <template #side>
      <div style="border-left: 1px solid #d0d0d0; height: 100%">
        <component
          :is="isComponentId"
          :currentRunner="currentRunner"
        ></component>
      </div>
    </template>
  </split-panel>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SplitPanel from '@/views/components/SplitPanel.vue'
import { createNamespacedHelpers } from 'vuex'
import dataInputsDataSource from '@/store/modules/dataInputsDataSource'
import modelsDataSource from '@/store/modules/modelsDataSource'
import DataPreview from './DataPreview.vue'
import ImportDataPreview from '@/views/DataInputView/index.vue'
import type { SimpleModelNavigationNode } from '@shared/dataModelTypes/models/models'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { setDataPreview } from './data-preview'
import { getModelNavigationNodeIdAndType } from '@/utils'
const { mapState } = createNamespacedHelpers('runs/')

const { mapState: dataMapState, mapGetters: dataMapGetters, mapMutations: dataMapMutations } = createNamespacedHelpers('dataInputs/')
export default defineComponent({
  components: { SplitPanel, DataPreview, ImportDataPreview },
  setup() { return { setDataPreview } },
  data() {
    return {
      isComponentId: 'DataPreview' as string,
      inputOptions: [] as any,
      temporaryBlockFileId: [],
      currentRunnerRules: {
        inputId: [
          { required: true, message: '请选择活动区域', trigger: 'change' }
        ]
      }
    }
  },
  onMounted() {
    this.initData()
    setDataPreview(this.currentRunner.modelId, this.currentRunner.inputId, 1)
  },
  computed: {
    ...mapState(['currentRunner']),
    ...dataMapState(['files', 'currentDataModelNode']),
    ...dataMapGetters(['dataNaviTree', 'dataMappingItems']),
    selectedInput() {
      if (!this.currentRunner.inputId) return null
      const dataFile = dataInputsDataSource.getCurrentFile(this.currentRunner.modelId).filter(f => f.id === this.currentRunner.inputId)
      if (dataFile) {
        return dataFile[0]
      }
      return null
    },
    blockOptions() {
      const currBlockNavtions = this.dataNaviTree.filter((tree: SimpleModelNavigationNode) => {
        const { id, type } = getModelNavigationNodeIdAndType(tree.id)
        return id === this.currentRunner.modelId
      })[0].children
      return currBlockNavtions.map((block: SimpleModelNavigationNode) => {
        const { id, type } = getModelNavigationNodeIdAndType(block.id)
        return {
          value: id,
          label: block.name,
          children: (() => {
            if (dataInputsDataSource.getCurrentBlockFile(id)) {
              return dataInputsDataSource.getCurrentBlockFile(id).map(t => {
                return { value: t.id, label: t.name }
              })
            }
          })()
        }
      })
    },
    moduleName() {
      if (!this.currentRunner.modelId) return
      return modelsDataSource.getSimplifiedModelForView(this.currentRunner.modelId).name
    },
    modelId() {
      setDataPreview(this.currentRunner.modelId, this.currentRunner.inputId, 1)
      return this.currentRunner.modelId
    }
  },
  methods: {
    ...dataMapMutations(['switchModel']),
    handleComponent(componentId: string, id: number, identification: number) {
      this.isComponentId = componentId
    },
    initData() {
      this.inputOptions = []
      const LE = dataInputsDataSource.getCurrentFile(this.currentRunner.modelId)

      if (!this.currentRunner.modelId || !LE) {
        this.inputOptions.push({
          value: -1, label: '无数据'
        })
        return
      }

      this.inputOptions = dataInputsDataSource.getCurrentFile(this.currentRunner.modelId).map(t => {
        return { value: t.id, label: t.name }
      })
      this.inputOptions.push({
        value: -1, label: '无数据'
      })
      // if (!this.dataMappingItems.length) {
      //   this.inputOptions.push({
      //     value: -1, label: '无数据'
      //   })
      // }
    }
  },
  watch: {
    files: {
      handler() {
        this.initData()
      },
      deep: true, // 必须加这个属性
      immediate: true
    },
    modelId: {
      handler() {
        this.initData()
      },
      deep: true,
      immediate: true
    }
  }
})

</script>

<style lang="scss" scoped>
@import "../global.scss";
.data-input {
  width: calc(100% - 180px);
  .el-form-item__label:before {
    content: "";
  }
  .form-item-label {
    display: inline-block;
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    i {
      margin-right: 4px;
      color: red;
    }
  }
  &:deep(.el-form-item__label) {
    height: 32px;
  }
}
</style>
