import { App, createVNode, render } from 'vue'
import ContextMenu from './ContextMenu.vue'
import type { ContextMenuOptions } from './types'

// import PopupManager from 'element-plus/lib/utils/popup-manager'

import { useZIndex } from 'element-plus'

let id = 0
document.oncontextmenu = () => { return false }

const _ContextMenu = function (options: ContextMenuOptions) {
  if (!options) { return }
  const container = document.createElement('div')
  container.className = `nova-context-menu-container_${id++}`
  container.style.width = '100vw'
  container.style.height = '100vh'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.zIndex = useZIndex().nextZIndex().toString()
  container.addEventListener('click', () => {
    document.body.removeChild(container)
  })

  const vm = createVNode(ContextMenu, { ...options }, null)
  render(vm, container)

  document.body.appendChild(container)
}

_ContextMenu.install = (app: App) => {
  app.config.globalProperties.$contextMenu = _ContextMenu
}

export default _ContextMenu
