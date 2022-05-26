import store from '@/store'
import { AssumptionSection, tableColumnWidth } from '@shared/dataModelTypes/assumptions'
import { SimplifiedDutton } from '../types'

export const ModelNavigationWorkBar = [
  {
    value: 1,
    label: '假设变量',
    slotName: 'Variables'
  },
  // {
  //   value: 2,
  //   label: 'links',
  //   slotName: 'links'
  // },
  {
    value: 3,
    label: '假设表格',
    slotName: 'files'
  }
]

export const ButtonGroup: SimplifiedDutton[] = [
  {
    type: 'primary',
    icon: 'folder',
    label: '新建变量',
    value: 0,
    drawer: true
  },
  {
    type: 'primary',
    icon: 'folder',
    label: '新建情景',
    value: 1,
    drawer: false
  }
]

export const SectionButtonGroup: SimplifiedDutton[] = [
  {
    label: '取消',
    size: 'small',
    value: 0,
    drawer: false
  },
  {
    type: 'primary',
    label: '确定',
    size: 'small',
    value: 1,
    drawer: false
  }
]

export const formDataVariable: object[] = [
  {
    label: '名称',
    ref: 'name',
    Val: '',
    required: true,
    type: 'input',
    rules: [
      {
        validator: checkName, trigger: 'blur'
      }
    ]
  },
  {
    label: '类型',
    ref: 'type',
    Val: '',
    type: 'select',
    options: [
      {
        value: 'number',
        label: '数字'
      },
      {
        value: 'string',
        label: '字符'
      }
    ]
  },
  {
    label: '描述',
    ref: 'describe',
    Val: '',
    type: 'input',
    inputType: 'textarea',
    rows: 2
  }
]

export const formDataSection: object[] = [
  {
    label: '名称',
    ref: 'label',
    Val: '',
    type: 'input',
    required: true,
    rules: [
      {
        validator: checkName2, trigger: 'blur'
      }
    ]
  },
  {
    label: '表字段',
    ref: 'value',
    Val: '',
    type: 'input',
    required: true,
    rules: [
      {
        validator: checkName2, trigger: 'blur'
      }
    ]
  }
]

export const initColumnSection: AssumptionSection = {
  label: '名称',
  value: 'name',
  status: true,
  pageId: -1
}

export const newColumnSection: AssumptionSection = {
  label: '',
  value: '',
  isEdit: true,
  status: true,
  width: tableColumnWidth
}

export const defaultProps = {
  children: 'children',
  label: 'name'
}

function checkName(rule: object, value: string, callback: any): void {
  const cod = store.getters['assumptionVar/gTableData']
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  const flag = reg.test(value)
  let flag2 = false
  const msg = '名称格式错误，请重新输入！'
  if (!flag) {
    return callback(new Error(msg))
  } else {
    callback()
  }
  for (let i = 0; i < cod.length; i++) {
    const item = cod[i]
    if (item.name === value) {
      flag2 = true
    }
  }
  if (flag2) {
    return callback(new Error('名称重复！'))
  } else {
    callback()
  }
}

function checkName2(rule: object, value: string, callback: any): void {
  const cod = store.getters['assumptionVar/gTableColumn']
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  const flag = reg.test(value)
  let flag2 = false
  const msg = '名称格式错误，请重新输入！'
  if (!flag) {
    return callback(new Error(msg))
  }
  for (let i = 0; i < cod.length; i++) {
    const item = cod[i]
    if (item.label === value) {
      flag2 = true
    }
  }
  if (flag2) {
    return callback(new Error('名称重复！'))
  }
}
