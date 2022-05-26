import { reactive } from 'vue'
import { ProductInterface } from '@shared/dataModelTypes/product/products'

export const loadData = reactive<ProductInterface[]>([])
