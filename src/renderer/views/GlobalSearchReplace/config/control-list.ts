import { reactive, ref } from 'vue'
import { SourceControl } from '@shared/PrivateDeployment'

export const ControlList = reactive([])
export const switchSource = ref(true)

export const setSourceControl = (currentSource: SourceControl) => {
  currentSource.status = !currentSource.status
}

export function checkSource(checks: string[], labels: string[]): SourceControl[] {
  return checks.map((item, index) => {
    return {
      label: labels[index],
      status: item === 'calcFormula' || item === 'copyFormula',
      value: item,
      expand: true
    }
  })
}

export const SourceControlConstant = {
  title: 'SOURCE CONTROL',
  placement: 'bottom',
  width: 250,
  trigger: 'click',
  icon: 'arrow-right'
}
