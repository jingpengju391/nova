import { ref, computed, reactive } from 'vue'
export const dialogVisible = ref(false)
export const loading = ref(false)
export const handleClose = () => {
  dialogVisible.value = false
}

export const productFormulas:any = reactive({
  codeIndexExpression: '',
  formula: '',
  name: '',
  classify: ''
})

export const handleProductFormulas = (pf?:any) => {
  if (pf) {
    Object.keys(pf).forEach(key => (productFormulas[key] = pf[key]))
  } else {
    Object.keys(productFormulas).forEach(key => (productFormulas[key] = ''))
  }
}

export const indicatorFormData = computed(() => {
  return [
    {
      label: 'Name',
      ref: 'name',
      Val: '',
      type: 'input',
      required: true,
      rules: []
    }
    // {
    //   label: 'classify',
    //   ref: 'classify',
    //   Val: '',
    //   type: 'select',
    //   required: true,
    //   rules: [],
    //   options: [
    //     {
    //       label: 'classify1',
    //       value: 1
    //     },
    //     {
    //       label: 'classify2',
    //       value: 2
    //     }
    //   ]
    // }
  ]
})
