import type { ModelJSON, ModelNavigationTree, ModelNavigationNode } from '@shared/dataModelTypes'

export interface ModelTreeNode {
  id: string | number
  name: string
  children: ModelTreeNode[]
}
// this is used just for displaying model tree in model import dialog
// not to model the app state logic
export function convertModelJSONToModelTree(json: ModelJSON): ModelNavigationTree {
  const map = json.blocks.reduce((acc, item) => {
    acc.set(item.id!, { id: item.id as string, name: item.name!, children: [] })
    return acc
  }, new Map() as Map<(number | string), ModelNavigationNode>)

  json.blocks.forEach(item => {
    if (item.parent?.id && item.id) {
      const parent = map.get(item.parent.id)
      if (parent) {
        const current = map.get(item.id)!
        parent.children.push(current)
      } else {
        window.console.error('can not find parent item', item.parent.id)
      }
    }
  })

  return json.blocks.filter(item => !item.parent?.id).map(item => map.get(item.id!)!)
}

// used for export model to check all checkable nodes by default
export function getDefaultCheckedKeys(models: ModelNavigationTree): (number | string)[] {
  const keys: (number | string)[] = []
  models.forEach(model => {
    model.children.forEach(mask => {
      keys.push(mask.id)
      mask.children.forEach(block => {
        keys.push(block.id)
        block.children.forEach(childBlock => {
          keys.push(childBlock.id)
        })
      })
    })
  })
  return keys
}
