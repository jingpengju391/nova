<template>
  <div :id="isSave ? 'header' : 'headerred'">
    <span>项目编码</span>
  </div>
  <div class="project-codeEdit" ref="editorRef"></div>
</template>

<script lang=ts>
import { defineComponent, ref, PropType, onMounted, onUnmounted, watch, computed, onBeforeMount } from 'vue'
import * as monaco from 'monaco-editor'
import { useStore } from 'vuex'

// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-ignore
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
// @ts-ignore
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
// @ts-ignore
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
// import type { FormulaTabItem } from '@shared/dataModelTypes'
import defaultLanguageServer from '@/formulaLanguageServer'
import { completionProvider } from '../config'
import { clone } from '@shared/functional'
import { useDataCleanAPIs } from '../../hooks/apis'
// import store from '@/store'
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
export default defineComponent({
  // props: {
  //   formulaItem: {
  //     type: Object as PropType<FormulaTabItem>,
  //     required: true
  //   }
  // },
  setup(props) {
    const editorRef = ref<HTMLElement>()
    const store = useStore()
    const defaultCode = [].join('\n')
    const theme = {
      base: 'vs',
      inherit: true,
      rules: [
      ],
      colors: {
        'editor.selectionHighlightBackground': '#66b1ff',
        'editor.inactiveSelectionBackground': '#66b1ff'
      }

    }

    monaco.editor.defineTheme('mytheme', theme)
    const editorPlain: { editor: monaco.editor.IStandaloneCodeEditor } = {
      editor: undefined as any
    }
    const isSave = ref(true)

    const newCodingValue = computed(() => {
      if (store.state.project.currProject.type === 'coding') {
        return store.state.project.currProject.value
      } else {
        return ''
      }
    })
    watch(() => newCodingValue.value, (newValue) => {
      if (newValue !== editorPlain.editor.getValue()) {
        editorPlain.editor.setValue(newValue)
        isSave.value = true
      }
    })
    const saveCurrentCoding = async () => {
      const codingData = clone(store.state.project.currProject)
      let code = editorPlain.editor.getValue()
      codingData.value = code
      store.dispatch('project/addProjectCodingDialog', codingData)
      isSave.value = true
    }
    // const currentFormulaItem = computed(() => store.state.project.currentFormulaItem)
    onMounted(() => {
      editorPlain.editor = monaco.editor.create(editorRef.value as HTMLElement, {
        value: newCodingValue.value,
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
        theme: 'mytheme'
      })
      // console.log(monaco.editor)
      editorPlain.editor.addAction({
        id: 'nova-formula-save-shortcut',
        label: 'Save',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
        // precondition: undefined,
        // keybindingContext: undefined,
        run: () => saveCurrentCoding()
      })
      editorPlain.editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
        const newVal: string = editorPlain.editor.getModel()?.getValue() || ''
        isSave.value = false
      })
    })
    onUnmounted(() => {
      editorPlain.editor.dispose()
    })
    return {
      editorRef,
      editorPlain,
      newCodingValue,
      isSave,
      saveCurrentCoding
    }
  }
})
</script>

<style lang="scss" scoped>
.project-codeEdit {
  height: calc(100% - 36px);
  text-align: start;
  margin-top: 10px;
  border: 1px solid #d0d0d0;
  &:deep(.mtk22) {
    color: #000000;
  }
}
#headerred {
  color: red;
}
</style>
