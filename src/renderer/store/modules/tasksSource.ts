import dataInputDataSource from './dataInputsDataSource'
import modelsDataSource from './modelsDataSource'
import { useAssumptionTableAPIs, useDataInputsAPIs } from '@/hooks'
import store from '@/store'
import { Output } from '@shared/dataModelTypes/runs/outputs'
import { Projection } from '@shared/dataModelTypes/runs/projections'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import { Target } from '@shared/dataModelTypes/runs/targets'
import { DataInputFile } from '@shared/dataModelTypes'
export const checkCurrentProjection = (projectionId: number): string => {
  return calcWarningForProjection(projectionId)
}

export function calcWarningForProjection(projectionId: number): string {
  const projections: Projection[] = store.state.runs.projections ?? []
  const runners: Runner[] = store.state.runs.runners ?? []
  const projection: Projection = projections.filter((projection: any) => projection.id === projectionId)[0]
  const runner: Runner[] = []
  let checkMsg: string = 'success'
  if (projections.length === 0) return 'no projection'
  try {
    if (projection.runnerSelections.length === 0) return 'no runner select'
    projection.runnerSelections.forEach((item: number[]) => {
      if (item.length === 0) {
        checkMsg = 'no runner select'
        throw new Error('no runner select')
      }
      item.forEach((iter: number) => {
        const run = runners.filter((runner: Runner) => runner.id === iter)
        if (run.length) {
          runner.push(run[0])
        } else {
          checkMsg = 'runner: [' + iter + '] not found'
          throw new Error('runner not found')
        }
      })
    })
  } catch (e) {
    return checkMsg
  }
  try {
    runner.forEach((element: Runner) => {
      checkMsg = calcWarningForRunner(element)
      if (checkMsg !== 'success') {
        console.log('check runner not success')
        throw new Error('bad runner')
      }
    })
  } catch (e) {
    return checkMsg
  }
  return checkMsg
}

export function calcWarningForRunner(runner: Runner): string {
  const outputIdMap = store.getters['outputs/outputIdMap']
  const targetIdMap = store.getters['runs/targetIdMap']
  if (runner.modelId === null) return 'no model selected!'
  let checkMsg: string = 'success'
  try {
    const dataFiles: DataInputFile[] | undefined = dataInputDataSource.getCurrentFile(runner.modelId)
    if (dataFiles) {
      if (runner.inputId !== -1) {
        const dataFile: DataInputFile | undefined = dataFiles.find(f => f.id === runner.inputId)
        if (!dataFile) {
          return 'no data selected!'
          // no data can run
          // return 'success'
        } else {
          checkMsg = calcWarningForInput(dataFile, dataFile?.isRelative)
        }
      }
      if (checkMsg !== 'success') return checkMsg
    }
    if (runner.blockInputId) {
      try {
        runner.blockInputId.forEach(inputId => {
          const dataFile: DataInputFile | undefined = dataInputDataSource.getCurrentFile(runner.modelId as number)?.find(f => f.id === inputId)
          if (!dataFile) return 'no data selected!'
          checkMsg = calcWarningForInput(dataFile, dataFile?.isRelative)
          if (checkMsg !== 'success') throw new Error('block data error')
        })
      } catch (e) {
        console.log(e)
        return checkMsg
      }
    }
  } catch (e) {
    console.log(e)
    return 'data input error!'
  }
  try {
    if (!runner.outputs.length) {
      return 'no output select'
    }
    runner.outputs.forEach((outputId: number) => {
      const output = outputIdMap.get(outputId)
      checkMsg = calcWarningForOutput(output)
      if (checkMsg !== 'success') throw new Error('target error')
    })
  } catch (e) {
    return checkMsg
  }
  try {
    if (!runner.targets.length) {
      return 'no target select'
    }
    runner.targets.forEach((targetId: number) => {
      const target = targetIdMap.get(targetId)
      checkMsg = calcWarningForTarget(target)
      if (checkMsg !== 'success') throw new Error('target error')
    })
  } catch (e) {
    console.log(e)
    return checkMsg
  }
  return checkMsg
}

export function calcWarningForInput(dataInput: DataInputFile, relative: boolean): string {
  const dataPath = relative ? useDataInputsAPIs().pathJoin(store.state.workspace.dirPath, modelsDataSource.getModel(dataInput.modelId).name, dataInput.relativePath) : dataInput.absolutePath
  const existsData = useAssumptionTableAPIs().isExists(dataPath)
  if (existsData) return 'success'
  return 'file: [' + dataPath + '] not exists!'
}

export function calcWarningForTarget(target: Target): string {
  if (target.variablesAndSeries.length === 0) {
    return ('target: [' + target.name + '] no series or variable select')
  }
  try {
    const targetMask = modelsDataSource.getTargetMaskForLinkChain(target.linkChain)
  } catch (e) {
    return ('target: [' + target.name + '] no linked Block')
  }
  if (!modelsDataSource.getModel(target.modelId).rootBlockId) {
    return ('target: [' + target.name + '] no rootBlock')
  }
  return 'success'
}

export function calcWarningForOutput(output: Output): string {
  if (output.series.length === 0) {
    return ('output: [' + output.name + '] no series select')
  }
  try {
    const targetMask = modelsDataSource.getTargetMaskForLinkChain(output.linkChain)
  } catch (e) {
    return ('output: [' + output.name + '] no linked Block')
  }
  if (!modelsDataSource.getModel(output.modelId).rootBlockId) {
    return ('output: [' + output.name + '] no rootBlock')
  }
  return 'success'
}
