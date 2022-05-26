<template>
  <div class="output-transfer">
    <el-transfer
      v-model="outputValue"
      style="text-align: left; display: inline-block"
      filterable
      :left-default-checked="[]"
      :right-default-checked="[1]"
      :titles="['Program Variables', 'Output Variables']"
      :format="{
        noChecked: '${total}',
        hasChecked: '${checked}/${total}',
      }"
      :data="programData"
      @change="handleChange"
    >
      <template #default="{ option }">
      <div class="transItem">

              <el-tooltip
        class="box-item"
        effect="dark"
        :content="option.label"
        placement="bottom"
        v-if="option.label.length>15"
      >
          <span > {{ option.label.slice(0,15)  }}...</span>

      </el-tooltip>
       <span v-else> {{ option.label }}</span>
        <span > {{ option.Soucretype}}</span>
      </div>

      </template>
    </el-transfer>
  </div>
</template>

<script lang="ts">
import { defineComponent, VNodeProps, VNode } from 'vue'
import { clone } from '@shared/functional'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapMutations, mapActions } = createNamespacedHelpers('project/')

export default defineComponent({
  props: {
    selectData: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      programData: [
        // { key: 1, label: '标题1', disabled: false },
        // { key: 2, label: '标题2', disabled: false },
        // { key: 3, label: '标题3', disabled: false },
        // { key: 4, label: '标题4', disabled: false },
        // { key: 5, label: '标题5', disabled: false },
        // { key: 6, label: '标题6', disabled: false },
        // { key: 7, label: '标题7', disabled: false },
        // { key: 8, label: '标题8', disabled: false },
        // { key: 9, label: '标题9', disabled: false },
        // { key: 10, label: '标题10', disabled: false },
        // { key: 11, label: '标题11', disabled: false },
        // { key: 12, label: '标题12', disabled: false }

      ],
      outputValue: []
    }
  },
  computed: {
    ...mapState(['dataSurceOutputVariables', 'dataSurceVariables', 'projects', 'currProject'])
  },
  mounted() {
  },
  watch: {
    selectData: {
      handler(newValue) {
        if (!newValue) return
        this.formatProgramData(newValue.parentId)
      },
      deep: true,
      immediate: true
    },
    dataSurceOutputVariables: {
      handler(newValue) {
        if (!newValue) return
        if (this.selectData) {
          this.formatProgramData(this.selectData?.parentId)
        }
      },
      deep: true,
      immediate: true
    }
  },

  methods: {
    ...mapActions(['updateCleanProjectOutput']),
    initData() {
      this.outputValue = []
      if (this.selectData.value === '' || this.selectData.value === undefined) return
      const selectArr = this.selectData?.value.split(',')
      this.programData.map(item => {
        selectArr.map(select => {
          if (item.label === select) {
            this.outputValue.push(item.key)
          }
        })
      })
    },
    async formatProgramData(id) {
      this.programData = [] as any []

      const codingArr = this.projects.filter(filte => { return filte.id === id })[0].children[1].value.split('\r\n')
      let startVariablesString = '/*CODE_SEGMENT Define_Variables*/'
      let endVariablesString = '/*END_CODE_SEGMENT Define_Variables*/'
      let variablesStartIndex = 0
      let variablesEndIndex = 0
      codingArr.map((item, index) => {
        if (item.trim() === startVariablesString) variablesStartIndex = index + 1
        if (item.trim() === endVariablesString) variablesEndIndex = index
      })
      let key = 0
      // console.log(this.dataSurceVariables)
      // console.log(this.dataSurceOutputVariables, 'dataSurceOutputVariables')
      const newCodingArr = codingArr.slice(variablesStartIndex, variablesEndIndex)
      await this.dataSurceOutputVariables.map(item => {
        this.programData.push({ key: key, label: item, disabled: false, Soucretype: '数据源变量' })
        key++
      })
      await newCodingArr.map(item => {
        let name = ''
        if (item.indexOf('let') !== -1) {
          name = item.replace('let', '').split('=')[0].trim()
        } else if (item.indexOf('const') !== -1) {
          name = item.replace('const', '').split('=')[0].trim()
        }
        this.programData.push({ key: key, label: name, disabled: false, Soucretype: '自定义变量' })
        key++
      })
      this.initData()
    },
    handleChange(value: number | string,
      direction: 'left' | 'right',
      movedKeys: string[] | number[]
    ) {
      let resultOutputArr = []
      this.programData.map(item => {
        value.map(select => {
          if (item.key === select) {
            resultOutputArr.push(item.label)
          }
        })
      })
      const newData = clone(this.selectData)
      newData.value = resultOutputArr.sort().join(',')
      this.updateCleanProjectOutput(newData)
    },
    addOutputs() { }
  }
})
</script>

<style lang="scss" scoped>
.output-transfer {
  width: 80%;
  margin-left: 10%;
  height: 100%;
  .transItem{
    display: flex;
    justify-content: space-between;
    .box-item{
      width: 150px;
    }
    &:deep(.el-tooltip__trigger){
       width: 150px;
    }
  }
  &:deep(.el-transfer) {
    width: 100%;
    height: 100%;
    display: flex;
    .el-transfer-panel {
      width: calc(50% - 81px);
      height: 100%;
      .el-transfer-panel__body {
        height: calc(100% - 42px);
      }
      .el-transfer-panel__header {
        background: #81d3f8;
      }
    }
  }
}
</style>
