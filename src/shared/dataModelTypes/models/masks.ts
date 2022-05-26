/* eslint-disable no-unused-vars */
import Block from './blocks'
import Variable from './variables'
import {
  CopyTypeBlock, RebaseNeededType, PropertyType, createInheritedProperty, MethodSource, VariableSource
} from './helpers'
import Series from './series'
import Link from './links'
import Method from './methods'
import { Property } from '..'
import { AnchorProduct } from '../product/products'

export enum ModelBlockType {
  masks = 'masks',
  blocks = 'blocks',
  childBlocks = 'childBlocks'
}

export interface ModelBlock {
  id: number
  /** updatedAt is the millisecond that returned from Date.getTime()  */
  updatedAt: number
  updatedFormulaAt: number
  updatedHeaderAt: number
  updatedPropertyAt: number
  name: string
  description: string
  tags: string[]
  copyType: CopyTypeBlock
  copySize: number
  groupSeparators: string[]
  copySizeFunctionLines: string
  rebaseNeeded: RebaseNeededType
  isProductMask: number
  runAfterRebaseFormula: string
  rebaseBaseFunctionLines: string
  initializeFormula: string
  finalizeFormula: string
  definitions: string
  share: boolean
  static: boolean
  allowManualResize: boolean
  variables: Record<string, Variable>
  series: Record<string, Series>
  links: Record<string, Link>
  methods: Record<string, Method>
  // using optional fields to fit both object format of model json and model in vuex store
  modelId?: number
  workspaceId?: number
  // parentId field will be stored in database but not in model json file
  parentId?: number | null
  // parent and children fields won't be stored in database
  // and will only be included in model json file
  parent?: { id: string | number, name?: string }
  children?: { id: string | number, name?: string }[]
  // detailedChildren field won't be stored in either database or model json file
  detailedChildren?: Block[]
  detailedParent: ModelBlock | null
  slidingWindow: boolean
  productId: number | undefined
  // productName: string | undefined

  updatePropertyForKey: (propertyName: PropertyType, propertyId: string, propertyKey: string, newValue: any, anchorProducts: AnchorProduct[]) => void
  addProperty: (propertyType: PropertyType, property: Property) => void
  deleteProperty: (propertyName: PropertyType, propertyId: string) => void
}

export interface dModelBlock extends ModelBlock {
  original: string[]
}

type ModelBlockMethods = 'toggleOverrideForProperty' | 'updatePropertyForKey' | 'addProperty' | 'deleteProperty'

class Mask implements ModelBlock {
  id: number
  /** updatedAt is the millisecond that returned from Date.getTime()  */
  updatedAt: number
  updatedFormulaAt: number
  updatedHeaderAt: number
  updatedPropertyAt: number
  name: string
  description: string
  tags: string[]
  copyType: CopyTypeBlock
  groupSeparators: string[]
  copySize: number
  copySizeFunctionLines: string
  rebaseNeeded: RebaseNeededType
  runAfterRebaseFormula: string
  rebaseBaseFunctionLines: string
  initializeFormula: string
  finalizeFormula: string
  definitions: string
  share: boolean
  static: boolean
  allowManualResize: boolean
  isProductMask: number
  variables: { [key: string]: Variable }
  series: { [key: string]: Series }
  links: { [key: string]: Link }
  methods: { [key: string]: Method }
  parentId: number | null
  modelId: number
  workspaceId: number
  parent?: { id: string | number, name?: string }
  children?: { id: string | number, name?: string }[]
  detailedChildren: Block[]
  detailedParent: ModelBlock | null
  slidingWindow: boolean
  productId: number | undefined
  // productName: string | undefined

  constructor(modelBlock: Omit<ModelBlock, ModelBlockMethods> = {
    id: 0,
    updatedAt: new Date().getTime(),
    updatedPropertyAt: new Date().getTime(),
    updatedHeaderAt: new Date().getTime(),
    updatedFormulaAt: new Date().getTime(),
    name: '',
    description: '',
    tags: [],
    copyType: CopyTypeBlock.no,
    copySize: 1,
    groupSeparators: [],
    copySizeFunctionLines: 'return 0;',
    rebaseNeeded: RebaseNeededType.no,
    runAfterRebaseFormula: 'return ;',
    rebaseBaseFunctionLines: 'return *this;',
    initializeFormula: 'return;',
    finalizeFormula: 'return;',
    definitions: '',
    share: false,
    static: false,
    allowManualResize: false,
    isProductMask: 0,
    variables: {},
    series: {},
    links: {},
    methods: {},
    modelId: 0,
    workspaceId: 0,
    children: [],
    detailedChildren: [],
    detailedParent: null,
    slidingWindow: false,
    productId: undefined
    // productName: undefined
  }) {
    this.id = modelBlock.id as number
    this.updatedAt = modelBlock.updatedAt
    this.updatedFormulaAt = modelBlock.updatedFormulaAt
    this.updatedPropertyAt = modelBlock.updatedPropertyAt
    this.updatedHeaderAt = modelBlock.updatedHeaderAt
    this.modelId = modelBlock.modelId ?? 0
    this.workspaceId = modelBlock.workspaceId ?? 0
    this.name = modelBlock.name
    this.description = modelBlock.description
    this.tags = modelBlock.tags
    this.copyType = modelBlock.copyType
    this.groupSeparators = modelBlock.groupSeparators
    this.copySize = modelBlock.copySize
    this.copySizeFunctionLines = modelBlock.copySizeFunctionLines
    this.rebaseNeeded = modelBlock.rebaseNeeded
    this.runAfterRebaseFormula = modelBlock.runAfterRebaseFormula
    this.rebaseBaseFunctionLines = modelBlock.rebaseBaseFunctionLines
    this.initializeFormula = modelBlock.initializeFormula
    this.finalizeFormula = modelBlock.finalizeFormula
    this.definitions = modelBlock.definitions
    this.share = modelBlock.share
    this.isProductMask = modelBlock.isProductMask
    this.static = modelBlock.static
    this.allowManualResize = modelBlock.allowManualResize ?? false
    this.variables = modelBlock.variables
    this.series = modelBlock.series
    this.links = modelBlock.links
    this.methods = modelBlock.methods
    this.parentId = modelBlock.parentId ?? null
    this.detailedChildren = modelBlock.detailedChildren ?? []
    this.detailedParent = modelBlock.detailedParent
    this.slidingWindow = modelBlock.slidingWindow
    this.productId = modelBlock.productId
    // this.productName = modelBlock.productName
  }

  /*
    Use this method to create new variable, series, link or method,v
    so that all descendent can inherit the new created one.
    Do not directly access .variables, .series, .link or .methods to add new property
   */
  addProperty(propertyType: PropertyType, property: Property) {
    this[propertyType][property.id] = property
    this.createInheritedPropertyForDescendent(propertyType, property.id)
  }

  deleteProperty(propertyType: PropertyType, propertyId: string) {
    delete this[propertyType][propertyId]
    this.detailedChildren && this.detailedChildren.forEach(block => {
      delete block[propertyType][propertyId]
      block.detailedChildren && block.detailedChildren.forEach(childBlock => {
        delete childBlock[propertyType][propertyId]
      })
    })
  }

  updatePropertyForKey(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any, anchorProducts: AnchorProduct[] = []) {
    if (fieldKey === 'override' || fieldKey === 'source' || fieldKey === 'productFormulas') {
      if (fieldKey === 'override') {
        // when override is toggled to false, reset inherited property for descendent
        !newValue && this.createInheritedPropertyForDescendent(propertyType, propertyId)
      } else if (fieldKey === 'source') {
        if (newValue === 'toDefine') {
          this.updatePropertyForDescendentWhenMyPropertySourceSetToDefine(propertyType, propertyId)
        } else if (newValue === 'codeIndex' || newValue === 'codeIndexFormula') {
          this.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts)
        } else if (this.isProductMask) {
          this.createInheritedPropertyForDescendent(propertyType, propertyId)
        }
        // else {
        //   this.updateDPDefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
        // }
      } else {
        this[propertyType][propertyId].source === 'codeIndex' && this.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts, fieldKey, newValue)
      }
    } else {
      // override is true
      const definableFields = ['copyType', 'copySize', 'copyFormula', 'source', 'calcFormula', 'valueInput']
      // override is false, always update the inherited property of descendent
      if (this[propertyType][propertyId].override) {
        definableFields.includes(fieldKey)
          ? this.updateDPDefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
          : this.updateDPUndefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
      } else {
        this.updateDPUndefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
      }
    }
    (this[propertyType][propertyId] as any)[fieldKey] = newValue
  }

  createInheritedPropertyForDescendent(propertyType: PropertyType, propertyId: string) {
    this.detailedChildren && this.detailedChildren.forEach(block => {
      block[propertyType][propertyId] = createInheritedProperty(propertyType, propertyId, this)
      // todo for name block there should be no code index or code index should only exist at only one level
      block.detailedChildren && block.detailedChildren.forEach(childBlock => {
        childBlock[propertyType][propertyId] = createInheritedProperty(propertyType, propertyId, block)
      })
    })
  }

  udpateIndexCodePropertyForDescendent(propertyType: PropertyType, propertyId: string, anchorProducts: AnchorProduct[], fieldKey?: string, newValue?: any) {
    this.detailedChildren && this.detailedChildren.forEach(block => {
      if (block.productId) {
        const propertyToUpdate = block[propertyType][propertyId]
        fieldKey && ((propertyToUpdate as any)[fieldKey] = newValue)
        const anchorProduct = anchorProducts.find((product: AnchorProduct) => product.id === block.productId)!
        const productFormulas = newValue
        const targetFormula = anchorProduct.getProductFormula(productFormulas)
        propertyToUpdate.calcFormula = targetFormula.formula
        propertyToUpdate.currentIndexExpress = targetFormula.codeIndexExpression
        // @ts-ignore
        propertyToUpdate.source = 'codeIndexFormula'
        propertyToUpdate.isDefining = true
      } else {
        block[propertyType][propertyId].productFormulas = this[propertyType][propertyId].productFormulas
      }
      block.detailedChildren && block.detailedChildren.forEach(childBlock => {
        childBlock.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts)
      })
    })
  }

  updatePropertyForDescendentWhenMyPropertySourceSetToDefine(propertyType: PropertyType, propertyId: string) {
    this.detailedChildren && this.detailedChildren.forEach((block: any) => {
      block[propertyType][propertyId].isDefining = true
      if (block[propertyType][propertyId].source === 'parent') {
        block[propertyType][propertyId].source = 'calculated'
      }
      // do not affect child block
    })
  }

  /**
  * Update Direct Property Undefinable Fields Of Inherited Property For Mask Descendent
  */
  updateDPUndefinableFieldsForDescendent(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any) {
    this.detailedChildren && this.detailedChildren.forEach((block: any) => {
      block[propertyType][propertyId][fieldKey] = newValue
      block.detailedChildren && block.detailedChildren.forEach((childBlock: any) => {
        childBlock[propertyType][propertyId][fieldKey] = newValue
      })
    })
  }

  /**
  * When mask property's override is true, update Direct Property definable Fields Of Inherited Property For Mask Descendent
  */
  updateDPDefinableFieldsForDescendent(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any) {
    this.detailedChildren && this.detailedChildren.forEach((block: Block) => {
      // @ts-ignore
      !block[propertyType][propertyId].isDefining && (block[propertyType][propertyId][fieldKey] = newValue)
      block.detailedChildren && block.detailedChildren.forEach((childBlock: Block) => {
        !childBlock.detailedParent![propertyType][propertyId].isDefining &&
          // @ts-ignore
          (childBlock[propertyType][propertyId][fieldKey] = newValue)
      })
    })
  }
}

export default Mask
