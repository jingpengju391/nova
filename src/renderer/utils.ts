/* eslint-disable no-unused-vars */
import { PropertyType, VariableSource } from '@shared/dataModelTypes/models/helpers'
import { Property, SimplifiedModel, SimplifiedModelBlock, ModelBlock } from '@shared/dataModelTypes'
import { NaviNodeIdDelimiter, ModelNavigationNodeType } from '@shared/dataModelTypes/models/models'
import { Target, TargetNavigationNodeType } from '@shared/dataModelTypes/runs/targets'
import { Output, OutputNavigationNodeType } from '@shared/dataModelTypes/runs/outputs'
import { CodeIndexNavigationNodeType } from '@shared/dataModelTypes/product/indicators'
import { ProjectionNavigationNodeType } from '@shared/dataModelTypes/runs/projections'
import { clone } from '@shared/functional'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { AnchorProduct } from '@shared/dataModelTypes/product/products'
import { CheckedHalflimiter } from '@shared/dataModelTypes/assumptions'

export function getPropertyType(property: Property): PropertyType {
  if ('target' in property) {
    return PropertyType.links
  } else if ('parameter' in property) {
    return PropertyType.methods
  } else if ('type' in property) {
    return PropertyType.variables
  } else {
    return PropertyType.series
  }
}

export enum ModelNodeType {
  models = 'models',
  modelBlocks = 'modelBlocks'
}

export enum MasterNodeType {
  master = 'master',
  product = 'product',
  codeIndex = 'codeIndex',
  models = 'models'
}

export function getModelNodeType(node: SimplifiedModel | SimplifiedModelBlock): ModelNodeType {
  if ((node as SimplifiedModelBlock)?.modelId) {
    return ModelNodeType.modelBlocks
  }
  return ModelNodeType.models
}

export function hasCalcFormula(property: Property, parentProperty?: Property): boolean {
  if (property.source === 'codeIndexFormula') {
    return !!property.calcFormula || !!property?.original?.length
  }
  switch (getPropertyType(property)) {
    case PropertyType.methods:
      return true
    default:
      if (property.source === 'calculated' || property.source === 'codeIndex') {
        return true
      } else if (property.source === 'parent' && parentProperty) {
        if (parentProperty.source === 'calculated') return true
      }
      return false
  }
}

export function getModelNavigationNodeIdAndType(modelNavigationNodeId: string): { id: number, type: ModelNavigationNodeType } {
  const [type, id] = modelNavigationNodeId.split(NaviNodeIdDelimiter)
  return {
    id: parseInt(id),
    type: type === ModelNodeType.models ? ModelNavigationNodeType.models : ModelNavigationNodeType.modelBlocks
  }
}

export function getTargetNavigationNodeIdAndType(targetNavigationNodeId: string): { id: number, type: TargetNavigationNodeType } {
  const [type, id] = targetNavigationNodeId.split(NaviNodeIdDelimiter)
  return {
    id: parseInt(id),
    type: type === ModelNodeType.models ? TargetNavigationNodeType.models : TargetNavigationNodeType.targets
  }
}
export function getProjectionNavigationNodeIdAndType(projectionNavigationNodeId: string): { id: number, type: ProjectionNavigationNodeType } {
  const [type, id] = projectionNavigationNodeId.split(NaviNodeIdDelimiter)
  return {
    id: parseInt(id),
    type: type === ModelNodeType.models ? ProjectionNavigationNodeType.models : ProjectionNavigationNodeType.projections
  }
}

export function getOutputNavigationNodeIdAndType(outputNavigationNodeId: string): { id: number, type: OutputNavigationNodeType } {
  const [type, id] = outputNavigationNodeId.split(NaviNodeIdDelimiter)
  return {
    id: parseInt(id),
    type: type === ModelNodeType.models ? OutputNavigationNodeType.models : OutputNavigationNodeType.outputs
  }
}

export function getCodeIndexNavigationNodeIdAndType(codeIndexNavigationNodeId: string): { id: number, type: CodeIndexNavigationNodeType } {
  const [type, id] = codeIndexNavigationNodeId.split(NaviNodeIdDelimiter)
  return {
    id: parseInt(id),
    type: type === CodeIndexNavigationNodeType.codeIndex ? CodeIndexNavigationNodeType.codeIndex : CodeIndexNavigationNodeType.models
  }
}

export function getMasterNavigationNodeIdAndType(masterNavigationNodeId: string): { id: number, type: MasterNodeType } {
  const [type, id] = masterNavigationNodeId.split(NaviNodeIdDelimiter)
  const result = {
    id: Number(id),
    type: MasterNodeType.product
  }

  switch (type) {
    case MasterNodeType.codeIndex:
      result.type = MasterNodeType.codeIndex
      break
    case MasterNodeType.master:
      result.type = MasterNodeType.master
      break
    case MasterNodeType.product:
      result.type = MasterNodeType.product
      break
    case MasterNodeType.models:
      result.type = MasterNodeType.models
      break
    default:
      result.type = MasterNodeType.product
  }
  return result
}

export function debounce(fn: (...args: any[]) => any, delay = 600) {
  let timer: null | number = null
  return (...args: any[]) => {
    timer = window.setTimeout(() => {
      fn(...args)
      window.clearTimeout(timer!)
    }, delay)
  }
}

export function throttle(fn: any, delay = 600) {
  let lock = false
  return (...args: any[]) => {
    if (lock) return
    fn(...args)
    lock = true
    setTimeout(() => (lock = false), delay)
  }
}

export function ValidationName(data: string) {
  const reg = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return reg.test(data)
}

export function validateNameLegality(entity: Target | Output): boolean {
  // 只允许包含下划线或英文字母
  const pattern1 = /^[A-Za-z][_\w]*$/
  return pattern1.test(entity.name)
}

export function validateEmptyName(entity: Target | Output): boolean {
  return !!entity.name
}

export function validateDuplicatedName<T extends Target | Output>(entity: T, allEntities: T[]): boolean {
  for (const e of allEntities) {
    if (entity.modelId === e.modelId && entity.id !== e.id && entity.name === e.name) {
      return false
    }
  }
  return true
}

export function validateLinkChain(entity: Target | Output): boolean {
  return entity.linkChain && entity.linkChain.length > 0
}

export function filterSourceAndNaviTree(tree: Object[], key: string, value: string, pageId?: number, variableId?: number, modelId?:number) {
  const U: Object[] = clone(tree)
  const T: Object[] = []
  U.forEach((item: any) => {
    item.children = item.children.filter((child: any) => child[key].toLowerCase() === value && child.isDefining)
    if (pageId) {
      item.children.forEach((child: any) => {
        child.id = `${child.id}${CheckedHalflimiter}${item.id}`
        child.disabled = false
        if (child.assumptionBind) {
          child.disabled = (child?.assumptionBind?.pageId !== pageId ||
            child?.assumptionBind?.variableId !== variableId) &&
          modelId === item.modelId
        }
      })
    }
    if (item.children.length) {
      T.push({
        id: item.id,
        modelId: item.modelId,
        name: item.name,
        children: item.children
      })
    }
  })
  return T
}

export function getTreeChildNode(tree: Object[]) {
  const newTree = JSON.parse(JSON.stringify(tree))
  const childNode: Object[] = []
  let UpperLevel: any
  const fn = (TreeList: any) => {
    for (let i = 0; i < TreeList.length; i++) {
      const item = TreeList[i]
      if (!item.children) {
        const T = TreeList.map((iter: any) => {
          return { ...iter, modelIds: UpperLevel.modelId, blockId: UpperLevel.id }
        })
        childNode.push(...T)
        return
      } else {
        UpperLevel = item
      }
      fn(item.children)
    }
  }
  fn(newTree)
  return childNode
}

export function getCurrDateTime(dateLinkSymbol: string) {
  const date: any = new Date()
  const YY = date.getFullYear()
  const MM = date.getMonth() + 1
  const DD = date.getDate()
  const hh = date.getHours()
  const mm = date.getMinutes()
  const ss = date.getSeconds()

  return `${YY}${dateLinkSymbol}${MM}${dateLinkSymbol}${DD} ${hh}:${mm}:${ss}`
}

export function evalRight(fn: string) {
  const Fun = Function
  return new Fun('return ' + fn)()
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function constructStructureTreeData(data: never[], rootId: string | number, id?: string, parentId?: string, children?: string) {
  const idKey = id || 'id'
  const parentIdKey = parentId || 'parentId'
  const childrenKey = children || 'children'
  rootId = rootId || 0
  const treeData = data.filter((father: any) => {
    const branch = data.filter((child: any) => father[idKey] === child[parentIdKey])
    father[childrenKey] = branch.length > 0 ? branch : ''
    return father[parentIdKey] === rootId
  })
  return treeData
}

export function isFeiyanWorkspaceFile(file: File): boolean {
  return file.name.endsWith('.feiyanworkspace')
}

export function searchModelTree(tree: any, id: string) {
  let res: any = null
  let state = false
  function readTree(tree: any, id: any) {
    if (state) return
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === id) {
        state = true
        res = tree[i]
      } else {
        if (tree[i].children != null) {
          readTree(tree[i].children, id)
        }
      }
    }
  }
  readTree(tree, id)
  return res
}

// @ts-ignore
export function getDiffForJson(oldObj, newObj, checks, ignores) {
  // Array.isArray(newObj) && alignment(oldObj, newObj)
  return [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])]
    .filter(item => !ignores.includes(item))
    .reduce((r, k) => {
      if (oldObj[k] && newObj[k] && typeof oldObj[k] === 'object' && typeof newObj[k] === 'object') {
        const res = getDiffForJson(oldObj[k], newObj[k], checks, ignores)
        // @ts-ignore
        res.length && r.push(...res.map(([l, ...oldObj]) => [k + ' ' + l, ...oldObj]))
        return r
      }

      // if (k in oldObj && (!(k in newObj) || newObj[k] === undefined)) {
      //   // @ts-ignore
      //   r.push([k, 'deleted', oldObj[k]])
      //   return r
      // }

      if (Array.isArray(newObj) && Array.isArray(oldObj)) {
        // @ts-ignore
        const deleteIndex = newObj.findIndex(obj => obj.id === oldObj[k].id || obj.name === oldObj[k].name)
        if (deleteIndex === -1) {
          // @ts-ignore
          r.push([k, 'deleted', oldObj[k]])
          return r
        }
        // @ts-ignore
        const createdIndex = oldObj.findIndex(obj => obj.id === newObj[k].id || obj.name === newObj[k].name)
        if (createdIndex === -1) {
          // @ts-ignore
          r.push([k, 'created', newObj[k]])
          return r
        }
      } else {
        if (k in oldObj && (!(k in newObj))) {
          // @ts-ignore
          r.push([k, 'deleted', oldObj[k]])
          return r
        }

        if (!(k in oldObj) && k in newObj) {
          // @ts-ignore
          r.push([k, 'created', newObj[k]])
          return r
        }
      }
      if (oldObj[k] === newObj[k] || !checks.includes(k)) return r
      // @ts-ignore
      r.push([k, 'changed', oldObj[k], newObj[k]])
      return r
    }, [])
}

function alignment(reference: any, alignment: any) {
  // if (reference.length === alignment.length) return
  for (let i = 0; i < reference.length; i++) {
    (!alignment[i] || reference[i].id !== alignment[i].id) && alignment.splice(i, 0, undefined)
  }
}

export function filterTree(tree: any, factor: string, arr: any = []) {
  if (!tree.length) return []
  for (let item of tree) {
    const [type, id] = item.id.split(NaviNodeIdDelimiter)
    const node = { ...item, children: [] }
    if (type !== ModelNodeType.models) {
      const completeModelBlock = modelsDataSource.getCompleteModelBlock(id * 1)
      if (completeModelBlock.parentId && completeModelBlock.productId) continue
    }
    arr.push(node)
    if (item.children && item.children.length) filterTree(item.children, factor, node.children)
  }
  return arr
}

export function getProductIdAndName(modelBlock:ModelBlock):{id:number, name:string} {
  const result = { id: 0, name: '' }
  if (!modelBlock.productId) return result
  const length = modelBlock.name.length - modelBlock.productId.toString().length - 1
  result.id = modelBlock.productId
  result.name = modelBlock.name.substr(0, length)
  return result
}

export function getModelIdByCurrentModelNode(currentModelNode:SimplifiedModel | SimplifiedModelBlock):number {
  if (!currentModelNode) return -1
  const isModels = getModelNodeType(currentModelNode) === ModelNodeType.models
  if (isModels) return currentModelNode.id
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
  return completeModelBlock.modelId!
  // if (completeModelBlock.modelId) {

  // } else {
  //   const completeParentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId!)
  //   return completeParentModelBlock.modelId!
  // }
}

export function FordateAlignType(dataType: string) {
  if (dataType === 'entry_date_data') {
    return '_ENTRY_DATE'
  } else if (dataType === 'entry_t_data') {
    return '_ENTRY_T'
  }
}
export function formatQueueInheritRunner(child: any, formatData: any) {
  return {
    id: child.id,
    name: child.name,
    parentId: child.parentId,
    runnerId: child.runnerId,
    isInherit: child.isInherit,
    ...formatData
  }
}
export function treeFind(tree:any, fnc:any):any {
  for (const data of tree) {
    if (fnc(data)) return data
    if (data.children) {
      const res = treeFind(data.children, fnc)
      if (res) return res
    }
  }
  return null
}

export function noFormatCodeIndex(property:Property, currentModelNode:SimplifiedModelBlock, routePath:string, currentMaster:AnchorProduct) {
  if (routePath !== '/product' || !currentMaster || !currentModelNode.isProductMask) return true
  const newProperty = modelsDataSource.getProperty(property.id, property.type, currentModelNode.id)
  if (newProperty.source !== VariableSource.codeIndexFormula && newProperty.source !== VariableSource.codeIndex) return true
  if (!newProperty?.calcFormula) return false
  const productFormula = newProperty?.productFormulas || []
  const calcProductFormula = currentMaster.getProductFormula(productFormula)
  return newProperty.calcFormula === calcProductFormula.formula && !!newProperty.calcFormula
}

export function getZhCnProperty(source:string):string {
  switch (source) {
    case 'calculated':
      source = '公式'
      break
    case 'parent':
      source = '父级'
      break
    case 'toDefine':
      source = '空白'
      break
    case 'default':
      source = '默认'
      break
    case 'transmit':
      source = '传递'
      break
    case 'data':
      source = '数据'
      break
    case 'assumption':
      source = '假设'
      break
    case 'codeIndex':
      source = '索引'
      break
    case 'codeIndexFormula':
      source = '索引'
      break
  }
  return source
}
