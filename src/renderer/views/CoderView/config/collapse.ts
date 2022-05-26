import { ref } from 'vue'
import { Collapses } from '@shared/dataModelTypes/models/helpers'
const currentCollapse = ref<string>('1')

const basic: Collapses = {
  title: '基础信息',
  icon: '&#xe6ad;',
  value: '1'
}

const transmit: Collapses = {
  title: '传递试图',
  icon: '&#xe611;',
  value: '2'
}

function calcHeight(element: HTMLElement, collapses: Collapses[]) {
  /**
   * collapseHeader collapse header element
   * collapseHeader collapse header height
   * collapseMarginBottom collapse margin bottom size
   */
  const collapseHeader = document.getElementsByClassName('el-collapse-item__header')[0] as HTMLElement
  const collapseHeaderHeight = collapseHeader?.offsetHeight
  const collapseMarginBottom = 2
  const height = element.offsetHeight - (collapseHeaderHeight + collapseMarginBottom) * collapses.length || 0
  return height
}

export { currentCollapse, basic, transmit, calcHeight }
