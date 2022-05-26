import modelsDataSource from '@/store/modules/modelsDataSource'
import { ModelBlock } from '@shared/dataModelTypes'

function getModelBlockMapByName(modelId:number, maskName:string) {
  const allModelBlocks = modelsDataSource.getAllModelBlocksForAModel(modelId)
  const modelBlockNameMap = allModelBlocks.reduce((acc, cur) => {
    acc.set(cur.name, cur)
    return acc
  }, new Map<string, ModelBlock>())
  return modelBlockNameMap.get(maskName)
}

export { getModelBlockMapByName }
