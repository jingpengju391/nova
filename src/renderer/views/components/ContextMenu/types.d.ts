export interface ContextMenuItemProps {
  title: string
  shortCut: string
  disabled?: boolean
  onClick: (event: Event) => void
}

export interface ScreenPosition {
    x: number
    y: number
  }

export interface ContextMenuOptions {
  screenPosition: ScreenPosition
  menuItems: Array<ContextMenuItemProps>
}
