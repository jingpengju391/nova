
import { useModelsAPIs } from '@/hooks/apis'
import { ElMessage } from 'element-plus'
import { dialog, data } from './dialog'
export const importData = async () => {
  try {
    const { canceled, filePath } = await useModelsAPIs().openFileDialog()
    if (canceled) return
    dialog.visible = true
    const lData = await useModelsAPIs().importModelJSON(filePath!)
    data.value = hanldData(lData)
  } catch (err:any) {
    ElMessage.error(`出错了，${err.message}`)
  }
}

function hanldData(oldData:any) {
  const newData:any = []
  const keys = Object.keys(oldData)
  keys.forEach((item:any) => {
    const obj:any = {}
    const childKeys = Object.keys(oldData[item])
    obj.field = item
    obj.name = item
    childKeys.forEach((iter:any) => { obj[iter] = oldData[item][iter].field })
    newData.push(obj)
  })
  return newData
}
