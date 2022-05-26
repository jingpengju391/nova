import { ref, reactive } from 'vue'
import { fromData } from '@shared/PrivateDeployment'
export const visible = ref(false)

export const formData: fromData[] = [
  {
    label: 'url',
    ref: 'url',
    Val: '',
    type: 'input',
    required: true
  },
  {
    label: 'username',
    ref: 'username',
    Val: '',
    type: 'input',
    required: true
  },
  {
    label: 'email',
    ref: 'email',
    Val: '',
    type: 'input',
    required: true
  }
]

export const form = reactive({})

export const handleVisible = (done:boolean) => {
  visible.value = done
}
