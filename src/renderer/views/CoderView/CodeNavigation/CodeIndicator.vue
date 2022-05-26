<template>
  <div class="editor" ref="editorHTML"></div>
</template>
<script setup lang=ts name="condeIndexEditor">
import * as monaco from 'monaco-editor'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useStore } from 'vuex'
// /vs/editor/editor.worker?worker
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
import eventBus, { SaveCurrentFormulaChannel } from '../eventBus'
import { getDiffForJson } from '@/utils'
import type { Property, FormulaTabItem } from '@shared/dataModelTypes'
import { currrentCodeIndexExpression, currentRowKey } from '../config'
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === 'css' || label === 'scss' || label === 'less') {
      // eslint-disable-next-line new-cap
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      // eslint-disable-next-line new-cap
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      // eslint-disable-next-line new-cap
      return new tsWorker()
    }
    // eslint-disable-next-line new-cap
    return new editorWorker()
  }
}

const props = defineProps<{ content: string, index: number }>()
const store = useStore()
const editorHTML = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneDiffEditor | any = null
let monacoProviderRef: any = null
let oldProperty: Property
const openedFormulaItems = computed<FormulaTabItem[]>(() => store.state.models.openedFormulaItems)
const currentFormulaItem = computed<FormulaTabItem>(() => store.state.models.currentFormulaItem)
const currentModelNode = computed(() => store.state.models.currentModelNode)
const currentProperty = computed<Property>(() => store.state.models.currentProperty)
const codeIndexes = computed(() => store.state.codeIndex.codeIndexes)

onMounted(() => createEditor())
onUnmounted(() => {
  editor.dispose()
  monacoProviderRef.dispose()
  eventBus.off(SaveCurrentFormulaChannel, saveNewFormula)
})
watch(() => props.content, newValue => diffNewPropertyAndOldProperty(newValue))
async function createEditor() {
  editor = monaco.editor.create(editorHTML.value as HTMLElement, {
    value: props.content,
    language: 'javascript',
    minimap: { enabled: false },
    automaticLayout: true,
    renderLineHighlight: 'none',
    wordWrap: 'on',
    wrappingIndent: 'same',
    folding: true,
    scrollBeyondLastLine: true,
    overviewRulerLanes: 0,
    overviewRulerBorder: false,
    fixedOverflowWidgets: true
  })

  editor.addAction({
    id: 'nova-formula-save-shortcut',
    label: 'Save',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
    precondition: null || undefined,
    keybindingContext: null || undefined,
    run: () => saveNewFormula()
  })
  editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
    const newVal: string = editor.getModel()?.getValue() || ''
    currrentCodeIndexExpression.newValue = newVal
    currrentCodeIndexExpression.index = props.index
    // diffNewPropertyAndOldPropertyFormula(newVal)
  })
  const modelId = currentModelNode.value.modelId || currentModelNode.value.id
  await store.dispatch('codeIndex/queryCodeIndexesByModelIdFromDB', modelId)
  const suggestions: monaco.editor.IQuickSuggestionsOptions | any = getSuggestions()
  onRegisterCompletion(suggestions)
  oldProperty = store.state.models.currentProperty
}

function saveNewFormula() {
  const newFormula = editor.getValue()
  // delete currentProperty.value.productFormulas[props.index]?.unsaved
  currentProperty.value.productFormulas[props.index].codeIndexExpression = newFormula
  // diffNewPropertyAndOldPropertyFormula(newFormula)
}

function getSuggestions() {
  const deepCodeIndexes = JSON.parse(JSON.stringify(codeIndexes.value))
  return deepCodeIndexes.map((item: CodeIndex) => {
    return {
      label: item.name,
      kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText: item.name,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: `${item.name}-CodeIndex`
    }
  })
}

function onRegisterCompletion(suggestions: monaco.editor.IQuickSuggestionsOptions) {
  monacoProviderRef = monaco.languages.registerCompletionItemProvider('javascript', {
    // @ts-ignore
    provideCompletionItems: () => {
      return {
        suggestions: suggestions
      }
    }
  })
}

function diffNewPropertyAndOldProperty(newValue: string) {
  const newProperty = store.state.models.currentProperty
  newProperty.id !== oldProperty.id && editor.setValue(newValue)
  oldProperty = store.state.models.currentProperty
}

function diffNewPropertyAndOldPropertyFormula(newVal: string) {
  const property = JSON.parse(JSON.stringify(currentProperty.value))
  if (currentFormulaItem.value.productFormulas) currentFormulaItem.value.productFormulas[props.index].codeIndexExpression = newVal
  openedFormulaItems.value.forEach((formulaItem: FormulaTabItem) => {
    if (formulaItem.propertyId === currentFormulaItem.value.propertyId && formulaItem.productFormulas) {
      formulaItem.productFormulas[props.index].codeIndexExpression = newVal
    }
    if (formulaItem.propertyId === property.id && formulaItem.productFormulas) {
      const diff: any = getDiffForJson(property.productFormulas, formulaItem.productFormulas, ['codeIndexExpression'], [])
      if (diff.length > 0) {
        const index = diff[0][0].split(' ')[0]
        formulaItem.productFormulas[index].unsaved = diff.length > 0
      }
    }
  })
}
</script>
<style lang="scss" scoped>
.editor {
  text-align: start;
  width: 100%;
  min-height: 250px;
}
.monaco-editor .suggest-widget {
  width: 200px;
}
</style>
