<template>
  <splitpanes class="editor-box" horizontal>
    <pane
      class="editor-choose"
      v-for="pane in paneConfig"
      :key="pane.id"
      :min-size="pane.minSize"
      :id="pane.id"
    >
      <h3>{{pane.title}}</h3>
      <component :is="pane.componentId" :formulaItem="currentFormulaItem" :objKey="pane.objKey"></component>
    </pane>
  </splitpanes>
</template>
<script setup lang=ts name="CodeIndexEditor">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import CodeEditor from './CodeIndexEditor.vue'
import { keyContent } from '@shared/dataModelTypes/product/indicators'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import type { FormulaTabItem } from '@shared/dataModelTypes'
const store = useStore()
const currentFormulaItem = computed<FormulaTabItem>(() => store.state.models.currentFormulaItem)
const paneConfig = [
  {
    id: 1,
    minSize: '10',
    objKey: keyContent.chooseIf,
    componentId: CodeEditor,
    title: 'must be'
  },
  {
    id: 2,
    minSize: '10',
    objKey: keyContent.abandonIf,
    componentId: CodeEditor,
    title: 'must not be'
  }
]
</script>
<style lang="scss" scoped>
.editor-box{
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100% - 73px);
  border-bottom: 1px solid lightgray;
  .editor-choose,.editor-abandon{
    display: flex;
    flex-direction: column;
    width: 100%;
    h3{
      position: relative;
      margin: 0;
      padding-left: 20px;
      line-height: 44px;
      background: #fff;
    }
    h3:before{
      display: inline-block;
      content: '';
      width: 5px;
      height: 5px;
      background: #666;
      border-radius: 50%;
      position: absolute;
      left: 10px;
      top: 0;
      bottom: 0;
      margin: auto;
    }
  }
}
</style>
