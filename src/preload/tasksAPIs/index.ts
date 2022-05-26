import { ipcRenderer, shell } from 'electron'
import modelAPIs from '../modelsAPIs'
import runsAPIs from '../runsAPIs'
import outputsAPIs from '../outputsAPIs'
import dataInputsAPIs from '../dataInputsAPIs'
import settingsApis from '../settingsAPIs'
import assumptionVarsAPIs from '../assumptionVarsAPIs'
import productAPIs from '../productAPIs'
import workspacesAPIs from '../workspacesAPIs'
import path, { join } from 'path'
import { ensureDirSync, copySync, readJSON, writeJSON, existsSync, statSync, readFile, createReadStream, removeSync } from 'fs-extra'
import { Model, ModelBlock, DataInputFile, Variable, Series, Link, Workspace } from '@shared/dataModelTypes'
import { ArrayToString, dataInputBlockIDDelimiter } from '@shared/dataModelTypes/dataInputs'
import { LinkTarget } from '@shared/dataModelTypes/models/links'
import { Target, TargetVSItemType } from '@shared/dataModelTypes/runs/targets'
import { Output } from '@shared/dataModelTypes/runs/outputs'
import { Projection, SimplifiedProjection, Queue } from '@shared/dataModelTypes/runs/projections'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import { getLinkedMaskIdFromAChain } from '@shared/dataModelTypes/runs/utils'
import { CheckedHalflimiter } from '@shared/dataModelTypes/assumptions'
import { CopyType, VariableSource, VariableType, LinkSource, TransmitData } from '@shared/dataModelTypes/models/helpers'
import { CompileProcessItem, ModelProcessItem, ProcessQueue, ProcessType, taskMonit } from '@shared/dataModelTypes/tasks/index'
import { pick } from '@shared/functional'
import { convertToNumber } from '@shared/commonUtils'
// import { FordateAlignType } from '/@renderer/utils'
import DBClient from '../../service/db/dbClient'
import processUtil from '../../service/process/utils'
import type { CsvFileBody, ModelConfigJSON } from '@shared/dataModelTypes'
import { AnchorProduct, ProductMap } from '@shared/dataModelTypes/product/products'

const parseCsv = require('csv-parse')
const taskAPIs = {
  userSpace: '',
  async readConsoleFile(src: string): Promise<any> {
    return new Promise((resolve, reject) => {
      readFile(src, 'utf-8', (err, data) => {
        if (!err) resolve(data)
      })
    })
  },
  async readCsvFile(filePath: string): Promise<CsvFileBody> {
    const name = getName(filePath)
    const options = {}
    const parser = createReadStream(filePath).pipe(parseCsv(options))
    const list = []
    for await (const record of parser) {
      list.push(record)
      // if (list.length >= limit + 1) { // the first line is header row
      //   break
      // }
    }
    parser.end()
    const [columns, ...rows] = list
    return { name, path: filePath, columns, rows }
  },
  async openTaskListDir(path: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      shell.openPath(path)
      resolve(true)
    })
  },
  run: {
    async compileModel(model: { name: string, id: number }, workspace: Workspace): Promise<boolean> {
      return compileModelPrivate(model, workspace)
    },
    async stopProcess(pid: number | undefined, taskId?: number, processId?: string): Promise<boolean> {
      return stopProcessModelPrivate(pid, taskId, processId)
    },
    async runProjection(simplifiedProjection: SimplifiedProjection, workspace: Workspace): Promise<boolean> {
      const projection = await runsAPIs.db.queryProjection(simplifiedProjection.projectionId)
      if (!projection) return false
      let result = false
      // if (projection.mode === ProjectionMode.series) {
      //   result = await runProjectionInSeries(projection, workspace, simplifiedProjection)
      //   console.log('task finished in mode', result)
      // }
      result = await generateProcessQueue(projection, workspace, simplifiedProjection)
      console.log('task finished', result)
      return result
    }
  },
  db: {
    async insertTaskMonitsToDB(workspaceId: number, taskMonit: taskMonit) {
      // var ta = clone(FileTable)
      try {
        const knexInstance = DBClient.getInstance(taskAPIs.userSpace)
        return knexInstance('tasks').max('id as maxId').then((maxIds: any[]) => {
          const newId = maxIds.length ? maxIds[0].maxId + 1 : 1
          return knexInstance('tasks').insert({
            id: newId,
            taskName: taskMonit.taskName,
            outputAddress: taskMonit.outputAddress,
            outputChildAddress: taskMonit.outputChildAddress,
            status: taskMonit.status,
            submitTime: taskMonit.submitTime,
            completedTime: taskMonit.completedTime,
            submitter: taskMonit.submitter,
            modelName: taskMonit.modelName,
            modelId: taskMonit.modelId,
            projectionId: taskMonit.projectionId,
            workspaceId: workspaceId,
            processId: taskMonit.processId,
            pid: taskMonit.pid
          }).then(([id]: any) => {
            return id
          })
        })
      } catch (err) {
        console.log('insetErr')
      }
    },
    async queryTaskMonitsFromDB(workspaceId: number) {
      return DBClient.getInstance(taskAPIs.userSpace)('tasks')
        .select('*')
        .then((results: any) => {
          return JSON.parse(JSON.stringify(results))
        })
    },
    async deleteTaskMoniteToDB(idArr: number[]): Promise<any> {
      return Promise.all(idArr.map(async id => {
        await DBClient.getInstance(taskAPIs.userSpace)('tasks').where('id', id).del()
        return {
          ...idArr
        }
      }))
    },
    async updateTaskMoniteToDB(id: number, status: number) {
      let fields: Partial<taskMonit> = { status }
      // 7 waiting; 0 processing;
      if (status === 0) fields.submitTime = new Date().getTime()
      else if (status !== 7 && status !== 6) fields.completedTime = new Date().getTime()
      return DBClient.getInstance(taskAPIs.userSpace).transaction(async trx => {
        await trx('tasks').where('id', id).update(fields).then((results: any) => {
          return JSON.parse(JSON.stringify(results))
        })
      })
    },
    async updateTaskMoniteSubmitTimeToDB(id: number) {
      return DBClient.getInstance(taskAPIs.userSpace)('tasks').where('id', id).update({
        submitTime: new Date().getTime()
      })
        .then((results: any) => {
          return JSON.parse(JSON.stringify(results))
        })
    }
  }
}
export default taskAPIs
async function compileModelPrivate(model: { name: string, id: number }, workspace: Workspace): Promise<boolean> {
  let { compileTempOutputPath, projectionOutputPath } = await prepareForCompiling(model, workspace)
  let result
  let useCompileServer: boolean = false
  let modelName = (process.platform === 'win32') ? model.name : model.name + '_bin'
  try {
    if (process.env.ARCHITECTURE === 'bs') {
      let process = require('../../service/process/index')
      let taskCompileModel = process.taskCompileModel
      process.userSpace = taskAPIs.userSpace
      result = await taskCompileModel('task:compileModel', compileTempOutputPath, projectionOutputPath, modelName, useCompileServer, taskAPIs.userSpace)
    } else {
      result = await ipcRenderer.invoke('task:compileModel', compileTempOutputPath, projectionOutputPath, modelName, false) // todo ui setting
    }
    return result
  } catch (e) {
    console.log(e)
    return false
  }
}
async function stopProcessModelPrivate(pid: number | undefined, taskId?: number, processId?: string): Promise<boolean> {
  try {
    console.log('stop', pid)
    let result
    if (process.env.ARCHITECTURE === 'bs') {
      let process = require('../../service/process/index')
      result = await process.taskStopProcess('task:stopProcess', taskAPIs.userSpace, pid, taskId, processId)
    } else {
      result = await ipcRenderer.invoke('task:stopProcess', taskAPIs.userSpace, pid, taskId, processId)
    }
    return result
  } catch (e) {
    console.log(e)
    return false
  }
}

// async function runProjectionInSeries(projection: Projection, workspace: Workspace, currentProjInfo: SimplifiedProjection): Promise<boolean> {
//   let result = true
//   await asyncForEach(projection.runnerSelections, async (singleRunnerIdArray, index) => {
//     if (singleRunnerIdArray.length <= 0) return
//     if (index === undefined) return
//     const runnerId = singleRunnerIdArray[0]
//     const runner = await runsAPIs.db.queryRunner(runnerId)
//     if (runner) {
//       console.log('prepare compiling')
//       const model = await modelAPIs.db.queryModel(runner.modelId as number)
//       const compileModel = await compileModelPrivate({ name: model?.name as string, id: model?.id as number }, workspace)
//       if (!compileModel) return false
//     }
//   })
//   await asyncForEach(projection.runnerSelections, async (singleRunnerIdArray, index) => {
//     if (singleRunnerIdArray.length <= 0) return
//     if (index === undefined) return
//     console.log('taskIds:', currentProjInfo.taskIds)
//     const runnerId = singleRunnerIdArray[0]
//     const taskId = currentProjInfo.taskIds[index][0]
//     const runner = await runsAPIs.db.queryRunner(runnerId)
//     if (runner) {
//       console.log('prepare compiling')
//       const model = await modelAPIs.db.queryModel(runner.modelId as number)
//       const { projectionDirPath, jsonName } = await generateProjectionSettingForRunner(projection, runner, index, 0, workspace, currentProjInfo.childFolder)
//       console.log('projectionDirPath:', projectionDirPath)
//       const currentResult = await ipcRenderer.invoke('task:runProjection', projectionDirPath, runner?.name, model?.name, taskId)
//       result = result ? currentResult : result
//       console.log('projection', singleRunnerIdArray, result)
//       return result
//     }
//   })
//   return result
// }

async function generateProcessQueue(projection: Projection, workspace: Workspace, currentProjInfo: SimplifiedProjection): Promise<boolean> {
  const modelProcess: ModelProcessItem[][] = []
  const compileProcess: CompileProcessItem[][] = []
  for (let linearIndex = 0; linearIndex < projection.runnerSelections.length; linearIndex++) {
    const paralleRuners = projection.runnerSelections[linearIndex]
    const parallQueueRunners = projection.runQueueSelections[linearIndex]
    modelProcess.push([])
    compileProcess.push([])
    const taskIds = currentProjInfo.taskIds[linearIndex]
    const currentModelProcess = modelProcess[linearIndex]
    const currentCompileProcess = compileProcess[linearIndex]
    for (let parallelIndex = 0; parallelIndex < paralleRuners.length; parallelIndex++) {
      const runnerId = paralleRuners[parallelIndex]
      const queueRunnerId = parallQueueRunners[parallelIndex]
      const taskId = taskIds[parallelIndex]
      const runner = await runsAPIs.db.queryRunner(runnerId)
      const queueRunner = await runsAPIs.db.queryQueueRunner(queueRunnerId)
      if (runner) {
        const model = await modelAPIs.db.queryModel(runner.modelId as number)
        const { projectionDirPath, jsonName, outputFolder } = await generateProjectionSettingForRunner(projection, runner, queueRunner, linearIndex, parallelIndex, workspace, currentProjInfo.childFolder, taskId)
        const { compileTempOutputPath, projectionOutputPath } = await prepareForCompiling({ name: model?.name as string, id: model?.id as number }, workspace)
        const input = await dataInputsAPIs.db.queryDataInput(runner.inputId as number)
        if (model && queueRunner) {
          let modelName = model?.name
          if (process.platform !== 'win32') modelName += '_bin'
          currentCompileProcess.push({
            modelName: modelName,
            taskId: taskId,
            processType: ProcessType.compile,
            runned: false,
            killed: false,
            finished: false,
            threadNumber: queueRunner.multiThreadNumber >= 1 ? queueRunner.multiThreadNumber : 1,
            projectionDirPath: projectionOutputPath,
            compileTempOutputPath: compileTempOutputPath
          })
          currentModelProcess.push({
            modelName: modelName,
            taskId: taskId,
            processType: ProcessType.modelRun,
            runned: false,
            killed: false,
            finished: false,
            threadNumber: queueRunner.multiThreadNumber >= 1 ? queueRunner.multiThreadNumber : 1,
            projectionDirPath: projectionDirPath,
            runnerName: jsonName,
            runnerLocalId: [linearIndex, parallelIndex],
            csvPath: input ? normalizePath(input?.path) : '',
            scope: queueRunner.allowScope ? [queueRunner.scopeFrom, queueRunner.scopeTo] : [-1, -1],
            outputFolder: outputFolder,
            compileTempOutputPath: compileTempOutputPath
          })
        } else {
          return false
        }
      } else {
        return false
        // todo error handling
      }
    }
  }
  const taskQueue: ProcessQueue = {
    compileProcess: compileProcess,
    modelProcess: modelProcess,
    currentWindow: null,
    processId: currentProjInfo.processId,
    projectionId: currentProjInfo.projectionId,
    useCluster: currentProjInfo.useCluster,
    namespace: currentProjInfo.namespace,
    isClusterTaskSent: false,
    userSpace: taskAPIs.userSpace
  }
  console.log('all projection finished', taskQueue)
  if (process.env.ARCHITECTURE === 'bs') {
    let process = require('../../service/process/index')
    let taskAddProcessQueue = process.taskAddProcessQueue
    taskAddProcessQueue('task:addProcessQueue', taskQueue)
  } else {
    ipcRenderer.invoke('task:addProcessQueue', taskQueue)
  }

  return true
}

/**
 * @returns compiling output path
 */
async function prepareForCompiling(model: { name: string, id: number }, workspace: Workspace):

  Promise<{ compileTempOutputPath: string, projectionOutputPath: string }> {
  let appTempDirPath: any
  if (process.env.ARCHITECTURE === 'bs') {
    const communicationAPIs = require('../../main/communicationAPIs')
    appTempDirPath = communicationAPIs.novaTempFileDirectory()
  } else {
    appTempDirPath = ipcRenderer.sendSync('app:tempDirectory') as string
  }

  const workspaceTempDirPath = join(appTempDirPath, taskAPIs.userSpace, workspace.fileName)
  // const workspaceTempDirPath = join(appTempDirPath, workspace.fileName)

  ensureDirSync(workspaceTempDirPath)
  const compileTempOutputPath = join(workspaceTempDirPath, model.name)
  // console.log('prepareForCompiling workspace:', workspace)
  console.log('temp compile output path:', compileTempOutputPath)

  // copy all the libraries
  let libsPath
  if (process.env.ARCHITECTURE === 'bs') {
    // console.log('process.platform---------------',process.platform)
    switch (process.platform) {
      case 'darwin':
        libsPath = 'tasks/libs_mac'
        break
      case 'win32':
        libsPath = 'tasks/libs_windows'
        break
      default:
        libsPath = 'tasks/libs_linux'
    }
  } else {
    libsPath = ipcRenderer.sendSync('app:libsDirectory') as string
  }
  // console.log('libsPath--------------', libsPath)

  let documentsPath: any
  let projectionOutputPath: string
  if (process.env.ARCHITECTURE === 'bs') {
    // documentsPath = 'C:\\workspaces\\SampleModel\\feiyan'
    documentsPath = workspace.dirPath
    projectionOutputPath = join(documentsPath, model.name)
  } else {
    documentsPath = workspace.dirPath.length ? workspace.dirPath : ipcRenderer.sendSync('app:docDirectory') as string
    projectionOutputPath = join(documentsPath, model.name)
  }
  // console.log('projectionOutputPath--------------', projectionOutputPath)
  let forceOverWrite = false
  const modelConfigPath = join(compileTempOutputPath, 'model.config.json')
  if (existsSync(modelConfigPath)) {
    const modelJSON: ModelConfigJSON = await readJSON(modelConfigPath)
    if (modelJSON.version !== modelAPIs.version) {
      forceOverWrite = true
    }
  } else {
    forceOverWrite = true
  }
  if (forceOverWrite) {
    try {
      removeSync(compileTempOutputPath)
    } catch (e) {
      console.log(e)
    }
  }
  ensureDirSync(projectionOutputPath)
  ensureDirSync(compileTempOutputPath)
  autoCopySync(libsPath, compileTempOutputPath, forceOverWrite)
  autoCopySync(libsPath, projectionOutputPath, forceOverWrite)

  // copy core files and header files
  ensureDirSync(join(compileTempOutputPath, '/jinShaJiang'))

  let headerPath: any
  if (process.env.ARCHITECTURE === 'bs') {
    headerPath = 'tasks/headers'
  } else {
    headerPath = ipcRenderer.sendSync('app:headerFilesPath') as string
  }
  // console.log('headerPath--------------', headerPath)

  autoCopySync(headerPath, join(compileTempOutputPath, '/jinShaJiang'), forceOverWrite)

  // generate cpp output directory
  const cppOutputsPath = join(compileTempOutputPath, '/jinShaJiang/Model')
  ensureDirSync(cppOutputsPath)

  // generate model json file

  let corePath
  if (process.env.ARCHITECTURE === 'bs') {
    switch (process.platform) {
      case 'darwin':
        corePath = 'tasks/core_mac'
        break
      case 'win32':
        corePath = 'tasks/core_windows'
        break
      default:
        corePath = 'tasks/core_linux'
    }
  } else {
    corePath = ipcRenderer.sendSync('app:coreFilesPath')
  }
  // console.log('corePath--------------', corePath)

  autoCopySync(corePath, join(compileTempOutputPath, '/core'), forceOverWrite)
  const modelJSONPath = join(compileTempOutputPath, 'model.json')
  await modelAPIs.writeModelJSONFileToDisk(modelJSONPath, model.id)
  // TODO check right reduce output path
  return { compileTempOutputPath, projectionOutputPath }
}

async function generateProjectionSettingForRunner(projection: Projection, runner: Runner | null, queueRunner: Queue | null, linearIndex: number, paralleIndex: number, workspace: Workspace, outputSubFolder: string, taskId: number) {
  if (!runner) throw new Error('No runner found')
  if (!queueRunner) throw new Error('No queueRunner found')

  const [model, targets, outputs, dataInput, blockDataInput, masters] = await Promise.all([
    modelAPIs.db.queryModelWithItsBlocks(runner.modelId!),
    runsAPIs.db.queryTargets(runner.targets),
    outputsAPIs.db.queryOutputs(runner.outputs),
    runner.inputId === -1 ? undefined : dataInputsAPIs.db.queryDataInput(runner.inputId!),
    runner.blockInputId ? dataInputsAPIs.db.queryDataInputs(runner.blockInputId) : undefined,
    productAPIs.products.db.queryAllMasterOfWorkspace(1)
  ])

  if (!model) throw new Error('No model found')
  if (targets.length <= 0) throw new Error('No target found')
  if (outputs.length <= 0) throw new Error('No output found')

  if (runner.inputId !== null && runner.inputId !== -1 && runner.inputId !== undefined) {
    if (!dataInput) throw new Error('No dataInput found')
  }

  const documentsPath = workspace.dirPath.length ? workspace.dirPath : ipcRenderer.sendSync('app:docDirectory') as string
  const projectionDirPath = join(documentsPath, model.name)
  ensureDirSync(projectionDirPath)

  const allBlocks = model.detailedChildren
  const blockIdMap = allBlocks.reduce((map, block) => {
    map.set(block.id as number, block)
    return map
  }, new Map<number, ModelBlock>())
  const blockNameMap = allBlocks.reduce((map, block) => {
    map.set(block.name, block)
    return map
  }, new Map<string, ModelBlock>())
  const parentChildBlocksMap = new Map<number, string[]>()
  allBlocks.forEach(block => {
    if (block.parentId) {
      const children = parentChildBlocksMap.get(block.parentId) ?? []
      children.push(block.name)
      parentChildBlocksMap.set(block.parentId, children)
    }
  })

  // Get All root block linked blocks plus root block
  const assumptions = await configAssumptions(runner, model.detailedChildren, blockIdMap)

  const projectionDataInput = configDataInput(projection, queueRunner, model, dataInput, false)
  if (blockDataInput) {
    // @ts-ignore
    blockDataInput.forEach((dataItem: DataInputFile) => {
      const block = blockIdMap.get(dataItem.blockId)
      if (block) {
        const key = getBlockFullName(block, blockIdMap)
        projectionDataInput[key] = configDataInput(projection, queueRunner, model, dataItem, true)
        if (block.groupSeparators && block.groupSeparators.length > 0) {
          projectionDataInput[key].groupSeparators = block.groupSeparators
        }
      }
    })
  }
  const jsonName = projection.name + '_' + runner.name + '_' + linearIndex + '_' + paralleIndex
  // TODO suit bs
  let taskTmpDir
  if (process.env.ARCHITECTURE === 'bs') {
    const processApi = require('../../service/process')
    taskTmpDir = processApi.getTaskTmpDir(taskId)
  } else {
    taskTmpDir = ipcRenderer.sendSync('task:tmpDir', taskId) as string
  }
  ensureDirSync(join(projectionDirPath, taskTmpDir))
  const jsonPath = join(projectionDirPath, taskTmpDir, jsonName + '.json')
  console.log('jsonPath:', jsonPath)
  const allLinkBlocks = getAllLinkedBlockPlusRootBlock(model, blockNameMap, blockIdMap, parentChildBlocksMap)
  const products = configProducts(masters)
  const entries = configEntries(model, blockIdMap, queueRunner.evaluationTimePoint)
  if (Object.keys(products.prodCodeMappings).length > 0 && Object.keys(products.prodIdMappings).length > 0) {
    entries[0].prod_code = true
  }
  const engineSettings = await configEngineSettings(projection, queueRunner, taskTmpDir)
  const projectionSettings = {
    engineSettings: engineSettings,
    switches: {},
    entries: entries,
    externalConstants: configExternalConstants(),
    tanks: configTanks(),
    assumptions: assumptions,
    defaultValues: configDefaultValues(allLinkBlocks, blockIdMap),
    defaultLinks: configDefaultLinks(allLinkBlocks, blockIdMap),
    dataInput: projectionDataInput,
    targets: configTargets(model, targets, blockIdMap),
    outputs: configOutputs(projection, outputs, runner.groupSeparators, outputSubFolder, queueRunner, linearIndex, paralleIndex),
    blockSettings: configBlockSettings(model, blockIdMap),
    ...products
  }
  // console.log('projectionSettings:', projectionSettings)

  try {
    await writeJSON(jsonPath, projectionSettings, { spaces: '\t' })
  } catch (e) {
    console.log(e)
  }
  return { projectionDirPath: projectionDirPath, jsonName: path.join(taskTmpDir, jsonName), outputFolder: projectionSettings.outputs.outputFolder }
}

// private
function getName(filePath: string) {
  return path.basename(filePath, path.extname(filePath))
}
function getBlocksByVariableId(source: any, blocks: { id: number | string, name: string, variables: Variable[] }[]): { name: string, variables: Variable[] }[] {
  return blocks.map(block => ({
    name: block.name,
    variables: block.variables.filter((variable: Variable) => {
      return source.indexOf(`${variable.id}${CheckedHalflimiter}${block.id}`) !== -1
    })
  })).filter(block =>
    block.variables.length > 0
  )
}

function getBlocksWithAssumptions(blocks: ModelBlock[], blockIdMap: Map<number, ModelBlock>): { id: number | string, name: string, variables: Variable[] }[] {
  return blocks.map(block => ({
    name: getBlockFullName(block, blockIdMap),
    id: block.id,
    variables: Object.values(block.variables).filter((variable: Variable) => {
      return variable.source === VariableSource.assumption
    })
  })).filter(block =>
    block.variables.length > 0
  )
}

function getAllLinkedBlockPlusRootBlock(model: Model, blockNameMap: Map<string, ModelBlock>,
  blockIdMap: Map<number, ModelBlock>, parentChildBlocksMap: Map<number, string[]>): ModelBlock[] {
  if (!model.rootBlockId) return []
  const rootBlock = blockIdMap.get(model.rootBlockId)!
  const blockNames = getAllLinkedBlockNames(rootBlock, blockNameMap, parentChildBlocksMap)
  return model.detailedChildren.filter(
    block => blockNames.has(block.name) || block.name === rootBlock.name)
}
/**
 * Return rootBlock's linked blocks and their groups.
 * Since link target can only be parent block,
 * the returned blocks will contain all the parent's child blocks.
 */
function getAllLinkedBlockNames(rootBlock: ModelBlock, blockNameMap: Map<string, ModelBlock>,
  parentChildBlocksMap: Map<number, string[]>): Set<string> {
  const blockNames = new Set<string>()
  const guard = new Set<string>()

  const walkLinkTargets = (targets: LinkTarget[]) => {
    targets.forEach(target => {
      const key = `${target.type}-${target.maskName}`
      if (guard.has(key)) return
      guard.add(key)

      blockNames.add(target.maskName)
      // then add all it's child blocks
      const block = blockNameMap.get(target.maskName)!
      const children = parentChildBlocksMap.get(block.id as number)!
      if (children) {
        children.forEach(childBlockName => {
          blockNames.add(childBlockName)
          const childBlock = blockNameMap.get(childBlockName)!
          walkLinkTargets(Object.values(childBlock.links).filter(l => l.target).map(l => l.target!))
        })
      }
      walkLinkTargets(Object.values(block.links).filter(l => l.target).map(l => l.target!))
    })
  }
  walkLinkTargets(Object.values(rootBlock.links).filter(l => l.target).map(l => l.target!))
  return blockNames
}

async function configEngineSettings(projection: Projection, queueRunner: Queue, tempDir: string): Promise<any> {
  let userName = workspacesAPIs.userSpace !== undefined ? workspacesAPIs.userSpace.split('/')[0] : ''
  let appSettings = await settingsApis.app.query(userName)
  let logicalProcessorsList = processUtil.getProcessorsList()
  const engineSettings: any = {
    calculationStackHeightLimit: process.platform === 'win32' ? 8192 : (process.platform === 'linux' ? Math.min(appSettings.calculationStackHeightLimit, 8192) : 768),
    multiThreadNumber: Math.min(queueRunner.multiThreadNumber, logicalProcessorsList[0]),
    errorTraceLength: appSettings.errorTraceLength,
    independentInnerLoop: queueRunner.independentInnerLoop,
    independentOuterLoop: queueRunner.independentOuterLoop,
    archiveFolder: normalizePath(path.join(tempDir, 'archive')),
    outputPageArchivePrefix: 'outputPageNode.',
    tableArchivePrefix: 'tableUnit.',
    blockResultArchivePrefix: 'blockResult.',
    archivePostfix: '.archive',
    usedBlockCriticalLength: 4096,
    usedBlockRetainLength: 1024,
    rebaseDepth: queueRunner.rebaseDepth,
    rebaseSwitch: queueRunner.rebaseSwitch,
    blockCopyRetainLength: 16,
    blockDepthRetainLength: 64,
    blockResultCriticalLength: 65536,
    blockResultRetainLength: 32768,
    tableUnitCriticalLength: 512,
    tableUnitRetainLength: 128,
    outputPageCriticalLength: 2048,
    outputPageRetainLength: 1024,
    dataRecordBatchSize: 32,
    dataRecordBatchMultiplier: 8,
    outputPageNodeMultiplier: 6,
    outputPageNodeSafe: 6,
    slidingWindow: queueRunner.slidingWindow,
    allowIterationWhenCircularReference: queueRunner.allowIterationWhenCircularReference
  }
  if (queueRunner.allowInnerLoopNumber) engineSettings.innerLoopNumber = [[queueRunner.innerLoopNumberFrom, queueRunner.innerLoopNumberTo]]
  if (queueRunner.allowOuterLoopNumber) engineSettings.outerLoopNumber = [[queueRunner.outerLoopNumberFrom, queueRunner.outerLoopNumberTo]]
  return engineSettings
}

function configEntries(model: Model, blockIdMap: Map<number, ModelBlock>, valDate: string): any {
  console.log(valDate)
  const rootBlock = blockIdMap.get(model.rootBlockId!)!
  const EntryDataType = configDataInputEntryDataType(model)
  return [{
    ...EntryDataType,
    rootName: 'rootBlock',
    blockName: getBlockFullName(rootBlock, blockIdMap),
    applyTank: 'N',
    val_date: Number(valDate),
    separators: {}
  }]
}

// block full name contains all its ancestors' names
// Format is like "Mask_A\\:\\:Block_A"
function getBlockFullName(block: ModelBlock, blockIdMap: Map<number, ModelBlock>): string {
  let currentBlock = block
  let fullBlockName = block.name
  while (currentBlock.parentId) {
    const parentBlock = blockIdMap.get(currentBlock.parentId)!
    fullBlockName = parentBlock.name + '\\:\\:' + fullBlockName
    currentBlock = parentBlock
  }
  return fullBlockName
}

function configExternalConstants(): any {
  return {
    _SAMPLE_VALUE_KEY_: {
      _SUB_VALUE_KEY_: 'value'
    }
  }
}

function configTanks(): any {
  return {
    bestEstimate: {
      values: {},
      subTanks: []
    }
  }
}

async function configAssumptions(runner: Runner, blocksObj: ModelBlock[], blockIdMap: Map<number, ModelBlock>): Promise<any> {
  const assumptions = {
    variables: {} as any,
    links: {}
  }
  const blockWithAssumptions = getBlocksWithAssumptions(blocksObj, blockIdMap)
  blockWithAssumptions.forEach(block => {
    assumptions.variables[block.name] = assumptions.variables[block.name] || {}
    block.variables.forEach(variable => {
      assumptions.variables[block.name][variable.name] = {
        type: variable.type,
        value: variable.type === 'string' ? normalizePath(variable.valueInput ?? '') : convertToNumber(variable.valueInput ?? 0)
      }
    })
  })
  for (const [pageIdString, sectionId] of Object.entries(runner.assumption)) {
    const tableVariables = await assumptionVarsAPIs.db.queryVariableVar(parseInt(pageIdString))
    const section = await assumptionVarsAPIs.db.querySectionVarById(sectionId)
    const sectionValue = section?.value || ''
    tableVariables.forEach((iter: any) => {
      const sectionKeys = iter.sectionKey ? iter.sectionKey.split(ArrayToString) : []
      const sectionVals = iter.sectionVal ? iter.sectionVal.split(ArrayToString) : []
      const sectionValueIndex = sectionKeys.indexOf(sectionValue)
      const source = iter.source ? iter.source.split(ArrayToString) : []
      const value = sectionValueIndex === '-1' || !sectionVals.length ? '' : sectionVals[sectionValueIndex]
      const blocks = getBlocksByVariableId(source, blockWithAssumptions)
      blocks.forEach(block => {
        assumptions.variables[block.name] = assumptions.variables[block.name] || {}
        block.variables.forEach(variable => {
          assumptions.variables[block.name][variable.name] = {
            type: iter.type,
            linkage: {
              pageID: parseInt(pageIdString),
              sectionID: sectionId
            },
            value: iter.type === 'string' ? normalizePath(value ?? (variable.valueInput ?? '')) : (value !== undefined ? convertToNumber(value) : convertToNumber((variable.valueInput ?? 0)))
          }
        })
      })
    })
  }
  return assumptions
}

function configDefaultValues(blocks: ModelBlock[], blockIdMap: Map<number, ModelBlock>): any {
  const defaultValues = {} as any
  // filter block which contains variables that have source of default.
  const filteredBlocks = blocks.filter(block => {
    return Object.values(block.variables).findIndex(variable => variable.source === 'default') !== -1
  })
  filteredBlocks.forEach(block => {
    const key = getBlockFullName(block, blockIdMap)
    defaultValues[key] = {}
    Object.values(block.variables).forEach(variable => {
      if (variable.source === 'default') {
        // console.log('defaultValue:', block.name, variable.name, variable.valueInput)
        const defaultValue = (variable.type === VariableType.double || variable.type === VariableType.integer)
          ? convertToNumber(variable.valueInput) : (typeof variable.valueInput === 'string') ? normalizePath(variable.valueInput) : variable.valueInput
        defaultValues[key][variable.name] = defaultValue
      }
    })
  })
  return defaultValues
}

function configDefaultLinks(blocks: ModelBlock[], blockIdMap: Map<number, ModelBlock>): any {
  const defaultLinks = {} as any
  const filteredBlock = blocks.filter(block => Object.values(block.links).length > 0)
  filteredBlock.forEach(block => {
    const key = getBlockFullName(block, blockIdMap)
    defaultLinks[key] = {}
    Object.values(block.links).forEach(link => {
      defaultLinks[key][link.name] = {
        blockName: 'N',
        applyCopy: false,
        applyTank: 'N',
        separators: {},
        children: []
      }
    })
  })
  return defaultLinks
}

function configDataInput(projection: Projection, queueRunner: Queue, model: Model, dataInput: DataInputFile, isBlockDataInput: boolean): any {
  const dataInputSetting = {} as any
  const EntryDataType = configDataInputEntryDataType(model)
  dataInputSetting.fileName = dataInput ? normalizePath(dataInput.path) : 'N'
  dataInputSetting.dataType = 'TXT'
  if (queueRunner.allowScope) {
    dataInputSetting.scope = { range: [[queueRunner.scopeFrom, queueRunner.scopeTo]] }
  }
  dataInputSetting.modelPointsOutput = queueRunner.modelPointsOutput ? 'mp_output.csv' : 'N'

  dataInputSetting.dataFields = {}

  type DataMappingVariable = Pick<Variable, 'name' | 'type' | 'copyType' | 'copySize'> & { blockId: number | string }
  const dataMappingVariables = model.detailedChildren.reduce((dataMappingItems, modelBlock) => {
    Object.values(modelBlock.variables).forEach((variable: Variable) => {
      if (variable.id !== '0' && variable.isDefining && (variable.source === 'data')) {
        dataMappingItems.push({ ...pick(['name', 'type', 'copyType', 'copySize'], variable), blockId: modelBlock.id })
      }
    })
    return dataMappingItems
  }, [] as DataMappingVariable[])
  if (dataInput) {
    const blockValArr = dataInput.blockVal.split(ArrayToString).slice(1)
    const blockKeyArr = dataInput.blockKey.split(ArrayToString).slice(1)
    dataMappingVariables.forEach((item) => {
      const variableName = item.blockId + dataInputBlockIDDelimiter + item.name
      const index = blockKeyArr.findIndex(k => k === variableName)
      if (index > -1) {
        const blockVar = blockValArr[index]
        dataInputSetting.dataFields[variableName] = {
          field: blockVar ? (blockVar.trim()?.length ? blockVar.trim() : '#emptyField') : '#emptyField', // should throw an error
          type: item.type
        }
        if (item.copyType === CopyType.fixed) {
          for (let i = 0; i < item.copySize; i++) {
            const itemName = variableName + '_c' + i
            const fieldName = blockVar
              ? blockVar + (i + 1)
              : '#emptyField'
            dataInputSetting.dataFields[itemName] = { field: fieldName.trim(), type: item.type }
          }
        }
      }
      // trim must be used here
    })

    const index = blockKeyArr.findIndex(k => k === '_PROD_CODE')
    if (index > -1) {
      const blockVar = blockValArr[index]
      dataInputSetting.dataFields._PROD_CODE = {
        field: blockVar ? (blockVar.trim()?.length ? blockVar.trim() : '#emptyField') : '#emptyField', // should throw an error
        type: 'string'
      }
    }
    if (!isBlockDataInput && model.isDateCenter) {
      if (model.dateAlignType === undefined) return
      const dateAlignType = FordateAlignType(model.dateAlignType)
      let index = blockKeyArr.findIndex(k => k === dateAlignType)
      if (index < 0) index = blockKeyArr.findIndex(k => k === '_ENTRY_DATE' || k === '_ENTRY_T')
      const blockVar = blockValArr[index]
      dataInputSetting.dataFields[dateAlignType] = {
        field: blockVar ? (blockVar.trim()?.length ? blockVar.trim() : '#emptyField') : '#emptyField', // should throw an error
        type: 'integer'
      }
    }
  }
  // dataInputSetting.entry_date_data = EntryDataType.entry_date_data
  // dataInputSetting.entry_t_data = EntryDataType.entry_t_data
  return dataInputSetting
}

function normalizePath(path: string): string {
  if (!path) return path
  const isWin = process.platform === 'win32'
  if (!isWin) {
    return path.replace(/\\/g, '/').replace(/:|\\/g, '\\$&')
  }
  return path.replace(/:|\\/g, '\\$&')
}

/**
 * target.linkChain is an array whose element has a format of 'link.name + '->' + linkedMask.id'
 * This function will only keep link.name for each element
 * @param linkChain: target.linkChain
 * @return an array of [link.name]
 */
function normalizeLinkChain(linkChain: string[]): string[] {
  if (linkChain) {
    const newChain = linkChain.map(chain => {
      return chain.split('->')[0]
    })
    newChain.shift()
    return newChain
  }
  return []
}

function configTargets(model: Model, targets: Target[], blockIdMap: Map<number, ModelBlock>): any {
  const targetSettings = [] as any
  // const rootBlock = blockIdMap.get(model.rootBlockId!)!
  targets.forEach(target => {
    if (target.linkChain.length <= 0) return
    const lastChain = target.linkChain[target.linkChain.length - 1]
    const linkedMaskId = getLinkedMaskIdFromAChain(lastChain)
    const linkedMask = blockIdMap.get(linkedMaskId)!
    target.variablesAndSeries.forEach(targetItem => {
      const configItem = {
        targetName: linkedMask.name + '_' + targetItem.name,
        rootBlock: 'rootBlock',
        linkChain: normalizeLinkChain(target.linkChain),
        itemName: targetItem.name,
        output: targetItem.shouldOutput
      } as any
      targetItem.type === TargetVSItemType.series && (configItem.periods = [[targetItem.periodFrom, targetItem.periodTo]])
      targetItem.type === TargetVSItemType.series && targetItem.shouldOutput && (configItem.periods_output = [[targetItem.periodOutputFrom, targetItem.periodOutputTo]])
      targetSettings.push({
        ...configItem
      })
    })
  })
  return targetSettings
}

function configOutputs(projection: Projection, outputs: Output[], groupSeparators: string[], outputSubFolder: string, queueRunner: Queue, linearIndex: number, paralleIndex: number): any {
  const outputsSetting = {} as any
  outputsSetting.outputFolder = projection.outputFolder
  if (outputSubFolder) {
    if (outputSubFolder.length > 0) {
      outputsSetting.outputFolder = join(outputsSetting.outputFolder, outputSubFolder)
    }
  }
  if (projection.subFolderOutput) {
    outputsSetting.outputFolder = join(outputsSetting.outputFolder, outputSubFolder + '_' + linearIndex + '_' + paralleIndex)
  }
  outputsSetting.outputFolder = normalizePath(outputsSetting.outputFolder)
  outputsSetting.outputPrefix = projection.name
  outputsSetting.outputPrecision = projection.outputPrecision
  outputsSetting.groupSeparators = groupSeparators

  outputsSetting.outputPages = []

  outputs.forEach(output => {
    if (output.linkChain.length <= 0) return
    const outputsVariables = output.series.filter(serie => { return serie.type === 'variables' })
    const outputsSeries = output.series.filter(serie => { return serie.type === 'series' })
    if (outputsSeries.length <= 0 && outputsVariables.length <= 0) return
    outputsSetting.outputPages.push({
      pageName: output.name,
      rootBlock: 'rootBlock',
      linkChain: normalizeLinkChain(output.linkChain),
      from: output.periodFrom,
      to: output.periodTo,
      blockCopy: output.blockCopy,
      blockDepth: output.blockDepth,
      // outputBlockCopies: 'all',
      outputAllLevel: output.outputAllLevels,
      fileSeparateByCopy: output.fileSeparateByCopy,
      fileSeparateByNode: output.fileSeparateByNode,
      seriesCopy: output.seriesCopy,
      seriesDepth: output.seriesDepth,
      separateSeriesCopyPage: output.separateSeriesCopyPage,
      series: outputsSeries.reduce((acc, s, index) => {
        if (s.type === 'series') {
          acc[s.name] = index
        }
        return acc
      }, {} as Record<string, number>),
      variables: outputsVariables.reduce((acc, s, index) => {
        if (s.type === 'variables') {
          acc[s.name] = index
        }
        return acc
      }, {} as Record<string, number>)
    })
  })
  return outputsSetting
}

function configBlockSettings(model: Model, blockIdMap: Map<number, ModelBlock>): any {
  const blockSettings = {} as any
  model.detailedChildren.forEach(modelBlock => {
    const blockFullName = getBlockFullName(modelBlock, blockIdMap)
    blockSettings[blockFullName] = {}
    modelBlock.slidingWindow && (blockSettings[blockFullName].slidingWindow = modelBlock.slidingWindow)
    modelBlock.allowManualResize && (blockSettings[blockFullName].allowManualResize = modelBlock.allowManualResize)
    modelBlock.isProductMask && (blockSettings[blockFullName].prodBlock = true)
    Object.values(modelBlock.series).length > 0 &&
      (blockSettings[blockFullName].series = configSeriesSettings(Object.values(modelBlock.series)))
    Object.values(modelBlock.variables).length > 0 &&
      (blockSettings[blockFullName].variables = configVariablesSettings(Object.values(modelBlock.variables)))
    Object.values(modelBlock.links).length > 0 &&
      (blockSettings[blockFullName].links = configLinksSettings(Object.values(modelBlock.links), modelBlock, blockIdMap))
  })
  return blockSettings
}

function configSeriesSettings(series: Series[]): any {
  const seriesSettings = {} as any
  series.forEach(item => {
    const currentItem = {} as any
    item.isAutoSum !== false && (currentItem.autoSum = item.isAutoSum)
    item.isAutoSum !== false && (currentItem.autoSumLevel = item.autoSumLevel)
    item.rebaseType !== 1 && (currentItem.rebaseType = item.rebaseType)
    item.allowManualResize && (currentItem.allowManualResize = item.allowManualResize)
    item.returnPeerModelValueBfRebase !== true && (currentItem.returnPeerModelValueBfRebase = false)
    item.slidingWindow !== false && (currentItem.slidingWindow = item.slidingWindow)
    item.slidingWindow !== false && item.slidingWindowChunks && (currentItem.slidingWindowChunks = item.slidingWindowChunks)
    if (Object.keys(currentItem).length > 0) {
      seriesSettings[item.name] = currentItem
    }
  })
  return seriesSettings
}

function configVariablesSettings(variables: Variable[]): any {
  const variablesSettings = {} as any
  variables.forEach(item => {
    const currentItem = {} as any
    item.rebaseType !== 0 && (currentItem.rebaseType = item.rebaseType)
    item.allowManualResize && (currentItem.allowManualResize = item.allowManualResize)
    if (Object.keys(currentItem).length > 0) {
      variablesSettings[item.name] = currentItem
    }
  })
  return variablesSettings
}

function configLinksSettings(links: Link[], modelBlock: ModelBlock, blockIdMap: Map<number, ModelBlock>): any {
  const linksSettings = {} as any
  links.forEach(item => {
    const linkSetting: any = {}
    if (item.matchCopy) {
      linkSetting.matchCopy = item.matchCopy
    } else {
      linkSetting.matchCopy = false
    }
    linkSetting.applyCopy = linkSetting.matchCopy // should be delete when update cores
    if (item.source === LinkSource.transmit) {
      const targetBlock = item.target?.id ? blockIdMap.get(item.target?.id) : null
      linkSetting.blockName = targetBlock ? targetBlock.name : item.target?.blockName
      const seperators: any[] = []
      if (targetBlock) {
        item.transmit?.forEach((element: TransmitData) => {
          try {
            const targetVariable = targetBlock.variables[element.label]
            if (targetVariable) {
              if (element.type === 1) {
                const seperator = {
                  name: targetVariable.name,
                  type: element.type,
                  value: (targetVariable.type === VariableType.double || targetVariable.type === VariableType.integer) ? convertToNumber(element.value) : ((typeof targetVariable.valueInput === 'string') ? normalizePath(element.value as string) : element.value)
                }
                seperators.push(seperator)
              } else {
                try {
                  const currentVariable = modelBlock.variables[element.value]
                  if (currentVariable) {
                    const seperator = {
                      name: targetVariable.name,
                      type: element.type,
                      value: currentVariable.name
                    }
                    seperators.push(seperator)
                  }
                } catch (e) {
                  console.error(e) // todo link error handling
                }
              }
            }
          } catch (e) {
            console.error(e) // todo link error handling
          }
        })
        linkSetting.separators = seperators
      }
    }
    if (Object.keys(linkSetting).length > 0) {
      linksSettings[item.name] = linkSetting
    }
  })
  return linksSettings
}

function autoCopySync(orgPath: string, disPath: string, forceOverWrite: boolean = false): boolean {
  let overwrite = true
  if (forceOverWrite) {
    overwrite = true
  } else if (existsSync(disPath)) {
    if (statSync(orgPath).mtimeMs <= statSync(disPath).mtimeMs) {
      overwrite = false
    }
  }
  try {
    copySync(orgPath, disPath, { overwrite: overwrite })
  } catch (e) {
    console.log(e)
    return false
  }
  return overwrite
}

function configProducts(masters: AnchorProduct[]): ProductMap {
  return masters.reduce((newObj, item) => {
    Object.values(item.products).forEach(iter => {
      newObj.prodCodeMappings[iter.name] = item.id.toString()
      newObj.prodIdMappings[item.id.toString()] = item.name
    })
    return newObj
  }, <ProductMap>{ prodCodeMappings: {}, prodIdMappings: {} })
}
function configDataInputEntryDataType(model: Model): any {
  const EntryDataType = {
    entry_date_data: false,
    entry_t_data: false
  }
  if (model.isDateCenter) {
    if (model.dateAlignType === 'entry_date_data') {
      EntryDataType.entry_date_data = true
    } else if (model.dateAlignType === 'entry_t_data') {
      EntryDataType.entry_t_data = true
    }
  }
  return EntryDataType
}
function FordateAlignType(dataType: string) {
  let returnDataType = '_ENTRY_DATE'
  if (dataType === 'entry_date_data') {
    returnDataType = '_ENTRY_DATE'
  } else if (dataType === 'entry_t_data') {
    returnDataType = '_ENTRY_T'
  }
  return returnDataType
}
