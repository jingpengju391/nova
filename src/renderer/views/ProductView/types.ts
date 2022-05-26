export interface ToolsTypes {
  effect: 'dark' | 'light',
  content: string,
  placement: 'bottom' | 'top' | 'left' | 'right',
  value: number,
  componentId: string,
  isShowClass?: string
  click: void
}

export interface Library {
  key: number
  label: string
  disabled: boolean | undefined
  classify: string | undefined
}
