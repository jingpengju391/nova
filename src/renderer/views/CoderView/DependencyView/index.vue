<template>
  <split-panel
    split-direction="vertical"
    style="height: 100%"
    :mainPaneDefaultRatio="0.34"
  >
    <template #main>
      <dependency-graph></dependency-graph>
    </template>
    <template #side>
      <split-panel
        split-direction="vertical"
        style="height: 100%"
        :mainPaneDefaultRatio="0.5"
      >
        <template #main>
          <formula-preview></formula-preview>
        </template>
        <template #side>
          <formula-result></formula-result>
        </template>
      </split-panel>
    </template>
  </split-panel>
</template>

<script lang="ts">
import { defineComponent, reactive, provide } from 'vue'
import SplitPanel from '@/views/components/SplitPanel.vue'
import DependencyGraph from './DependencyGraph.vue'
import FormulaPreview from './FormulaPreview.vue'
import FormulaResult from './FormulaResult.vue'
import PropertyFingerPrint from '@/formulaLanguageServer/PropertyFingerPrint'

export default defineComponent({
  components: { SplitPanel, DependencyGraph, FormulaPreview, FormulaResult },
  setup() {
    const currentPropertyFP = reactive({ data: null })
    provide('currentPropertyFP', currentPropertyFP)
    const updateCurrentPropertyFP = (data: PropertyFingerPrint) => {
      currentPropertyFP.data = data
    }
    provide('updateCurrentPropertyFP', updateCurrentPropertyFP)
  }
})
</script>
