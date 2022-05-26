import masterDataSource from '@/store/modules/masterDataSource'
import { ElMessage } from 'element-plus'
import { UnsavedProductExistsError } from '@/errors'
import { getMasterNavigationNodeIdAndType } from '@/utils'
import store from '@/store'
import { Product, CreaterProductDefaultIdentification, SimplifiedProduct } from '@shared/dataModelTypes/product/products'
import { v4 as uuid } from 'uuid'
export async function addNewProduct(master:SimplifiedProduct) {
  try {
    await selectUnsavedNewProductNodeIfExists()
    const { id } = getMasterNavigationNodeIdAndType(master.id)
    const temporaryProduct = new Product({ masterId: id })
    masterDataSource.setTemporaryProduct(id, temporaryProduct)
    store.commit('masters/updateCurrentMasterNode', temporaryProduct)
  } catch (error:any) {
    if (error instanceof UnsavedProductExistsError) {
      ElMessage({
        message: '当前存在新建的未保存product，请先设置该product！',
        type: 'warning'
      })
    } else {
      console.log(error)
    }
  }
}

function selectUnsavedNewProductNodeIfExists(): Promise<void> {
  const unsavedProduct = masterDataSource.getTemporaryProduct()
  return new Promise((resolve, reject) => {
    if (unsavedProduct) {
      reject(new UnsavedProductExistsError(unsavedProduct.name))
    } else {
      resolve()
    }
  })
}

export function clearTemporaryProductData() {
  masterDataSource.clearTemporaryProduct()
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode) return
  currentMasterNode.id === CreaterProductDefaultIdentification.defaultId &&
  store.commit('masters/updateCurrentMasterNode', undefined)
}

export async function saveNewProductToDb(newProductForm:Product) {
  const id = newProductForm.id === CreaterProductDefaultIdentification.defaultId ? uuid() : newProductForm.id
  const newProduct = new Product({
    ...newProductForm,
    id,
    masterId: newProductForm.masterId || masterDataSource.getTemporaryProduct().masterId
  })
  masterDataSource.clearTemporaryProduct()
  const completeMaster = masterDataSource.getCompleteMaster(newProduct.masterId)
  completeMaster.products[newProduct.id] = newProduct
  const result = await store.dispatch('masters/updateMasterFromDB', completeMaster)
  return new Promise((resolve, reject) => { resolve(result) })
}

export async function deleteProduct(product: string) {
  const completeProduct = masterDataSource.getCompleteProduct(product)!
  masterDataSource.deleteProductById(product, completeProduct.masterId)
  const completeMaster = masterDataSource.getCompleteMaster(completeProduct.masterId)
  await store.dispatch('masters/updateMasterFromDB', completeMaster)
}

export async function copyProduct(productId: string, product:Product) {
  const id = uuid()
  const completeProduct = masterDataSource.getCompleteProduct(productId)!
  const copyMaterName = masterDataSource.generateCopyProductName(completeProduct.masterId, productId, product.name)
  const newProduct = new Product({
    ...completeProduct,
    id,
    name: copyMaterName
  })
  const completeMaster = masterDataSource.getCompleteMaster(newProduct.masterId)
  completeMaster.products[newProduct.id] = newProduct
  await store.dispatch('masters/updateMasterFromDB', completeMaster)
}
