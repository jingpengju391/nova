import { computed } from 'vue'
import { modelSearch } from '../config'
export const modelButtons = computed(() => [
  {
    effect: 'dark',
    content: '新增master',
    placement: 'bottom',
    value: 1,
    title: '模型'
  },
  {
    effect: 'dark',
    content: !modelSearch?.value ? '显示搜索' : '隐藏搜索',
    placement: 'bottom',
    value: 1,
    componentId: 'search',
    click: () => (modelSearch.value = !modelSearch.value)
  }
])
