import mitt from 'mitt'

const eventBus = mitt()

export const SaveCurrentFormulaChannel = 'save-current-formula-channel'
export const RequestTargetParentMask = 'request-target-parent-mask'
export const ReturnTargetParentMask = 'return-target-parent-mask'
export const setCodeEditorValue = 'set-code-editor-value'
export const setCodeIndexEditorValue = 'set-codeIndex-editor-value'
export const resetFormulaContent = 'reset-formula-content'

export default eventBus
