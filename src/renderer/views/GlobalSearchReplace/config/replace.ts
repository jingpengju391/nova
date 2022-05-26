import store from '@/store'
import { someContentToFind } from '../config'
import { getPropertyType, getModelNodeType } from '@/utils'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import eventBus, { setCodeEditorValue } from '@/views/CoderView/eventBus'

export async function replaceAll() {
  await store.dispatch('globalSearchReplace/updatePublicitysWithDBSync')
  someContentToFind()
  store.commit('globalSearchReplace/updateReplaceValue', '')
  const currentProperty = store.state.models.currentProperty
  const currentModelNode = store.state.models.currentModelNode
  if (currentProperty) {
    store.commit('models/updateCurrentProperty', {
      id: currentProperty.id,
      name: currentProperty.name,
      type: getPropertyType(currentProperty)
    })
  } else if (currentModelNode) {
    store.commit('models/updateCurrentModelNodeWithModelNaviNode', {
      id: getModelNodeType(currentModelNode) + NaviNodeIdDelimiter + currentModelNode.id,
      name: currentModelNode.name
    })
  }
  const currentFormulaItem = store.state.models.currentFormulaItem
  if (currentFormulaItem) {
    const newValue = currentFormulaItem.content
    eventBus.emit(setCodeEditorValue, newValue)
  }
}
