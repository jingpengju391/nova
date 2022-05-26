<template>
  <div id="formula-preview">
    <div id="header">
      <el-select
        v-if="hasLinkExpress"
        :model-value="currentPropertyFP.data.blockId"
        @change="selectBlock"
      >
        <el-option
          v-for="option in blockSelectOptions"
          :key="option.value"
          :label="option.label"
          :value="option?.value"
        />
      </el-select>
    </div>
    <code-editor
      v-if="currentFormulaItem.hasCalcFormula"
      :formulaItem="currentFormulaItem"
      dependencyPreview
    />
    <div id="no-formula" v-if="!currentFormulaItem.hasCalcFormula">无公式</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CodeEditor from '@/views/components/CodeEditor.vue'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('models/')

export default defineComponent({
  components: { CodeEditor },
  inject: ['currentPropertyFP', 'updateCurrentPropertyFP'],
  data() {
    return {
      blockSelectedId: this.currentPropertyFP.data.blockId,
      currentFormulaItem1: { content: '' }
    }
  },
  computed: {
    ...mapState(['currentFormulaItem', 'currentProperty', 'currentModelNode']),
    hasLinkExpress(): boolean {
      return this.currentPropertyFP.data.linkExpression !== 'NA'
    },
    blockSelectOptions(): { label: string; value: string }[] {
      const maskId = modelsDataSource.getAncestorPathForAModelBlock(this.currentPropertyFP.data.blockId)[1]
      const mask = modelsDataSource.getCompleteModelBlock(maskId)
      const options = [{ label: mask.name, value: mask.id }]
      return options.concat(modelsDataSource.getDescendent(maskId).map(block => ({
        label: block.name,
        value: block.id
      })))
    }

  },
  watch: {

    currentPropertyFP: {
      handler(newVal) {
        const currentarr = this.currentModelNode[newVal.data.propertyType].filter(item => {
          return item.id === newVal.data.propertyId
        })
        const maskId = modelsDataSource.getAncestorPathForAModelBlock(this.currentPropertyFP.data.blockId)[1]
        const mask = modelsDataSource.getCompleteModelBlock(maskId)
        // console.log(mask[newVal.data.propertyType][newVal.data.propertyId].calcFormula)
        if (currentarr.length === 0) return
        const current = currentarr[0]
        //  console.log(current)
        // this.selectProperty({ ...current })
      },
      deep: true
    }

  },
  mounted() {
    this.currentFormulaItem1 = this.currentFormulaItem
  },
  methods: {
    ...mapActions(['selectProperty']),
    selectBlock(id: number) {
      this.updateCurrentPropertyFP({ ...this.currentPropertyFP.data, blockId: id })
    }
  }
})
</script>

<style lang="scss" scoped>
#formula-preview {
  height: 100%;
  padding: 10px 20px;
  overflow: scroll;
  border-bottom: 1px solid var(--nova-border-color);
  #header {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    margin-bottom: 10px;
    #title {
      flex: 0 0 70px;
    }
  }
  #no-formula {
    height: calc(100% - 42px);
    width: 100%;
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #c6c6c6;
    font-size: 20px;
  }
}
</style>
