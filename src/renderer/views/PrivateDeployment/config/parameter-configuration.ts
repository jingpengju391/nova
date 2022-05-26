import { reactive, ref } from 'vue'
import { SourceControl } from '@shared/PrivateDeployment'
export const SourceControlConstant = {
  title: 'SOURCE CONTROL',
  placement: 'bottom',
  width: 250,
  trigger: 'click',
  icon: 'arrow-right'
}

export const ControlList = reactive([])
export const switchSource = ref(true)

export const isExpandHeight = 330

export const noExpandHeight = 30

export const initialReplacementConfiguration = {
  title: '初始化配置git',
  width: '30%',
  formData: [],
  footerButton: [
    {
      label: '取消',
      value: 0,
      type: ''
    },
    {
      label: '确定',
      value: 1,
      type: 'primary'
    }
  ]
}

export function checkSource(checks:string[]):SourceControl[] {
  return checks.map(item => {
    return {
      label: item,
      status: true,
      value: item,
      expand: true
    }
  })
}

export function checkSourceValue(checks:SourceControl[]):string[] {
  return checks.filter(item => item.status).map(item => item.value)
}

export function getAllSourceValue(checks:SourceControl[]):string[] {
  return checks.map(item => item.value)
}
