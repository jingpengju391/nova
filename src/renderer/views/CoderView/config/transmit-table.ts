import { reactive, computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'
import { TransmitColumn, TransmitData, TransmitOptions } from '@shared/dataModelTypes/models/helpers'
import type { SimplifiedModelBlock, Property, SimplifiedProperty, ModelBlock, Variable } from '@shared/dataModelTypes'
import modelsDataSource from '@/store/modules/modelsDataSource'
import store from '@/store'
import { v4 as uuid } from 'uuid'
const tableColumn = reactive<TransmitColumn[]>([
  {
    type: 'selection',
    hideOverflowTooltip: true
  },
  {
    prop: 'label',
    label: '目标变量',
    minWidth: '100px'
  },
  {
    prop: 'type',
    label: '取值方式',
    minWidth: '100px'
  },
  {
    prop: 'value',
    label: '目标取值',
    minWidth: '100px'
  }
])

let multipleSelection: string[] = []

const handleSelectionChange = (sections: TransmitData[]) => {
  multipleSelection = sections.map(section => section.id)
}

const tableData = computed<TransmitData[]>(() => {
  const currentProperty: Property = store.state.models.currentProperty
  return currentProperty?.transmit || []
})

const options = computed<TransmitOptions | any>(() => {
  const currentProperty: Property = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode as SimplifiedModelBlock
  return {
    type: [
      {
        label: '常数',
        value: 1
      },
      {
        label: '变量',
        value: 2
      }
    ],
    label: getTargetVariables(currentProperty, currentModelNode),
    value: getCurrentVariables(currentModelNode)
  }
})

function getCurrentVariables(currentModelNode: SimplifiedModelBlock) {
  const currentVariable = currentModelNode.variables
  return currentVariable.map((variable: SimplifiedProperty) => {
    return {
      value: variable.id,
      label: variable.name,
      type: variable.valueType
    }
  })
}

function getTargetVariables(currentProperty: Property | undefined, currentModelNode: SimplifiedModelBlock) {
  if (!currentProperty || !currentModelNode) return
  const allModelBlocks = modelsDataSource.getAllModelBlocksForAModel(currentModelNode.modelId as number)
  const modelBlockNameMap = allModelBlocks.reduce((acc, cur) => {
    acc.set(cur.name, cur)
    return acc
  }, new Map<string, ModelBlock>())
  // console.log(allModelBlocks, modelBlockNameMap, 2323232323)
  const newModelBlock = modelBlockNameMap.get(currentProperty.target.maskName)!

  const variables = Array.from(Object.values(newModelBlock.variables))
  // console.log(variables, 'variables122111111111111111')
  return variables.map((property: Variable) => {
    return {
      value: property.id,
      label: property.name,
      type: property.type
    }
  })
}

function addTransmit() {
  const currentProperty: Property = store.state.models.currentProperty

  const transmit = currentProperty.transmit || []
  currentProperty.transmit = [...transmit, {
    label: '',
    type: 1,
    value: '',
    id: uuid()
  }]
}

function deleteTransmit(id?: string) {
  if (!id && !multipleSelection.length) {
    ElMessage.warning('请选择要删除的传递视图！')
    return
  }
  ElMessageBox.alert('是否删除所选中传递参数?', '提示', {
    confirmButtonText: '确 定',
    cancelButtonText: '取 消',
    showCancelButton: true
  }).then(() => {
    onSubmitTransmit(id)
  }).catch((action: Action) => {
    ElMessage({
      type: 'info',
      message: `action: ${action}`
    })
  })
}

function onSubmitTransmit(id?: string) {
  const currentProperty: Property = store.state.models.currentProperty
  const deleteIds: string[] = id ? [id] : multipleSelection
  const transmit = currentProperty.transmit.filter((transmit: TransmitData) => !deleteIds.includes(transmit.id))
  currentProperty.transmit = transmit
  multipleSelection.length = 0
}

export { tableData, tableColumn, options, getCurrentVariables, getTargetVariables, addTransmit, deleteTransmit, multipleSelection, handleSelectionChange }
