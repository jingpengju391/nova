import { ref } from 'vue'
import { searchRule } from './filter'
import { evalRight } from '@/utils'
import { propertyType, selects } from './range'
import { VxeColumnPropTypes } from 'vxe-table'
import { code } from '@shared/PrivateDeployment'

export const loading = ref(false)

const formatterEmpty: VxeColumnPropTypes.Formatter = ({ cellValue }) =>
  cellValue || '--'

const formatterType: VxeColumnPropTypes.Formatter = ({ cellValue }) => {
  const item = propertyType.find(item => item.value === cellValue)
  return item ? item.label : selects[1].options.find(p => p.value === cellValue)!.label
}

export const columns = [
  {
    field: 'type',
    title: '类型',
    width: 150,
    sortable: true,
    filters: propertyType,
    formatter: formatterType
  },
  {
    field: 'name',
    title: '名称',
    width: 150,
    type: 'html',
    formatter: formatterEmpty
  },
  {
    field: 'path',
    title: '路径',
    width: 150,
    formatter: formatterEmpty
  },
  {
    field: 'formula',
    title: '代码',
    width: 150,
    type: 'html',
    formatter: formatterEmpty
  },
  {
    field: 'description',
    title: '描述',
    width: 150,
    type: 'html',
    formatter: formatterEmpty
  }
]

export function highlightKeyword(obj: any, replaceValue: string) {
  const className = replaceValue ? 'through-search-text' : 'search-text'
  const text = code.includes(obj.key) ? obj.formula : obj[obj.key]
  const startColumn = obj.range.startColumn - 1
  const endColumn = obj.range.endColumn - 1
  const pre = text.substring(0, startColumn)
  const middle = text.substring(startColumn, endColumn)
  const next = text.substring(endColumn, text.length)
  return replaceValue
    ? `${pre}<b class='${className}'>${middle}</b><b class="replace-txt">${replaceValue}</b>${next}`
    : `${pre}<b class='${className}'>${middle}</b>${next}`
}

export const filterNameMethod: VxeColumnPropTypes.FilterMethod = ({ value, row }) =>
  row.type === value
