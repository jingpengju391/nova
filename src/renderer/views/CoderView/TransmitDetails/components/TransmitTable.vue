<template>
  <el-table
    :data="tableData"
    border
    row-key="id"
    style="width: 100%"
    @selection-change="handleSelectionChange"
    @row-contextmenu="rightClickTransmit"
  >
    <el-table-column
      v-for="column in tableColumn"
      :key="column.prop"
      :prop="column.prop"
      :label="column.label"
      :min-width="column.minWidth"
      :type="column.type"
      :show-overflow-tooltip="column.hideOverflowTooltip"
    >
      <template #default="scope" v-if="column.type !== 'selection'">
        <div v-if="column.prop === 'value' && scope.row.type === 1">
          <el-input-number
            style="width: 100%"
            v-if="getDataType(scope.row.label) === VariableType.integer"
            controls-position="right"
            v-model="scope.row[column.prop]"
            @change="onSubmit"
          />
          <el-input
            style="width: 100%"
            v-else
            v-model="scope.row[column.prop]"
            :placeholder="`Please input ${column.label}`"
            @change="onSubmit"
          />
        </div>
        <el-select-v2
          v-else
          style="width: 100%"
          filterable
          v-model="scope.row[column.prop]"
          :options="
            column?.prop === 'value'
              ? filterOptions(scope.row.label)
              : filterVariables(options[column.prop], column.prop)
          "
          :placeholder="`Please select ${column.label}`"
          @change="onSubmit(scope)"
        >
          <template #default="scopes">
            <el-tooltip
              class="item"
              effect="dark"
              :content="scopes.item.label"
              placement="top"
            >
              <span class="select-v2-option">{{ scopes.item.label }}</span>
            </el-tooltip>
          </template>
        </el-select-v2>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup name="TransmitTable">
import { ElSelectV2, ElTableColumn } from 'element-plus'
import { getCurrentInstance } from 'vue'
import { tableData, tableColumn, options, handleSelectionChange, deleteTransmit } from '../../config'
import { useStore } from 'vuex'
import { VariableType, TransmitData, TransmitOptions } from '@shared/dataModelTypes/models/helpers'
const store = useStore()
const currentProperty = store.state.models.currentProperty
const { proxy }: any = getCurrentInstance()

function getDataType(variableId: string) {
  if (!variableId || !options.value.label.length) return ''
  const variableItem = options.value.label.filter((variable: TransmitData) => variable.value === variableId)[0]
  return variableItem.type
}

function filterOptions(variableId: string) {
  if (!variableId) return []
  const variableItem = options.value.label.find((variable: TransmitData) => variable.value === variableId)
  const variableType = variableItem.type
  return options.value.value.filter((variable: TransmitData) => variable.type === variableType)
}

function filterVariables(variablesOptions: TransmitData, variablesSelectNames: string) {
  if (variablesSelectNames !== 'label') return variablesOptions
  const ids: string[] = tableData.value.map(item => item.label)
  return variablesOptions.map(item => {
    return {
      ...item,
      disabled: ids.includes(item.value as string)
    }
  })
}

// watch(() => tableData.value, (object) => {
//   console.log(object, 999)
// })

function onSubmit(scope: typeof ElSelectV2) {
  if (scope.column && scope.column.rawColumnKey !== 'value') {
    const row = tableData.value[scope.$index]
    const defaultValue = getDataType(row.label) === VariableType.integer ? 0 : ''
    row.value = defaultValue
  }
  currentProperty.transmit = tableData.value
}

function rightClickTransmit(rows: TransmitData, column: typeof ElTableColumn, event: MouseEvent) {
  const menuItems = getTransmitContextMenuItems(rows)
  proxy.$contextMenu({
    screenPosition: { x: event.clientX, y: event.clientY },
    menuItems
  })
}

const getTransmitContextMenuItems = (rows: TransmitData) => {
  return [
    {
      title: '删除',
      shortCut: 'Ctrl+d',
      onClick: () => deleteTransmit(rows.id)
    }
  ]
}

</script>
<style lang="scss" scoped>
.select-v2-option {
  display: inline-block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
