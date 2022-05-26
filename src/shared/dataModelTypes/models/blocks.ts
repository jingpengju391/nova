import { createInheritedProperty, LinkSource, MethodSource, PropertyType, SeriesSource, VariableSource } from './helpers'
import type { Series, Link, Method, ModelBlock, Property } from '..'
import Mask from './masks'
import Variable from './variables'
import { clone } from '../../functional'
import { AnchorProduct } from '../product/products'

export function generateProductBlock(anchorProduct: AnchorProduct, coreBlock: Block | Mask): ModelBlock | undefined {
  return new Block(coreBlock, undefined, undefined, anchorProduct)
}

export function updateProductBlock(anchorProduct: AnchorProduct, coreBlock: Block | Mask): ModelBlock | undefined {
  if (coreBlock.productId !== undefined) {
    return undefined
  }
  if (coreBlock.parentId !== undefined) {
    return undefined
  }
  const productBlock = coreBlock.detailedChildren?.find((item: Block) => item.productId === anchorProduct.id)
  if (productBlock) {
    Object.values(productBlock.series).forEach((item: Series) => {
      if (item.source === SeriesSource.codeIndex) {
        const productFormula = anchorProduct.getProductFormula(coreBlock.series[item.id].productFormulas)
        item.calcFormula = productFormula.formula
      }
    })
    Object.values(productBlock.variables).forEach((item: Variable) => {
      if (item.source === VariableSource.codeIndex) {
        const productFormula = anchorProduct.getProductFormula(coreBlock.variables[item.id].productFormulas)
        item.calcFormula = productFormula.formula
      }
    })
    Object.values(productBlock.methods).forEach((item: Method) => {
      if (item.source === MethodSource.codeIndex) {
        const productFormula = anchorProduct.getProductFormula(coreBlock.methods[item.id].productFormulas)
        item.calcFormula = productFormula.formula
      }
    })
    // Object.values(productBlock.links).forEach((item: Link) => {
    //   if (item.source === LinkSource.codeIndex) {
    //     const productFormula = anchorProduct.getProductFormula(coreBlock.links[item.id].productFormulas)
    //     item.calcFormula = productFormula.formula
    //   }
    // })
  }
}

function normalizeInheritedProperties(propertyType: PropertyType, self: ModelBlock,
  parent: Mask | Block, parentJSON?: ModelBlock): Record<string, Property> {
  const newProps: Record<string, Property> = {}
  for (const propId in self[propertyType]) {
    // property that belongs to ancestor
    const ref = (self[propertyType][propId] as any).ref as string
    if (ref && !self[propertyType][propId].isDirect) {
      let ancestorProp: Property
      if (parent[propertyType][ref]) {
        ancestorProp = clone(parent[propertyType][ref])
      } else {
        ancestorProp = {
          ...clone(parentJSON![propertyType]![ref]),
          id: (parentJSON![propertyType]![ref] as any).ref
        }
      }
      const selfProp = self[propertyType][propId] as any
      const newProp = {
        ...ancestorProp,
        isDirect: false,
        isDefining: self[propertyType][propId].isDefining
      } as any
      if (newProp.isDefining) {
        // override the copyFormula or calcFormula
        if ('copyFormula' in newProp) {
          newProp.copyFormula = selfProp.copyFormula
        }
        if ('copyType' in newProp) {
          newProp.copyType = selfProp.copyType
        }
        if ('source' in newProp) {
          newProp.source = selfProp.source
        }
        if ('isAutoSum' in newProp) {
          newProp.isAutoSum = selfProp.isAutoSum
        }
        if ('autoSumLevel' in newProp) {
          newProp.autoSumLevel = selfProp.autoSumLevel
        }
        if ('slidingWindow' in newProp) {
          newProp.slidingWindow = selfProp.slidingWindow
        }
        if ('slidingWindowChunks' in newProp) {
          newProp.slidingWindowChunks = selfProp.slidingWindowChunks
        }
        if ('currentIndexExpress' in newProp) {
          newProp.currentIndexExpress = selfProp.currentIndexExpress
        }
        newProp.calcFormula = selfProp.calcFormula
      }
      newProps[newProp.id] = newProp
    } else {
      // property that is self defined
      newProps[propId] = clone(self[propertyType][propId])
    }
  }
  for (const propId in parent[propertyType]) {
    !newProps[propId] && (newProps[propId] = createInheritedProperty(propertyType, propId, parent))
  }
  return newProps
}

class Block extends Mask {
  constructor(parent: Mask | Block, block?: ModelBlock, parentJSON?: ModelBlock, anchorProduct?: AnchorProduct) {
    super()
    if (block) {
      // create from importing model json
      this.id = block.id as number
      this.updatedAt = block.updatedAt
      this.updatedFormulaAt = block.updatedFormulaAt
      this.updatedHeaderAt = block.updatedHeaderAt
      this.updatedPropertyAt = block.updatedPropertyAt
      this.name = block.name
      this.description = block.description
      this.tags = block.tags
      this.copyType = block.copyType
      this.copySize = block.copySize
      this.copySizeFunctionLines = block.copySizeFunctionLines
      this.rebaseNeeded = block.rebaseNeeded
      this.runAfterRebaseFormula = block.runAfterRebaseFormula
      this.rebaseBaseFunctionLines = block.rebaseBaseFunctionLines
      this.initializeFormula = block.initializeFormula
      this.finalizeFormula = block.finalizeFormula
      this.definitions = block.definitions
      this.share = block.share
      this.static = block.static
      this.allowManualResize = block.allowManualResize
      this.slidingWindow = block.slidingWindow
      this.detailedChildren = block.detailedChildren ?? []
      this.productId = block.productId
      this.variables = normalizeInheritedProperties(PropertyType.variables, block, parent, parentJSON) as Record<string, Variable>
      this.series = normalizeInheritedProperties(PropertyType.series, block, parent, parentJSON) as Record<string, Series>
      this.links = normalizeInheritedProperties(PropertyType.links, block, parent, parentJSON) as Record<string, Link>
      this.methods = normalizeInheritedProperties(PropertyType.methods, block, parent, parentJSON) as Record<string, Method>
    } else {
      // create from UI when clicking "新建Block" or "新建子Block"
      this.id = 0
      this.name = anchorProduct ? parent.name + '_' + anchorProduct.id : ''
      for (const id in parent.variables) {
        this.variables[id] = createInheritedProperty(PropertyType.variables, id, parent, anchorProduct) as Variable
      }
      for (const id in parent.series) {
        this.series[id] = createInheritedProperty(PropertyType.series, id, parent, anchorProduct) as Series
      }
      for (const id in parent.links) {
        this.links[id] = createInheritedProperty(PropertyType.links, id, parent, anchorProduct) as Link
      }
      for (const id in parent.methods) {
        this.methods[id] = createInheritedProperty(PropertyType.methods, id, parent, anchorProduct) as Method
      }
    }
    if (anchorProduct) {
      this.productId = anchorProduct.id
    }
    this.isProductMask = block?.isProductMask ? block.isProductMask : anchorProduct ? 1 : 0
    this.workspaceId = parent.workspaceId
    this.parentId = parent.id
    this.detailedParent = parent
    this.modelId = parent.modelId

    parent.detailedChildren?.push(this)
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
    this.detailedChildren && this.detailedChildren.forEach(childBlock => {
      delete childBlock[propertyType][propertyId]
    })
  }

  updatePropertyForKey(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any, anchorProducts: AnchorProduct[]) {
    if (this[propertyType][propertyId].isDirect) {
      this.updateDirectPropertyForKey(propertyType, propertyId, fieldKey, newValue, anchorProducts)
    } else {
      this.updateNonDirectPropertyForKey(propertyType, propertyId, fieldKey, newValue, anchorProducts)
    }
  }

  createInheritedPropertyForDescendent(propertyType: PropertyType, propertyId: string) {
    this.detailedChildren && this.detailedChildren.forEach(childBlock => {
      childBlock[propertyType][propertyId] = createInheritedProperty(propertyType, propertyId, this)
    })
  }

  udpateIndexCodePropertyForDescendent(propertyType: PropertyType, propertyId: string, anchorProducts: AnchorProduct[]) {
    this.detailedChildren && this.detailedChildren.forEach(childBlock => {
      const propertyToUpdate = childBlock[propertyType][propertyId]
      const anchorProduct = anchorProducts.find((product:AnchorProduct) => product.id === childBlock.productId)
      if (anchorProduct) {
        const targetFormula = anchorProduct.getProductFormula(this[propertyType][propertyId].productFormulas)
        propertyToUpdate.calcFormula = targetFormula.formula
        propertyToUpdate.currentIndexExpress = targetFormula.codeIndexExpression
      }
    })
  }

  updateDirectPropertyForKey(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any, anchorProducts: AnchorProduct[]) {
    if (fieldKey === 'productFormulas') {
      this.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts)
    } else if (fieldKey === 'source') {
      if (newValue === 'codeIndex' || newValue === 'codeIndexFormula') {
        this.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts)
      }

      // else {
      //   this.updateDPDefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
      // }
    } else if (fieldKey === 'override' && newValue === false) {
      // when override is toggled to false, reset inherited property for descendent
      this.createInheritedPropertyForDescendent(propertyType, propertyId)
    } else if (!this[propertyType][propertyId].override) {
      // override is false, always update the inherited property of descendent
      this.updateDPUndefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
    } else {
      // override is true
      const definableFields = ['copyType', 'copySize', 'copyFormula', 'source', 'calcFormula', 'valueInput']
      if (definableFields.includes(fieldKey)) {
        this.updateDPDefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
      } else {
        this.updateDPUndefinableFieldsForDescendent(propertyType, propertyId, fieldKey, newValue)
      }
    }

    (this[propertyType][propertyId] as any)[fieldKey] = newValue
  }

  updateNonDirectPropertyForKey(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any, anchorProducts: AnchorProduct[]) {
    if (fieldKey === 'isDefining') {
      if (!newValue) {
        if (!this.detailedParent) return
        const parentProperty = this.detailedParent[propertyType][propertyId] as any
        const updatedProperty = {
          ...parentProperty,
          isDirect: false,
          isDefining: false,
          override: false,
          source: 'parent'
        }
        this[propertyType][propertyId] = updatedProperty
        this.detailedChildren && this.detailedChildren.forEach(childBlock => {
          childBlock[propertyType][propertyId] = {
            ...updatedProperty,
            isDirect: false,
            isDefining: false,
            override: false,
            source: 'parent'
          }
        })
      } else {
        if (!this.detailedParent) return
        const parentPropert = this.detailedParent[propertyType][propertyId] as any
        if (parentPropert) {
          if (parentPropert.source === 'toDefine' || parentPropert.source === 'parent') {
            (this[propertyType][propertyId] as any).source = 'calculated'
          } else {
            (this[propertyType][propertyId] as any).source = parentPropert.source
          }
        }
      }
    } else if (fieldKey === 'productFormulas') {
      this.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts)
    } else if (fieldKey === 'source') {
      if (newValue === 'codeIndex') this.udpateIndexCodePropertyForDescendent(propertyType, propertyId, anchorProducts)
    } else {
      // fieldKey must be one of the ['copyType', 'copySize', 'copyFormula', 'source', 'calcFormula', 'valueInput']
      this.detailedChildren && this.detailedChildren.forEach(childBlock => {
        // @ts-ignore
        !childBlock[propertyType][propertyId].isDefining && (childBlock[propertyType][propertyId][fieldKey] = newValue)
      })
    }
    (this[propertyType][propertyId] as any)[fieldKey] = newValue
  }

  /**
  * Update Undefinable Fields Of Direct Property For Descendent
  */
  updateDPUndefinableFieldsForDescendent(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any) {
    this.detailedChildren && this.detailedChildren.forEach((block: any) => {
      block[propertyType][propertyId][fieldKey] = newValue
    })
  }

  /**
  * When block property's override is true, update definable Fields Of Direct Property For Descendent
  */
  updateDPDefinableFieldsForDescendent(propertyType: PropertyType, propertyId: string, fieldKey: string, newValue: any) {
    this.detailedChildren && this.detailedChildren.forEach((block: Block) => {
      // @ts-ignore
      !block[propertyType][propertyId].isDefining && (block[propertyType][propertyId][fieldKey] = newValue)
    })
  }
}
export default Block
