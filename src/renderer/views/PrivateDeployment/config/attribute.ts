import { computed, ref } from 'vue'
import store from '@/store'
import modelsDataSource from '@/store/modules/modelsDataSource'
import { ModelBlockType } from '@shared/dataModelTypes/models/masks'
import { SeriesSource, LinkSource, PropertyType, VariableSource, MethodSource, VariableType } from '@shared/dataModelTypes/models/helpers'
import { getPropertyType, getModelNodeType, ModelNodeType, getModelNavigationNodeIdAndType } from '@/utils'
import { dataInputBlockIDDelimiter } from '@shared/dataModelTypes/dataInputs'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import { Property, ModelNavigationTree } from '@shared/dataModelTypes'

interface TargetOptionItem {
  id: number // this is the mask actual db id
  type: string,
  maskName: string,
  blockName: string
}
export const diffTabs = [
  {
    value: '0',
    label: 'code',
    checks: [
      'copySizeFunctionLines', 'initializeFormula', 'finalizeFormula',
      'runAfterRebaseFormula', 'rebaseBaseFunctionLines', 'calcFormula',
      'copyFormula'
    ],
    ignore: ['isUpdateIdKey']
  },
  {
    value: '1',
    label: 'attribute',
    checks: ['copyType'],
    ignore: ['isUpdateIdKey']
  }
]

export const activeName = ref('')

export const rebaseTypeOptions = computed(() => {
  return [
    {
      label: '无',
      value: 0
    },
    {
      label: '重置',
      value: 1
    }
  ]
})

export const rebaseSeriesTypeOptions = computed(() => {
  return [
    {
      label: '无',
      value: 0
    },
    {
      label: '重置时点下期',
      value: 1
    },
    {
      label: '重置时点当期',
      value: 2
    },
    {
      label: '重置所有时点',
      value: 3
    }
  ]
})

export const typeOptions = computed(() => {
  return Object.values(VariableType).map(type => {
    if (type === 'integer') {
      return { label: '整数', value: type }
    }
    if (type === 'double') {
      return { label: '浮点数', value: type }
    }
    if (type === 'string') {
      return { label: '字符', value: type }
    }
    if (type === 'table') {
      return { label: '表格', value: type }
    }
    return { label: type, value: type }
  })
})

export const isOverrideVisible = computed(() => {
  const currentModelNode = store.state.models.currentModelNode!
  return modelsDataSource.getModelBlockType(currentModelNode.id) !== ModelBlockType.childBlocks
})

export const sourceOptions = computed(() => {
  const currentProperty:Property | any = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode!
  let sourceEnum: typeof VariableSource | typeof SeriesSource | typeof LinkSource
  const propertyType = getPropertyType(currentProperty)
  if (propertyType === PropertyType.variables) {
    sourceEnum = VariableSource as any
  } else if (propertyType === PropertyType.series) {
    sourceEnum = SeriesSource as any
  } else if (propertyType === PropertyType.links) {
    sourceEnum = LinkSource as any
  } else {
    sourceEnum = MethodSource as any
  }

  const modelBlockType = modelsDataSource.getModelBlockType(currentModelNode.id)
  const options = Object.values(sourceEnum)
    .filter(type => {
      if (modelBlockType === ModelBlockType.masks) {
        return type !== sourceEnum.parent
      } else {
        const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
        const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId!)
        const parentProperty = parentModelBlock[propertyType][currentProperty.id] as any
        if (parentProperty && parentProperty.source === 'toDefine') {
          return type !== sourceEnum.toDefine && type !== sourceEnum.parent
        } else if (parentProperty && currentProperty.isDefining) {
          return type !== sourceEnum.toDefine && type !== sourceEnum.parent
        } else if (parentProperty) {
          return type !== sourceEnum.toDefine
        } else {
          return type !== sourceEnum.toDefine && type !== sourceEnum.parent
        }
      }
    })
    .map(type => {
      if (type === 'calculated') {
        return { label: '公式', value: type }
      }
      if (type === 'parent') {
        return { label: '父级', value: type }
      }
      if (type === 'toDefine') {
        return { label: '空白', value: type }
      }
      if (type === 'default') {
        return { label: '默认', value: type }
      }
      if (type === 'transmit') {
        return { label: '传递', value: type }
      }
      if (type === 'data') {
        return { label: '数据', value: type }
      }
      if (type === 'assumption') {
        return { label: '假设', value: type }
      }
      return { label: type, value: type }
    })

  return options
})

export const isValueInputVisible = computed(() => {
  const currentProperty:Property | any = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode!
  if (currentProperty.source === 'parent') {
    const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
    const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId!)
    const propertyType = getPropertyType(currentProperty)
    const parentProperty = parentModelBlock[propertyType][currentProperty.id] as any
    if (parentProperty.source === 'parent') {
      const mask = modelsDataSource.getCompleteModelBlock(parentModelBlock.parentId!)!
      const maskProperty = mask[propertyType][currentProperty.id] as any
      return maskProperty.source === 'default' || maskProperty.source === 'assumption'
    }
    return parentProperty.source === 'default' || parentProperty.source === 'assumption'
  } else {
    return currentProperty.source === 'default' || currentProperty.source === 'assumption'
  }
})

export const isCalcFormulaVisible = computed(() => {
  const currentProperty:Property | any = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode!
  if (currentProperty.source === 'parent') {
    const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
    const parentModelBlock = modelsDataSource.getCompleteModelBlock(completeModelBlock.parentId!)
    const propertyType = getPropertyType(currentProperty)
    const parentProperty = parentModelBlock[propertyType][currentProperty.id] as any
    if (parentProperty && parentProperty.source === 'parent') {
      const mask = modelsDataSource.getCompleteModelBlock(parentModelBlock.parentId!)!
      const maskProperty = mask[propertyType][currentProperty.id] as any
      return maskProperty.source === 'calculated'
    } else if (parentProperty) {
      return parentProperty.source === 'calculated'
    }
    return currentProperty.source === 'calculated'
  } else {
    return currentProperty.source === 'calculated'
  }
})

export const currentClassIfy = computed(() => {
  const currentProperty:Property | any = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode!
  const classifyList = store.state.models.classifyList
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
  const resultClassIfy = classifyList.filter((item: any) => {
    return item.modelId === completeModelBlock.modelId
  })
  const newResultClassify = resultClassIfy.filter((item: any) => {
    return item.name === currentProperty.classify
  })
  if (newResultClassify.length === 0) {
    currentProperty.classify = ''
  }
  return resultClassIfy
})

export const groupSeparatorOptions = computed(() => {
  const currentModelNode = store.state.models.currentModelNode
  const dataMappingItems = modelsDataSource.getDataMappingItemsForABlock(currentModelNode!.id)
  return dataMappingItems.map(item => {
    return { label: item.name, value: item.blockId + dataInputBlockIDDelimiter + item.name }
  })
})

export const targetOptions = computed(() => {
  const currentModelNode = store.state.models.currentModelNode
  const modelNavigationTree = store.state.models.modelNavigationTree
  if (!currentModelNode || getModelNodeType(currentModelNode) === ModelNodeType.models) {
    return []
  }
  const completeModelBlock = modelsDataSource.getCompleteModelBlock(currentModelNode.id)
  const ancestorModelId = ModelNodeType.models + NaviNodeIdDelimiter + completeModelBlock.modelId
  const targetOptions = [] as TargetOptionItem[];
  (modelNavigationTree as ModelNavigationTree)
    .filter(node => node.id === ancestorModelId)
    .forEach(modelNaviNode => {
      modelNaviNode.children.forEach(maskNaviNode => {
        const option: TargetOptionItem = {
          id: getModelNavigationNodeIdAndType(maskNaviNode.id).id,
          type: 'mask',
          maskName: maskNaviNode.name,
          blockName: ''
        }
        targetOptions.push(option)
      })
    })
  return targetOptions
})

export const currentDiffKey = computed(() => {
  const original = store.state.models.currentFormulaItem?.original
  if (!original) return
  const K = original[0].split(' ')
  return K[K.length - 1]
})

export const currentProperty = computed(() => {
  const currentProperty = store.state.models.currentProperty
  const original = store.state.models.currentFormulaItem?.original
  if (!original) return currentProperty
  const K = original[0].split(' ')
  return {
    ...currentProperty,
    [K[K.length - 1]]: original[2]
  }
})

export const currentModelNode = computed(() => {
  const currentModelNode = store.state.models.currentModelNode
  const original = store.state.models.currentFormulaItem?.original
  if (!original) return currentModelNode
  const K = original[0].split(' ')
  return {
    ...currentModelNode,
    [K[K.length - 1]]: original[2]
  }
})
