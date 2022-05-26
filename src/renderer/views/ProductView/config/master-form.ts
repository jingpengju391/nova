import masterDataSource from '@/store/modules/masterDataSource'
import { computed } from 'vue'
import { getModelNavigationNodeIdAndType } from '@/utils'
import { saveNewMasterToDb, isShowMasterDialog, getClassliesByModelId, handleNewProductDefault } from '../config'
import store from '@/store'
import { AnchorProduct } from '@shared/dataModelTypes/product/products'
export const masterFormData = computed(() => {
  return [
    {
      label: 'Name',
      ref: 'name',
      Val: '',
      type: 'input',
      required: true,
      rules: [
        { pattern: /[_\w]*$/, message: '只允许包含下划线或字母或数字' },
        { pattern: /^[A-z]/, message: '首字母只允许是字母' },
        { validator: duplicatedMasterNameValidator, trigger: 'change' },
        { validator: keywordsValidator, trigger: 'change' }
      ],
      change: (form:AnchorProduct, validateFn:any) => !isShowMasterDialog.value && !validateFn(saveNewMasterToDb(form))
    },
    {
      label: 'Description',
      ref: 'description',
      Val: '',
      type: 'input',
      required: false,
      inputType: 'textarea',
      rules: [],
      change: (form:AnchorProduct, validateFn:any) => !isShowMasterDialog.value && !validateFn(saveNewMasterToDb(form))
    },
    {
      label: 'Model',
      ref: 'modelId',
      Val: '',
      type: 'select',
      required: true,
      rules: [],
      change: async (form:AnchorProduct, validateFn:any) => {
        if (!isShowMasterDialog.value) {
          saveNewMasterToDb(form)
        } else {
          getClassliesByModelId(form.modelId)
          await store.dispatch('masters/queryCodeIndexesByModelIdFromDB', form.modelId)
          handleNewProductDefault()
        }
      },
      options: computed(() => {
        return store.state.models.modelNavigationTree.map(model => {
          return {
            value: getModelNavigationNodeIdAndType(model.id).id,
            label: model.name
          }
        })
      })
    }
  ]
})

function duplicatedMasterNameValidator(rule: any, newName: string, callback: (...args: any[]) => void) {
  const currentMasterNode = store.state.masters.currentMasterNode
  if (!currentMasterNode) return
  const { id } = getModelNavigationNodeIdAndType(currentMasterNode.id)
  masterDataSource.validateNewMasterName(rule, id, newName, callback)
}

function keywordsValidator(rule: any, newName: string, callback: any) {
  if (isCppKeywords(newName)) {
    callback(new Error('不允许包含C++关键字'))
  } else {
    callback()
  }
}

export function isCppKeywords(value: string):boolean {
  const list:string[] = []
  return list.indexOf(value) !== -1
}
