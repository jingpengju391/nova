import { getModelNavigationNodeIdAndType, treeFind, getModelNodeType, getMasterNavigationNodeIdAndType } from '@/utils'
import type {
  ModelBlock, ModelNavigationNode, ModelNavigationTree,
  SimplifiedModelBlock, SimplifiedModel
} from '@shared/dataModelTypes'
import store from '@/store'
import { ModelNavigationNodeType, NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import Mask, { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import Block from '@shared/dataModelTypes/models/blocks'
import modelsDataSource from '../modules/modelsDataSource'
import { LinkTargetType } from '@shared/dataModelTypes/models/helpers'
import { LinkTarget } from '@shared/dataModelTypes/models/links'
export function addModelBlockInPartNavigationTreeForView(
  partNavigationTree:ModelNavigationTree, currentModelNode: SimplifiedModel | SimplifiedModelBlock,
  legalModelBlock: Mask | Block, parentModelBlockForLink?:ModelNavigationNode
) {
  const { modelNaviNode } = getUpdateModelNaviNode(partNavigationTree, currentModelNode, legalModelBlock, parentModelBlockForLink)
  modelNaviNode.children.push({
    id: ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + legalModelBlock.id,
    name: legalModelBlock.name,
    copyType: legalModelBlock.copyType,
    children: []
  })
}

function getUpdateModelNaviNode(
  partNavigationTree:ModelNavigationTree, currentModelNode: SimplifiedModel | SimplifiedModelBlock,
  legalModelBlock: Mask | Block, parentModelBlockForLink?:ModelNavigationNode
) {
  const { idString } = getCurrentModelParentId()
  const ancestorPath = getAncestorPath(partNavigationTree, idString, legalModelBlock)
  let modelNaviNode = partNavigationTree.find(node => node.id === ModelNavigationNodeType.models + NaviNodeIdDelimiter + ancestorPath[0])!
  ancestorPath.slice(1, -1).forEach(ancestorId => {
    modelNaviNode = modelNaviNode.children.find(node =>
      node.id === ModelNavigationNodeType.modelBlocks + NaviNodeIdDelimiter + ancestorId)!
  })
  return { modelNaviNode }
}

export function getAncestorPath(partNavigationTree:ModelNavigationTree, id:string, legalModelBlock: Mask | Block):number[] {
  const ids:number[] = []
  ids.push(legalModelBlock.id)
  recursion(id, partNavigationTree)
  return ids

  function recursion(id:string, partNavigationTree:ModelNavigationTree) {
    const node = treeFind(partNavigationTree, checkTreeNode)
    const { id: resId } = getModelNavigationNodeIdAndType(node.id)
    ids.unshift(resId)
    if (!node || !node.parentNode) return false
    recursion(node.parentNode.id, partNavigationTree)

    function checkTreeNode(node:any):boolean {
      return node.id === id
    }
  }
}

export function getAncestorPaths(modelNavigationTree:ModelNavigationTree, idString:string):number[] {
  let idStr = idString
  const ids:number[] = []
  recursion()
  return ids.reverse()

  function recursion() {
    const node = treeFind(modelNavigationTree, checkTreeNode)
    if (!node) return
    if (!node.parentNode) {
      const { id } = getModelNavigationNodeIdAndType(node.id)
      ids.push(id)
      return
    }
    idStr = node.parentNode.id
    const { id } = getModelNavigationNodeIdAndType(node.id)
    ids.push(id)
    recursion()
  }

  function checkTreeNode(node:any):boolean {
    return node.id === idStr
  }
}

export function getLinkTarget(modelBlockNmae:string, id:number):LinkTarget {
  const type = modelsDataSource.getModelBlockType(id)
  switch (type) {
    case ModelBlockType.blocks:
      return {
        blockName: modelBlockNmae,
        maskName: '',
        type: LinkTargetType.block,
        id
      }
    default:
      return {
        blockName: '',
        maskName: modelBlockNmae,
        type: LinkTargetType.mask,
        id
      }
  }
}

export function getRelationLickByModelBlock(modelId:number, oldName:string):ModelBlock[] {
  const completeModel = modelsDataSource.getCompleteModel(modelId)
  const modelBlocks = completeModel.detailedChildren
  return modelBlocks.filter(modelBlock => {
    const linkNames = Object.values(modelBlock.links)
      .filter(link => link.target && (link.target.blockName || link.target.maskName))
      .map(link => {
        return link.target?.blockName || link.target?.maskName
      })
    return linkNames.includes(oldName)
  }).map(modelBlock => modelsDataSource.getCompleteModelBlock(modelBlock.id))
}

export function updatedModelBlocksLinkName(updatedModelBlocks:ModelBlock[], oldName:string, targetName?:string):ModelBlock[] {
  return updatedModelBlocks.map(modelBlock => {
    Object.values(modelBlock.links)
      .forEach(link => {
        const flag = link.target && (link.target?.blockName === oldName || link.target?.maskName === oldName)
        if (flag) {
          if (targetName) {
            if (link.target!.type === LinkTargetType.block) {
              link.target!.blockName = targetName
            } else {
              link.target!.maskName = targetName
            }
          } else {
            link.target = { blockName: '', maskName: '', type: LinkTargetType.mask, id: -1 }
          }
        }
      })
    return modelBlock
  })
}

export function getCurrentModelParentId():{id:number, idString:string, currentBlockNodeId:number} {
  const tree = store.state.relation.modelNavigationTree
  const currentModelNode = store.state.models.currentModelNode as SimplifiedModelBlock
  const relationCurrentModelNodeSource = store.state.relation.relationCurrentModelNodeSource
  const node = store.state.relation.currentNavigationNode
  const type = getModelNodeType(currentModelNode)
  const currentNodeId = node?.id || prevNodeId()
  const { id } = getMasterNavigationNodeIdAndType(currentNodeId)

  return {
    id,
    idString: currentNodeId,
    currentBlockNodeId: currentModelNode.id
  }

  function prevNodeId():string {
    const displayModelTreeNavi = store.state.models.displayModelTreeNavi
    const isRelationLink = store.state.models.isRelationLink
    if (!displayModelTreeNavi || !isRelationLink || !relationCurrentModelNodeSource) return type + NaviNodeIdDelimiter + currentModelNode.id

    const currentNode = treeFind(tree, checkTreeNode)
    if (!currentNode) return type + NaviNodeIdDelimiter + currentModelNode.id

    if (!currentNode.parentNode) return currentNode.id
    return currentNode.parentNode.id
  }

  function checkTreeNode(node:any):boolean {
    return node.id === relationCurrentModelNodeSource!.id
  }
}
