import {
  AnchorProduct, Product, CreaterProductDefaultIdentification, CreaterMasterDefaultIdentification,
  SimplifiedProduct
} from '@shared/dataModelTypes/product/products'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { MasterNodeType } from '@/utils'
import { parseStringPostfixNumber } from './utils'
import modelsDataSource from './modelsDataSource'
export class MastersDataSource {
  #masterMap = new Map<number, AnchorProduct>()

  addNewEntriesToMasterMap(newEntries: AnchorProduct[]) {
    newEntries.forEach(entry => this.#masterMap.set(<number>entry.id, entry))
  }

  getTemporaryMaster() {
    return this.#masterMap.get(CreaterMasterDefaultIdentification.defaultId)
  }

  getTemporaryProduct() {
    let allProduct:any = {}
    this.#masterMap.forEach(master => {
      allProduct = { ...allProduct, ...master.products }
    })
    return allProduct[CreaterProductDefaultIdentification.defaultId]
  }

  getSimplifiedMasterForViewByMasterId(id: number): SimplifiedProduct {
    const master = this.#masterMap.get(id)!
    const products:Product[] = master.products ? Object.values(master.products) : []
    if (!master.modelId) {
      return {
        id: `${MasterNodeType.master}${NaviNodeIdDelimiter}${master.id}`,
        name: master.name
      }
    }
    const completeModel = modelsDataSource.getCompleteModel(master.modelId)
    return {
      id: `${MasterNodeType.master}${NaviNodeIdDelimiter}${master.id}`,
      name: master.name,
      nodeKey: `${MasterNodeType.master}${NaviNodeIdDelimiter}${master.id}`,
      children: [
        {
          id: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id,
          name: `${MasterNodeType.models}( ${completeModel.name} )`,
          masterId: master.id,
          nodeKey: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id + NaviNodeIdDelimiter + master.id
        },
        {
          id: MasterNodeType.codeIndex + NaviNodeIdDelimiter + 0,
          nodeKey: MasterNodeType.codeIndex + NaviNodeIdDelimiter + 0,
          name: MasterNodeType.codeIndex,
          masterId: master.id,
          children: Object.keys(master.codeIndexes).map(key => {
            return {
              id: MasterNodeType.codeIndex + NaviNodeIdDelimiter + key,
              nodeKey: MasterNodeType.codeIndex + NaviNodeIdDelimiter + key,
              name: master.codeIndexes[key].name,
              masterId: master.id,
              modelId: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id,
              value: master.codeIndexes[key].value
            }
          }).filter(codeIndex => codeIndex.value)
        },
        {
          id: MasterNodeType.product + NaviNodeIdDelimiter + 0,
          nodeKey: MasterNodeType.product + NaviNodeIdDelimiter + 0,
          name: MasterNodeType.product,
          masterId: master.id,
          children: products.map(product => {
            return {
              name: product.name,
              openTime: product.openTime,
              id: product.id,
              nodeKey: product.id,
              masterId: master.id,
              modelId: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id
            }
          })
        }
      ]
    }
  }

  getSimplifiedProductForViewByMasterIdAndProductId(masterId:number, productId:string) {
    const product = this.#masterMap.get(masterId)!.products[productId]!
    return {
      id: product.id,
      name: product.name
    }
  }

  getSimplifiedMasterForView(): SimplifiedProduct[] {
    const simplifiedMasters = []
    const iterator = this.#masterMap.values()
    let { value } = iterator.next()
    while (value) {
      const products:Product[] = value.products ? Object.values(value.products) : []
      const completeModel = modelsDataSource.getCompleteModel(value.modelId)
      simplifiedMasters.push({
        id: `${MasterNodeType.master}${NaviNodeIdDelimiter}${value.id}`,
        name: value.name,
        openTime: value.openTime,
        nodeKey: `${MasterNodeType.master}${NaviNodeIdDelimiter}${value.id}`,
        children: [
          {
            id: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id,
            name: `${MasterNodeType.models}( ${completeModel.name} )`,
            masterId: value.id,
            nodeKey: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id + NaviNodeIdDelimiter + value.id
          },
          {
            id: MasterNodeType.codeIndex + NaviNodeIdDelimiter + 0,
            name: MasterNodeType.codeIndex,
            masterId: value.id,
            nodeKey: MasterNodeType.codeIndex + NaviNodeIdDelimiter + 0,
            children: Object.keys(value.codeIndexes).map(key => {
              return {
                id: MasterNodeType.codeIndex + NaviNodeIdDelimiter + key,
                nodeKey: MasterNodeType.codeIndex + NaviNodeIdDelimiter + key,
                name: value.codeIndexes[key].name,
                masterId: value.id,
                modelId: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id,
                value: value.codeIndexes[key].value
              }
            }).filter(codeIndex => codeIndex.value)
          },
          {
            id: MasterNodeType.product + NaviNodeIdDelimiter + 0,
            nodeKey: MasterNodeType.product + NaviNodeIdDelimiter + 0,
            name: MasterNodeType.product,
            masterId: value.id,
            children: products.map(product => {
              return {
                name: product.name,
                openTime: product.openTime,
                id: product.id,
                nodeKey: product.id,
                masterId: value.id,
                modelId: MasterNodeType.models + NaviNodeIdDelimiter + completeModel.id
              }
            })
          }
        ]
      })
      const newResult = iterator.next()
      value = newResult.value
    }
    return simplifiedMasters
  }

  getCompleteMaster(id: number): AnchorProduct {
    return this.#masterMap.get(id)!
  }

  getCompleteMastersByModelId(modelId:number): AnchorProduct[] {
    const masters:AnchorProduct[] = []
    this.#masterMap.forEach(master => {
      if (master.modelId === modelId) {
        masters.push(master)
      }
    })
    return masters
  }

  getAllCompleteMaster() {
    return Array.from(this.#masterMap.values())
  }

  getCompleteProduct(productId:string):Product | undefined {
    const iterator = this.#masterMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      if (value?.products[productId]) {
        return value.products[productId]
      }
      const newResult = iterator.next()
      value = newResult.value
      done = newResult.done
    }
  }

  getSimplifiedProductForView(productId: string): SimplifiedProduct | undefined {
    const iterator = this.#masterMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      if (value?.products[productId]) {
        return {
          id: value.products[productId].id,
          name: value.products[productId].name,
          masterId: value.products[productId].masterId,
          modelId: MasterNodeType.models + NaviNodeIdDelimiter + value.modelId,
          openTime: value.products[productId].openTime,
          nodeKey: value.products[productId].id
        }
      }
      const newResult = iterator.next()
      value = newResult.value
      done = newResult.done
    }
  }

  addNewSingularToMasterMap(master: AnchorProduct) {
    this.#masterMap.set(master.id, master)
  }

  setTemporaryMaster(master: AnchorProduct) {
    if (master.id !== CreaterMasterDefaultIdentification.defaultId) return
    this.#masterMap.set(CreaterMasterDefaultIdentification.defaultId, master)
  }

  setTemporaryProduct(masterId:number, product: Product) {
    if (product.id !== CreaterProductDefaultIdentification.defaultId) return
    const completeMaster = this.#masterMap.get(masterId)
    if (!completeMaster) return
    completeMaster.products = { ...completeMaster.products, [product.id]: product }
    this.#masterMap.set(<number>masterId, completeMaster)
  }

  clearTemporaryMaster() {
    this.#masterMap.delete(CreaterMasterDefaultIdentification.defaultId)
  }

  clearTemporaryProduct() {
    this.#masterMap.forEach(master => {
      if (master.products) {
        delete master.products[CreaterProductDefaultIdentification.defaultId]
        this.#masterMap.set(<number>master.id, master)
      }
    })
  }

  deleteMasterById(masterId:number) {
    this.#masterMap.delete(masterId)
  }

  deleteProductById(productId:string, masterId?:number) {
    if (masterId) {
      const master = this.#masterMap.get(masterId)!
      const product = master.products!
      delete product[productId]
      master.products = product
      this.#masterMap.set(<number>master.id, master)
    } else {
      this.#masterMap.forEach(master => master.products[productId] && delete master.products[productId])
    }
  }

  validateNewMasterName(rule: any, masterId: number, newName: string, callback: (...args: any[]) => void) {
    const checkResult = this.checkNewMasterName(masterId, newName)
    if (checkResult > 0) {
      callback(new Error('与其他变量master重名'))
    }
    callback()
  }

  validateNewProductName(rule: any, masterId: number, productId:string, newName: string, callback: (...args: any[]) => void) {
    const checkResult = this.checkNewProductName(masterId, productId, newName)
    if (checkResult > 0) {
      callback(new Error('与其他变量master重名'))
    }
    callback()
  }

  checkNewMasterName(masterId: number, newName: string): number {
    try {
      this.#masterMap.forEach(master => {
        if (master.name === newName && master.id !== masterId) {
          throw new Error('master duplicate')
        }
      })
    } catch (e) {
      return 1
    }
    return 0
  }

  checkNewProductName(masterId: number, productId:string, newName: string) {
    const master = this.#masterMap.get(masterId)
    if (!master || !master.products) return 0
    const products = Object.values(master.products)
    if (!products.length) return 0
    try {
      products.forEach(product => {
        if (product.name === newName && product.id !== productId) {
          throw new Error('master duplicate')
        }
      })
    } catch (e) {
      return 1
    }
    return 0
  }

  updatedCompleteMaster(master: Partial<AnchorProduct>) {
    if (!master.id && master.id !== 0) return
    const newMaster = this.#masterMap.get(master.id)
    Object.keys(master).forEach(key => {
      if (key !== 'id') {
        // @ts-ignore
        newMaster[key] = master[key]
      }
    })
    newMaster?.updateCodeIndexForEval()
  }

  updatedMasterOpenTimeByMasterId(masterId: number, time:number) {
    const newMaster = this.#masterMap.get(masterId)
    if (newMaster) newMaster.openTime = time
  }

  generateCopyMasterName(masterId: number, masterName: string): string {
    let newMasterName = masterName
    const numberPostfix = parseStringPostfixNumber(newMasterName)
    const nameLen = masterName.length
    let postfixNumber = 1
    let namePrefix = ''
    if (nameLen === numberPostfix) {
      postfixNumber = 1
      namePrefix = masterName
    } else {
      postfixNumber = parseInt(masterName.substring(numberPostfix, nameLen)) + 1
      namePrefix = masterName.substring(0, numberPostfix)
    }
    newMasterName = namePrefix + postfixNumber.toString()
    while (!this.checkDoubleNewMasterName(masterId, newMasterName)) {
      ++postfixNumber
      newMasterName = namePrefix + postfixNumber.toString()
    }
    return newMasterName
  }

  generateCopyProductName(masterId: number, productId:string, productName: string): string {
    let newProductName = productName
    const numberPostfix = parseStringPostfixNumber(newProductName)
    const nameLen = productName.length
    let postfixNumber = 1
    let namePrefix = ''
    if (nameLen === numberPostfix) {
      postfixNumber = 1
      namePrefix = productName
    } else {
      postfixNumber = parseInt(productName.substring(numberPostfix, nameLen)) + 1
      namePrefix = productName.substring(0, numberPostfix)
    }
    newProductName = namePrefix + postfixNumber.toString()
    while (!this.checkDoubleNewProductName(masterId, productId, newProductName)) {
      ++postfixNumber
      newProductName = namePrefix + postfixNumber.toString()
    }
    return newProductName
  }

  checkDoubleNewMasterName(masterId: number, newName: string): boolean {
    const iterator = this.#masterMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      if (value.name === newName && value.id !== masterId) {
        return false
      }
      const newResult = iterator.next()
      value = newResult.value
      done = newResult.done
    }
    return true
  }

  checkDoubleNewProductName(masterId: number, productId:string, newName: string): boolean {
    const productMap = new Map()
    const master = this.#masterMap.get(masterId)!
    const products = Object.values(master.products)
    products.forEach(product => {
      productMap.set(<string>product.id, product)
    })
    const iterator = productMap.values()
    let { value, done } = iterator.next()
    while (!done) {
      if (value.name === newName && value.id !== productId) {
        return false
      }
      const newResult = iterator.next()
      value = newResult.value
      done = newResult.done
    }
    return true
  }
}

export default new MastersDataSource()
