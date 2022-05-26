<template>
  <div class="editor" ref='editorHTML'></div>
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
import { ref, onMounted, onUnmounted, watch, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
// /vs/editor/editor.worker?worker
import type { FormulaTabItem } from '@shared/dataModelTypes'
import { keyContent, CodeIndex } from '@shared/dataModelTypes/product/indicators'
import eventBus, { SaveCurrentFormulaChannel, setCodeIndexEditorValue } from '../eventBus'
import CodeIndexFingerPrint, { generateCodeIndexFingerPrintString, deCodeIndexFingerPrintString } from '@/formulaLanguageServer/CodeIndexFingerPrint'
import defaultLanguageServer from '@/formulaLanguageServer'
import { ModelNodeType, getCodeIndexNavigationNodeIdAndType } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { completionProvider } from '../config'
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

const props = defineProps<{ formulaItem: FormulaTabItem, objKey:keyContent }>()
const store = useStore()
const editorHTML = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneDiffEditor | any = null
const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)
const codeIndexes = computed(() => store.state.codeIndex.codeIndexes)
const currMonacoModels = computed(() => store.getters['globalSearchReplace/gettersCurrMonacoModels'])
onMounted(() => createEditor())
onUnmounted(() => eventBus.off(SaveCurrentFormulaChannel, saveNewFormula))
watch(() => props.formulaItem.propertyId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    completionProvider.monacoProviderRef && completionProvider.monacoProviderRef.dispose()
    const suggestions:monaco.editor.IQuickSuggestionsOptions | any = getSuggestions()
    onRegisterCompletion(suggestions)
    editor && editor.setValue(props.formulaItem[props.objKey])
    currMonacoModels?.value?.range && editor && editor.setSelection(currMonacoModels.value.range)
    currMonacoModels?.value?.range && editor && editor.revealRangeInCenter(currMonacoModels.value.range, 1)
  }
}, { deep: true, immediate: true })

function createEditor() {
  editor = monaco.editor.create(editorHTML.value as HTMLElement, {
    value: props.formulaItem[props.objKey],
    language: 'javascript',
    minimap: { enabled: false },
    automaticLayout: true,
    renderLineHighlight: 'none',
    wordWrap: 'on',
    wrappingIndent: 'same',
    folding: true,
    scrollBeyondLastLine: true,
    overviewRulerLanes: 0,
    overviewRulerBorder: false
  })
  editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
    const newVal:string = editor.getModel()?.getValue() || ''
    updateOpenFormulaItems(true)
  })
  editor.addAction({
    id: 'nova-formula-save-shortcut',
    label: 'Save',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
    precondition: null || undefined,
    keybindingContext: null || undefined,
    run: () => saveNewFormula()
  })
  // Go to definition
  editor.addAction({
    id: 'nova-formula-go-to-definition',
    label: 'Go to definition',
    keybindings: [monaco.KeyCode.F12],
    precondition: null,
    keybindingContext: null,
    run: () => {
      const word = editor.getModel()?.getWordAtPosition(editor.getPosition())
      const modelId = props.formulaItem.modelId
      if (!modelId) return
      const formulaItem:any = props.formulaItem
      formulaItem.propertyName = formulaItem.name.split('.')[0]

      const currentCodeIndexFP = new CodeIndexFingerPrint(
        formulaItem.propertyId,
        formulaItem.propertyName,
        formulaItem.modelId
      )

      const currentPropertyFPString = generateCodeIndexFingerPrintString(currentCodeIndexFP)
      const referringDependencies = defaultLanguageServer.getReferringProperties(modelId, currentPropertyFPString)

      try {
        const codeIndexFP = referringDependencies.map(fpString => {
          return deCodeIndexFingerPrintString(fpString)
        }).find((fp:any) => {
          return fp.propertyName === word.word
        })
        if (!codeIndexFP) return
        currentPropertyFPString && onGoToDefinition(codeIndexFP)
        return null
      } catch (e) {
        return null
      }
    }
  })
  eventBus.on(SaveCurrentFormulaChannel, saveNewFormula)
  eventBus.on(setCodeIndexEditorValue, (codeIndex: CodeIndex) => editor.setValue(codeIndex[props.objKey]))
}

function onGoToDefinition(codeIndexFP:CodeIndexFingerPrint) {
  const { id, type } = getCodeIndexNavigationNodeIdAndType(codeIndexFP.codeIndexId)
  const codeIndex = store.state.codeIndex.codeIndexes.find((codeIndex:CodeIndex) => codeIndex.id === id)
  store.commit('models/updateCurrentModelNodeWithModelNaviNode', { id: ModelNodeType.models + NaviNodeIdDelimiter + codeIndexFP.modelId })
  store.commit('codeIndex/updateCurrentCodeIndex', codeIndex)
}

function saveNewFormula() {
  const newFormula = editor.getValue()
  const currentCodeIndex = store.state.codeIndex.currentCodeIndex
  store.dispatch('codeIndex/updateCodeIndexFromDB', {
    ...currentCodeIndex,
    [props.objKey]: newFormula
  }).then(_ => updateOpenFormulaItems(false))
}

function updateOpenFormulaItems(compare:boolean) {
  const newVal:string = editor.getModel()?.getValue() || ''
  const currentFormulaItem = store.state.models.currentFormulaItem
  const openedFormulaItems = store.state.models.openedFormulaItems
  const currentCodeIndex = store.state.codeIndex.currentCodeIndex
  openedFormulaItems.forEach((formula:FormulaTabItem) => {
    if (formula.name === currentFormulaItem.name) {
      if (compare) {
        formula[props.objKey] = newVal
        formula.unsaved = formula[keyContent.chooseIf] !== currentCodeIndex[keyContent.chooseIf] ||
        formula[keyContent.abandonIf] !== currentCodeIndex[keyContent.abandonIf]
      } else {
        formula.unsaved = false
      }
    }
  })
}

function getSuggestions() {
  if (!currentFormulaItem.value) return []
  return codeIndexes.value.map((item:CodeIndex) => {
    return {
      label: item.name,
      kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      insertText: item.name,
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      detail: `${item.name}-CodeIndex`
    }
  })
}

function onRegisterCompletion(suggestions:monaco.editor.IQuickSuggestionsOptions) {
  completionProvider.monacoProviderRef = monaco.languages.registerCompletionItemProvider('javascript', {
    // @ts-ignore
    provideCompletionItems: () => {
      return {
        suggestions: suggestions
      }
    }
  })
}
</script>
<style lang="scss" scoped>
.editor {
  text-align: start;
  width: 100%;
  height: calc(100% - 44px);
}
</style>
