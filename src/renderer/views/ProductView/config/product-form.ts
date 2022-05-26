import { isCppKeywords, isShowProductDialog, saveNewProductToDb } from '../config'
import masterDataSource from '@/store/modules/masterDataSource'
import store from '@/store'
import { Product } from '@shared/dataModelTypes/product/products'

export const productFormData = [
  {
    label: 'Name',
    ref: 'name',
    Val: '',
    type: 'input',
    required: true,
    rules: [
      { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
      { pattern: /^[A-z]/, message: '首字母只允许是字母' },
      { validator: duplicatedProductNameValidator, trigger: 'change' },
      { validator: keywordsValidator, trigger: 'change' }
    ],
    change: (form:Product, validateFn:any) => !isShowProductDialog.value && !validateFn(saveNewProductToDb(form))
  },
  {
    label: 'Description',
    ref: 'description',
    Val: '',
    type: 'input',
    inputType: 'textarea',
    required: false,
    rules: [],
    change: (form:Product, validateFn:any) => !isShowProductDialog.value && !validateFn(saveNewProductToDb(form))
  }
]

function duplicatedProductNameValidator(rule: any, newName: string, callback: (...args: any[]) => void) {
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode) return
  const completeProduct = masterDataSource.getCompleteProduct(currentMasterNode.id)!
  if (!completeProduct?.masterId) return
  masterDataSource.validateNewProductName(rule, completeProduct.masterId, completeProduct.id, newName, callback)
}

function keywordsValidator(rule: any, newName: string, callback: any) {
  if (isCppKeywords(newName)) {
    callback(new Error('不允许包含C++关键字'))
  } else {
    callback()
  }
}
