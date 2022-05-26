import type { Output } from '@shared/dataModelTypes/runs/outputs'
import { omit } from '@shared/functional'

export function reformatOutputForDB(output: Partial<Output>): any {
  const outputForDB = output as any
  outputForDB.linkChain && (outputForDB.linkChain = JSON.stringify(outputForDB.linkChain))
  outputForDB.series && (outputForDB.series = JSON.stringify(outputForDB.series))
  return {
    ...omit(['id'], outputForDB)
  }
}

export function parseAnOutputFromDBQueryResult(result: any): Output {
  return {
    ...result,
    linkChain: JSON.parse(result.linkChain),
    series: JSON.parse(result.series),
    blockCopy: !!result.blockCopy,
    blockDepth: !!result.blockDepth,
    seriesCopy: !!result.seriesCopy,
    fileSeparateByNode: !!result.fileSeparateByNode,
    fileSeparateByCopy: !!result.fileSeparateByCopy,
    outputAllLevels: !!result.outputAllLevels,
    seriesDepth: !!result.seriesDepth,
    separateSeriesCopyPage: !!result.separateSeriesCopyPage
  }
}
