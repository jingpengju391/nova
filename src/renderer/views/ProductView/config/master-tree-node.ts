import TreeNode from '../components/ProductNavigation/TreeNode.vue'
import { ElTree } from 'element-plus'
import { SimplifiedProduct } from '@shared/dataModelTypes/product/products'
import type { SimplifiedModelBlock } from '@shared/dataModelTypes'

export function renderTreeNode(h: any, { node, data }: { node: typeof ElTree, data:SimplifiedProduct }) {
  return h(TreeNode, {
    node,
    data
  })
}

export function renderModelTreeNode(h: any, { node, data }: { node: typeof ElTree, data:SimplifiedModelBlock }) {
  return h(TreeNode, {
    node,
    data
  })
}
