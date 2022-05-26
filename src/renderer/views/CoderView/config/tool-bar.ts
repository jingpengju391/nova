import { addTransmit, deleteTransmit } from './transmit-table'

const buttons = [
  {
    tooltip: '新增传递试图',
    iconClass: 'folder-add',
    onClick: () => addTransmit()
  },
  {
    tooltip: '删除传递试图',
    iconClass: 'delete',
    onClick: () => deleteTransmit()
  }
]

export { buttons }
