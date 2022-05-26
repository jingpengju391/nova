export interface simpleButton {
  value: number
  label: string
  type: string
}

export interface ControlButton extends simpleButton {
  font: string
  click: any
}
export interface SourceControl {
  value: string
  label: string
  status: boolean
  expand: boolean
  minSize?: number
  size?: number
  input?: string,
  placeholder?: string,
  function?: ControlButton[]
}

export interface fromRule {
  validator: void
  trigger: string
}
export interface fromData {
  label: string
  ref: string
  Val: string
  type: string
  required: boolean
  disabled?: boolean
  rules?: fromRule[]
}

export interface gitConfig {
  url: string
  username: string
  email: string
}

export interface simpleResult {
  error?: string
  [propName: string]: any
}

export interface simpleMessage {
  message: string
  type: string
}

export interface dTabs {
  value: string
  label: string
  checks: string[]
  ignore: string[]
}

export const code = [
  'copySizeFunctionLines', 'initializeFormula', 'finalizeFormula',
  'runAfterRebaseFormula', 'rebaseBaseFunctionLines', 'calcFormula',
  'copyFormula', 'abandonIf', 'chooseIf'
]

export const codeLable = [
  '数组大小公式', '初始化函数', '结束函数',
  '关联重置函数', '基准模型公式', '计算公式',
  '数组公式', 'abandonIf', 'chooseIf'
]

export const attribute = [
  'name', 'description', 'copyType', 'groupSeparators', 'copyType',
  'copySize', 'copySizeFunctionLines', 'rebaseNeeded', 'runAfterRebaseFormula',
  'rebaseBaseFunctionLines', 'initializeFormula', 'finalizeFormula', 'definitions', 'share', 'static',
  'slidingWindow', 'tags', 'override', 'isDefining', 'target', 'source', 'matchCopy',
  'classify', 'parameter', 'returnType', 'isAutoSum', 'autoSumLevel', 'rebasePeerModelValueBfRebase',
  'rebaseType', 'type', 'valueInput'
]

export const checks: string[] = [...code, ...attribute]

export const ignore = ['isUpdateIdKey']
