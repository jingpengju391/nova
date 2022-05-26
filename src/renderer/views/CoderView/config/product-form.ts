import modelsDataSource from '@/store/modules/modelsDataSource'
import { computed } from 'vue'
export const productFormData = computed(() => {
  return [
    {
      label: 'Name',
      ref: 'name',
      Val: '',
      type: 'input',
      required: true,
      rules: []
    },
    {
      label: 'Model',
      ref: 'modelId',
      Val: '',
      type: 'select',
      required: true,
      rules: [],
      options: (() => {
        return modelsDataSource.getAllModels().map(model => {
          return {
            value: model.id,
            label: model.name
          }
        })
      })()
    }
  ]
})
