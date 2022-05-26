import { ModelNodeType } from '@/utils'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { ModelNavigationNodeType } from '@shared/dataModelTypes/models/models'
import { CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'
import { ref } from 'vue'

export const rangeValue = ref(['formula'])
export const objectValue = ref(['property'])
export const propertyType = [
  {
    label: '单值变量',
    value: PropertyType.variables
  },
  {
    label: '序列',
    value: PropertyType.series
  },
  {
    label: '链接',
    value: PropertyType.links
  },
  {
    label: '方法',
    value: PropertyType.links
  }
]
export const selects = [
  {
    multiple: true,
    placeholder: '请选择查询范围',
    options: [
      {
        value: 'name',
        label: '名称'
      },
      {
        value: 'formula',
        label: '公式'
      },
      {
        value: 'description',
        label: '描述'
      }
    ]
  },
  {
    multiple: true,
    placeholder: '请选择对象',
    options: [
      {
        value: 'modelBlock',
        label: '模块'
      },
      {
        value: 'property',
        label: '变量'
      },
      {
        value: 'codeIndex',
        label: '索引'
      }
    ]
  }
]
