<template>
  <div class="editor" ref='editorHTML'></div>
</template>
<script setup lang=ts name="DiffEditor">
import * as monaco from 'monaco-editor'
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import type { FormulaTabItem } from '@shared/dataModelTypes'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { clone } from '@shared/functional'
import { code } from '@shared/PrivateDeployment'
const store = useStore()
const editorHTML = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneDiffEditor | any = null
let originalModel: monaco.editor.IStandaloneCodeEditor | any = null
let modifiedModel: monaco.editor.IStandaloneCodeEditor | any = null
const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)
let oldFormulaItem:FormulaTabItem | null = null

onMounted(() => createEditor())
watch(() => currentFormulaItem.value, () => {
  setEditorValue()
})

function createEditor() {
  editor = monaco.editor.createDiffEditor(editorHTML.value as HTMLElement, {
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
  editor.addAction({
    id: 'nova-formula-save-shortcut',
    label: 'Save',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
    precondition: null || undefined,
    keybindingContext: null || undefined,
    run: () => saveNewFormula()
  })

  editor.onDidUpdateDiff((e: monaco.editor.IModelContentChangedEvent) => {
    const newVal:string = modifiedModel.getValue() || ''
    updateOpenFormulaItems(newVal)
  })
  setEditorValue()
}

function setEditorValue() {
  const K = currentFormulaItem.value?.original && currentFormulaItem.value.original.length
    ? currentFormulaItem.value.original[0].split(' ')
    : []
  if (
    !editor ||
    !currentFormulaItem.value.original ||
    !code.includes(K[K.length - 1]) ||
    (oldFormulaItem && currentFormulaItem.value && oldFormulaItem?.name === currentFormulaItem.value.name)
  ) return
  originalModel = monaco.editor.createModel(currentFormulaItem.value.original[2], 'cpp')
  modifiedModel = monaco.editor.createModel(currentFormulaItem.value.original[3], 'cpp')
  editor.setModel({
    original: originalModel,
    modified: modifiedModel
  })
  oldFormulaItem = clone(currentFormulaItem.value)
}

function saveNewFormula() {
  if (currentFormulaItem.value.unsaved && editor) {
    const newFormula = modifiedModel.getValue()
    store.dispatch('models/saveFormulaForCurrentFormulaItem', newFormula).then(_ => updateOpenFormulaItems())
  }
}

function updateOpenFormulaItems(newValue?:string) {
  const currentFormulaItem = store.state.models.currentFormulaItem
  const openedFormulaItems = store.state.models.openedFormulaItems
  openedFormulaItems.forEach((formula:FormulaTabItem) => {
    if (formula.name === currentFormulaItem.name) {
      formula.content = newValue || formula.content

      const modelBlocks = modelsDataSource.getCompleteModelBlock(formula.blockId) as any
      let oldVal = null
      if (formula.propertyId && formula.propertyType) {
        oldVal = modelBlocks[formula.propertyType][formula.propertyId][formula.key]
      } else {
        oldVal = modelBlocks[formula.key]
      }
      formula.unsaved = formula.content !== oldVal
    }
  })
  store.commit('models/updateOpenedFormulaItemsAll', openedFormulaItems)
}
</script>
<style lang="scss" scoped>
.editor {
  text-align: start;
  width: 100%;
  height: calc(100% - 74px);
}
</style>
