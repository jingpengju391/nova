<template>
  <div
    :class="['editor', { 'dependency-preview': dependencyPreview }]"
    ref="editorRef"
  ></div>
</template>

<script lang="ts">
import { defineComponent, ref, toRef, onMounted, onUnmounted, PropType, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import * as monaco from 'monaco-editor'
// @ts-ignore
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import type { FormulaTabItem, Property } from '@shared/dataModelTypes'
import eventBus, { SaveCurrentFormulaChannel, setCodeEditorValue, resetFormulaContent } from '../CoderView/eventBus'
import defaultLanguageServer from '@/formulaLanguageServer'
import modelsDataSource from '@/store/modules/modelsDataSource'
import PropertyFingerPrint, { generatePropertyFingerPrintString, decodePropertyFingerPrintString } from '@/formulaLanguageServer/PropertyFingerPrint'
import { debounce, ModelNodeType } from '@/utils'
import { SimplifiedProperty } from '@shared/dataModelTypes'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { clone } from '@shared/functional'
import { useRoute } from 'vue-router'
import { code } from '@shared/PrivateDeployment'
// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: string, label: string) {
    // eslint-disable-next-line new-cap
    return new editorWorker()
  }
}

export default defineComponent({
  props: {
    formulaItem: {
      type: Object as PropType<FormulaTabItem>,
      required: true
    },
    dependencyPreview: {
      type: Boolean,
      default: false
    }
  },

  // HACK: Using Options APIs, saving using short cut won't work
  setup(props) {
    const editorRef = ref<HTMLElement>()
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
    let monacoProviderRef: any = null
    const store = useStore()
    const route = useRoute()
    const currMonacoModels = computed(() => store.getters['globalSearchReplace/gettersCurrMonacoModels'])
    const currentFormulaItem = computed(() => store.state.models.currentFormulaItem)
    const currentBlockNode = computed(() => store.state.models.currentBlockNode)
    const currentProperty = computed(() => store.state.models.currentProperty)
    const displayModelTreeNavi = computed(() => store.state.models.displayModelTreeNavi)
    if (props.dependencyPreview) {
      const formulaItem = toRef(props, 'formulaItem')
      watch(() => ({ ...formulaItem.value }),
        (newValue) => {
          const position = editorPlain.editor.getPosition()
          editorPlain.editor.setValue(newValue.content)
          editorPlain.editor.focus()
          position && editorPlain.editor.setPosition(position)
        }
      )
    } else {
      watch(() => currMonacoModels?.value, (newValue) => {
        const flag = !!newValue?.range && code.includes(newValue.key)
        flag && editorPlain.editor.setSelection(currMonacoModels.value.range)
        flag && editorPlain.editor.revealRangeInCenter(currMonacoModels.value.range, 1)
      })
    }
    const saveNewFormula = async () => {
      if (props.formulaItem.unsaved) {
        const newFormula = editorPlain.editor.getValue()
        store.dispatch('models/saveFormulaForCurrentFormulaItem', newFormula).then(async (_) => {
          await updateOpenFormulaItems()
          updateCodeForParsingWithCalcFormula()
        })
      }
    }
    function updateOpenFormulaItems(newValue?: string) {
      if (route.path === '/product') return
      const currentFormulaItem = store.state.models.currentFormulaItem
      const openedFormulaItems = store.state.models.openedFormulaItems
      openedFormulaItems.forEach((formula: FormulaTabItem) => {
        if (formula.id === currentFormulaItem.id) {
          formula.content = newValue || newValue === '' ? newValue : formula.content
          const modelBlocks = modelsDataSource.getCompleteModelBlock(formula.blockId) as any

          let oldVal = null
          if (formula.propertyId && formula.propertyType) {
            const property = modelBlocks[formula.propertyType][formula.propertyId]
            oldVal = property[formula.key]
            const flag = property.source === 'codeIndex' || property.source === 'codeIndexFormula'
            const formulasIndex = props.formulaItem.formulasIndex
            if (flag && (formulasIndex || formulasIndex === 0)) {
              if ((formulasIndex || formulasIndex === 0) && formula.productFormulas) {
                formula.productFormulas[formulasIndex].formula = newValue || formula.productFormulas[formulasIndex].formula
                const productFormulas = modelBlocks[formula.propertyType][formula.propertyId]?.productFormulas
                oldVal = productFormulas
                  ? productFormulas[formulasIndex]?.formula || '' : ''
              }
            }
          } else {
            oldVal = modelBlocks[formula.key]
          }
          formula.unsaved = formula.content !== oldVal
        }
      })
      console.log()
      store.commit('models/updateOpenedFormulaItemsAll', openedFormulaItems)
    }
    watch(() => props.formulaItem.id, _ => {
      monacoProviderRef && monacoProviderRef.dispose()
      const suggestions: monaco.editor.IQuickSuggestionsOptions | any = getSuggestions()
      onRegisterCompletion(suggestions);
      (props.formulaItem.content || props.formulaItem.content === '') && editorPlain.editor.setValue(props.formulaItem.content)
      const flag = !!currMonacoModels.value?.range && code.includes(currMonacoModels.value.key)
      flag && editorPlain.editor.setSelection(currMonacoModels.value.range)
    })

    watch(() => props.formulaItem.formulasIndex, _ => {
      if (_ || _ === 0) {
        const modelBlocks = modelsDataSource.getCompleteModelBlock(props.formulaItem.blockId)
        const property = modelBlocks[props.formulaItem.propertyType][props.formulaItem.propertyId] as Property
        if (property.source === 'codeIndex' || property.source === 'codeIndexFormula') {
          const productFormulaItem = props.formulaItem.productFormulas
          editorPlain.editor.setValue(productFormulaItem[_].formula)
        }
      }
    })

    watch(() => [props.formulaItem.readOnly, route.path], _ => {
      editorPlain.editor.updateOptions({
        readOnly: props.dependencyPreview || _[0] || route.path === '/product'
      })
    }, { deep: true })

    function updateCodeForParsingWithCalcFormula() {
      if (route.path === '/product') return
      if (!currentFormulaItem.value.propertyId || !currentFormulaItem.value.propertyType) return
      const formulaItem: any = props.formulaItem
      formulaItem.propertyName = formulaItem.name.split('.')[0]
      const currentPropertyFP = new PropertyFingerPrint(
        formulaItem.propertyId,
        formulaItem.propertyName,
        formulaItem.propertyType,
        formulaItem.blockId
      )
      const currentProperty = clone(store.state.models.currentProperty)
      try {
        const currentPropertyFPString = generatePropertyFingerPrintString(currentPropertyFP)
        const modelBolck = modelsDataSource.getCompleteModelBlock(props.formulaItem.blockId)
        const model = modelsDataSource.getModel(modelBolck.modelId)
        const referringDependencies = defaultLanguageServer.updateCodeForParsing(model, currentPropertyFPString, currentProperty, modelBolck)
      } catch (e) {
        console.log(e)
      }
    }
    onMounted(() => {
      const suggestions: monaco.editor.IQuickSuggestionsOptions | any = getSuggestions()
      onRegisterCompletion(suggestions)
      editorPlain.editor = monaco.editor.create(editorRef.value as HTMLElement, {
        value: props.formulaItem.content,
        readOnly: props.dependencyPreview || props.formulaItem.readOnly || route.path === '/product',
        language: 'cpp',
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
      // editorPlain.editor.getContribution('editor.contrib.messageController').terminate()
      const readOnlyWarning = props.formulaItem.readOnly
        ? '该模式下公式不能编辑'
        : '该公式不能编辑，请确保该Block可以被override，同时勾选Defining'
      editorPlain.editor.onDidAttemptReadOnlyEdit(() => {
        ElMessage.warning({
          message: readOnlyWarning,
          type: 'warning',
          duration: 4000,
          offset: 40
        })
      })
      if (!props.dependencyPreview) {
        editorPlain.editor.onDidChangeModelContent((e: monaco.editor.IModelContentChangedEvent) => {
          const newVal: string = editorPlain.editor.getModel()?.getValue() || ''
          updateOpenFormulaItems(newVal)
          // if (!props.formulaItem.unsaved && !flag) {
          //   // eslint-disable-next-line vue/no-mutating-props

          // } else if (editorPlain.editor.getModel()?.getAlternativeVersionId() === 1) {
          //   // eslint-disable-next-line vue/no-mutating-props
          //   updateOpenFormulaItems(newVal)
          // }
          // flag = false
        })

        editorPlain.editor.addAction({
          id: 'nova-formula-save-shortcut',
          label: 'Save',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S],
          precondition: undefined,
          keybindingContext: undefined,
          run: () => saveNewFormula()
        })

        // Go to definition
        editorPlain.editor.addAction({
          id: 'nova-formula-go-to-definition',
          label: 'Go to definition',
          keybindings: [monaco.KeyCode.F12],
          precondition: undefined,
          keybindingContext: undefined,
          run: () => {
            const position = editorPlain.editor.getPosition()
            const word = position ? editorPlain.editor.getModel()?.getWordAtPosition(position) : ''
            // TODO: check if word is after '->'
            // TODO: find reffering dependency using link info if word is after '->'
            const modelId = modelsDataSource.getCompleteModelBlock(props.formulaItem.blockId)!.modelId
            if (!modelId) return
            const formulaItem: any = props.formulaItem
            formulaItem.propertyName = formulaItem.name.split('.')[0]

            const currentPropertyFP = new PropertyFingerPrint(
              formulaItem.propertyId,
              formulaItem.propertyName,
              formulaItem.propertyType,
              formulaItem.blockId
            )

            const currentPropertyFPString = generatePropertyFingerPrintString(currentPropertyFP)
            const referringDependencies = defaultLanguageServer.getReferringProperties(modelId, currentPropertyFPString)
            // TODO: find a match of word inside referring dependencies
            try {
              const propertyFP = referringDependencies.map(fpString => {
                return decodePropertyFingerPrintString(fpString)
              }).find((fp: any) => word && (fp.propertyName === word.word))
              if (!propertyFP) {
                ElMessage.info('未在依赖关系中找到相关内容！')
                return
              }
              // TODO: update current model block and current property using propertyFP
              currentPropertyFPString && onGoToDefinition(propertyFP)
            } catch (e) {
              console.log(e)
            }
          }
        })
        eventBus.on(SaveCurrentFormulaChannel, saveNewFormula)
        eventBus.on(setCodeEditorValue, (newVal: string) => editorPlain.editor.setValue(newVal))
        eventBus.on(resetFormulaContent, _ => editorPlain.editor.setValue(props.formulaItem.content))
        const flag = !!currMonacoModels.value?.range && code.includes(currMonacoModels.value.key)
        flag && editorPlain.editor.setSelection(currMonacoModels.value.range)
        flag && editorPlain.editor.revealRangeInCenter(currMonacoModels.value.range)
      }
    })

    onUnmounted(() => {
      // editorPlain.editor.terminate()
      editorPlain.editor.dispose()
      monacoProviderRef.dispose()
      !props.dependencyPreview && eventBus.off(SaveCurrentFormulaChannel, saveNewFormula)
    })

    function onGoToDefinition(propertyFP: any) {
      const property: SimplifiedProperty = {
        id: propertyFP.propertyId,
        name: propertyFP.propertyName,
        type: propertyFP.propertyType,
        isUpdateIdKey: 'id'
      }
      store.commit('models/updateCurrentModelNodeWithModelNaviNode', { id: ModelNodeType.modelBlocks + NaviNodeIdDelimiter + propertyFP.blockId })
      store.dispatch('models/selectProperty', property)
    }
    function getSuggestions() {
      if (!props.formulaItem) return []
      const formula = clone(props.formulaItem)
      if (!formula.blockId) {
        return []
      }
      const ModelBlock = modelsDataSource.getSimplifiedModelBlockForView(formula.blockId)
      const allSource = [
        ...ModelBlock.links,
        ...ModelBlock.series,
        ...ModelBlock.variables,
        ...ModelBlock.methods
      ]
      return allSource.map((item: any) => {
        return {
          label: item.name,
          kind: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          insertText: item.name,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: `${item.name}-${item.type}`
        }
      })
    }
    function onRegisterCompletion(suggestions: monaco.editor.IQuickSuggestionsOptions) {
      monacoProviderRef = monaco.languages.registerCompletionItemProvider('cpp', {
        // @ts-ignore
        provideCompletionItems: () => {
          return {
            suggestions: suggestions
          }
        }
      })
    }

    return {
      editorRef,
      editorPlain,
      saveNewFormula
    }
  }
})
</script>

<style lang="scss" scoped>
.editor {
  text-align: start;
  width: 100%;
  /* bugs, 100% will make the whole view containe extra space in the bottom */
  /* https://github.com/microsoft/monaco-editor/issues/29 */
  /* height: calc(100% - 74px); */
  overflow: hidden;
  // bugs, if tabs and breadcrumb on editor, need to exclude tabs height and breadcrumb height, will not affect view containe extra space in the bottom
  // else not tabs and breadcrumb on editor ,it doesn't matter tabs height and breadcrumb height
  // height: 100%;
  height: 100%;

  &:deep(.monaco-editor .monaco-scrollable-element .scrollbar.vertical) {
    width: 10px !important;
  }
  &:deep(.monaco-editor
      .monaco-scrollable-element
      .scrollbar.vertical
      .slider) {
    width: 8px !important;
    border-radius: 4px !important;
    background: rgba(0, 0, 0, 0.5);
  }
  &:deep(.monaco-editor-overlaymessage) {
    font-size: 80%;
  }
}
.dependency-preview {
  height: calc(100% - 42px);
}
</style>
