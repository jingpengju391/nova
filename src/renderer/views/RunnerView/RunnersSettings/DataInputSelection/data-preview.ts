import { reactive } from 'vue'
import dataInputsDataSource from '@/store/modules/dataInputsDataSource'
import modelsDataSource from '@/store/modules/modelsDataSource'
import store from '@/store'
import { ElMessage } from 'element-plus'
import { useDataInputsAPIs, useAppSettingsAPIs } from '@/hooks/apis'
const selectedInput: any = reactive({})

const previewTableData: any = reactive({})

const previewTableHeaders: any = reactive({})

function getSelectedInput(id: number, fileId: number, identification: number) {
  if (!fileId) return
  if (fileId === -1) {
    selectedInput.value = null
  } else {
    const fn = identification === 1 ? 'getCurrentFile' : 'getCurrentBlockFile'
    const dataFile = dataInputsDataSource[fn](id)?.filter(f => f.id === fileId)
    if (dataFile === undefined) {
      selectedInput.value = -1
    } else {
      selectedInput.value = dataFile[0]
    }
  }
}

async function getPreviewTable(id: number, identification: number) {
  try {
    if (selectedInput.value) {
      let wholePath = ''
      const absolutePath = selectedInput.value.absolutePath
      if (selectedInput.value.isRelative) {
        const isWin = useAppSettingsAPIs().isWin()
        const pathSeparator = isWin ? '\\' : '/'
        const rooPath = store.getters.getCurrentWorkspaceDirPath
        const api = identification === 2 ? 'getCompleteModelBlock' : 'getModel'
        const mName = modelsDataSource[api](id).name
        // wholePath = rooPath + pathSeparator + mName + selectedInput.value.relativePath
        // console.log(wholePath)
        wholePath = await useDataInputsAPIs().pathJoin(rooPath, mName, selectedInput.value.relativePath)
      } else {
        wholePath = absolutePath
      }
      const data = await useDataInputsAPIs().getDataInputPreview(wholePath)
      previewTableHeaders.value = data[0].split(',')
      const dataPointsArray = data.slice(1).map(line => line.split(',')).filter(a => a.length === previewTableHeaders.value.length)
      const tableData = dataPointsArray.map(item => {
        const dataSourcePoint = {} as any
        item.forEach((iter, itemIndex) => {
          dataSourcePoint[previewTableHeaders.value[itemIndex]] = iter
        })
        return dataSourcePoint
      })
      previewTableData.value = tableData
    } else {
      previewTableHeaders.value = []
      previewTableData.value = []
    }
  } catch (err: any) {
    ElMessage({
      message: `无法预览数据源: ${err.message}`,
      type: 'error'
    })
  }
}

function setDataPreview(id: number, fileId: number, identification: number) {
  getSelectedInput(id, fileId, identification)
  getPreviewTable(id, identification)
}

export { selectedInput, previewTableData, previewTableHeaders, setDataPreview }
