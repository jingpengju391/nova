import { Runner } from '@shared/dataModelTypes/runs/runners'
import type { CpuContrast, Target } from '@shared/dataModelTypes/runs/targets'
import { Projection, Queue } from '@shared/dataModelTypes/runs/projections'
import { omit } from '@shared/functional'

export function reformatTargetForDB(target: Partial<Target>): any {
  const targetForDB = target as any
  targetForDB.linkChain && (targetForDB.linkChain = JSON.stringify(targetForDB.linkChain))
  targetForDB.variablesAndSeries && (targetForDB.variablesAndSeries = JSON.stringify(targetForDB.variablesAndSeries))
  return { ...omit(['id'], targetForDB) }
}

export function parseATargetFromDBQueryResult(result: any): Target {
  return {
    ...result,
    linkChain: JSON.parse(result.linkChain),
    variablesAndSeries: JSON.parse(result.variablesAndSeries)
  }
}

export function reformatRunnerForDB(runner: Partial<Runner>): any {
  const runnerForDB = runner as any
  runnerForDB.targets && (runnerForDB.targets = JSON.stringify(runnerForDB.targets))
  runnerForDB.outputs && (runnerForDB.outputs = JSON.stringify(runnerForDB.outputs))
  runnerForDB.groupSeparators && (runnerForDB.groupSeparators = JSON.stringify(runnerForDB.groupSeparators))
  runnerForDB.blockInputId && (runnerForDB.blockInputId = JSON.stringify(runnerForDB.blockInputId))
  runnerForDB.assumption && (runnerForDB.assumption = JSON.stringify(runnerForDB.assumption))
  return { ...omit(['id'], runnerForDB) }
}

export function parseARunnerFromDBQueryResult(result: any): Runner {
  return {
    ...result,
    targets: JSON.parse(result.targets),
    outputs: JSON.parse(result.outputs),
    blockInputId: JSON.parse(result.blockInputId),
    groupSeparators: (result.groupSeparators && result.groupSeparators.length) ? JSON.parse(result.groupSeparators) : [],
    assumption: JSON.parse(result.assumption)
  }
}

function formatDate(str: string) {
  const newDate = new Date()
  const Month = (newDate.getMonth() + 1) < 10 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1)
  const day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate()
  if (!str) return newDate.getFullYear() + '-' + Month + '-' + day
  if (str === 'NaNNaNNaN') return newDate.getFullYear() + '-' + Month + '-' + day
  return str.substring(0, 4) + '-' + str.substring(4, 6) + '-' + str.substring(6, 8)
}
export function reformatProjectionForDB(projection: Partial<Projection>): any {
  const projectionForDB = projection as any
  projectionForDB.runnerSelections = JSON.stringify(projectionForDB.runnerSelections)
  projectionForDB.runQueueSelections = JSON.stringify(projectionForDB.runQueueSelections)
  // projectionForDB.evaluationTimePoint = formatToDate(projectionForDB.evaluationTimePoint)
  return { ...omit(['id'], projectionForDB) }
}
function formatToDate(str: string) {
  let datestr = str
  if (str.length === undefined) {
    const newDate = new Date(str)
    const Month = (newDate.getMonth() + 1) < 10 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1)
    const day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate()
    datestr = newDate.getFullYear().toString() + Month + day
  } else if (str.length === 10) {
    datestr = str.split('-')[0].toString() + str.split('-')[1].toString() + str.split('-')[2].toString()
  }

  return datestr
}
export function parseAProjectionFromDBQueryResult(result: any): Projection {
  return {
    ...result,
    subFolderOutput: !!result.subFolderOutput,
    runnerSelections: JSON.parse(result.runnerSelections),
    runQueueSelections: JSON.parse(result.runQueueSelections),
    childFolderSelect: !!result.childFolderSelect
    // shareBlockResults: !!result.shareBlockResults,
    // allowStaticBlocks: !!result.allowStaticBlocks,
    // allowScope: !!result.allowScope,
    // allowInnerLoopNumber: !!result.allowInnerLoopNumber,
    // allowOuterLoopNumber: !!result.allowOuterLoopNumber,
    // modelPointsOutput: !!result.modelPointsOutput,
    // independentInnerLoop: !!result.independentInnerLoop,
    // independentOuterLoop: !!result.independentOuterLoop,
    // slidingWindow: !!result.slidingWindow,
    // rebaseDepth: !!result.rebaseDepth,
    // rebaseSwitch: !!result.rebaseSwitch,
    // allowIterationWhenCircularReference: !!result.allowIterationWhenCircularReference
  }
}
export function reformatQueueForDB(queueRunner: Partial<Queue>): any {
  const queueRunnerForDB = queueRunner as any
  queueRunnerForDB.evaluationTimePoint = formatToDate(queueRunnerForDB.evaluationTimePoint)
  return { ...omit(['id'], queueRunnerForDB) }
}
export function parseQueueFromDBQueryResult(result: any): Queue {
  return {
    ...result,
    evaluationTimePoint: formatDate(result.evaluationTimePoint),
    allowScope: !!result.allowScope,
    allowInnerLoopNumber: !!result.allowInnerLoopNumber,
    allowOuterLoopNumber: !!result.allowOuterLoopNumber,
    modelPointsOutput: !!result.modelPointsOutput,
    independentInnerLoop: !!result.independentInnerLoop,
    independentOuterLoop: !!result.independentOuterLoop,
    slidingWindow: !!result.slidingWindow,
    rebaseDepth: !!result.rebaseDepth,
    rebaseSwitch: !!result.rebaseSwitch,
    allowIterationWhenCircularReference: !!result.allowIterationWhenCircularReference,
    isInherit: !!result.isInherit
  }
}
export function parseQueueFromDBQueryResult1(result: any): Queue {
  return {
    ...result,
    allowScope: !!result.allowScope,
    allowInnerLoopNumber: !!result.allowInnerLoopNumber,
    allowOuterLoopNumber: !!result.allowOuterLoopNumber,
    modelPointsOutput: !!result.modelPointsOutput,
    independentInnerLoop: !!result.independentInnerLoop,
    independentOuterLoop: !!result.independentOuterLoop,
    slidingWindow: !!result.slidingWindow,
    rebaseDepth: !!result.rebaseDepth,
    rebaseSwitch: !!result.rebaseSwitch,
    allowIterationWhenCircularReference: !!result.allowIterationWhenCircularReference,
    isInherit: !!result.isInherit
  }
}

export function parseCpuContrastResult(original:number, target:number):CpuContrast {
  return {
    original: original,
    target: target
  }
}
