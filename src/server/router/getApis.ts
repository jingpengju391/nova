import getApis from '../controller/getApis'

import Router from 'koa-router'
import dataInputs from '../controller/dataInputs'
import models from '../controller/models'
// const Router = require('koa-router')
import runs from '../controller/runs'
import outputs from '../controller/outputs'
import assumptionVarPages from '../controller/assumptionVarPages'
import tasks from '../controller/tasks'
import assumptionTable from '../controller/assumptionTable'
import help from '../controller/help/index'
import workspaces from '../controller/workspaces'
import products from '../controller/products'

console.log('进入了getApis.ts')

const router = new Router()
// const getApis = require('../controller/getApis')
router.get('/', async (ctx) => {
  console.log('查询参数', ctx.query)
  ctx.body = '获取用户列表'
})
  .post('/initializeWorkspace', getApis.initializeWorkspace)

  .post('/workspaces/createWorkspacePath', getApis.createWorkspacePath)
  .post('/workspaces/chooseWorkspacePath', getApis.chooseWorkspacePath)
  .post('/workspaces/removeTempFolderForModel', workspaces.removeTempFolderForModel)
  .post('/workspaces/removeTempFolder', workspaces.removeTempFolder)
  .post('/workspaces/upload', workspaces.upload)
  // .post('/workspaces/uploadDir', workspaces.uploadDir)

  .post('/dataInputs/db/queryAllDataInputsOfWorkspace', dataInputs.queryAllDataInputsOfWorkspace)
  .post('/dataInputs/db/queryAllDataInputsByModelId', dataInputs.queryAllDataInputsByModelId)
  .post('/dataInputs/db/queryDataInput', dataInputs.queryDataInput)
  .post('/dataInputs/db/queryDataInputs', dataInputs.queryDataInputs)
  .post('/dataInputs/db/insertDataInput', dataInputs.insertDataInput)
  .post('/dataInputs/db/insertDataInputBatch', dataInputs.insertDataInputBatch)
  .post('/dataInputs/db/deleteDataInputs', dataInputs.deleteDataInputs)
  .post('/dataInputs/db/deleteDataInputsInModel', dataInputs.deleteDataInputsInModel)
  .post('/dataInputs/db/updateDataInputName', dataInputs.updateDataInputName)
  .post('/dataInputs/db/updateDataInput', dataInputs.updateDataInput)
  .post('/dataInputs/db/updateDataInputBatch', dataInputs.updateDataInputBatch)

  .post('/dataInputs/pathJoin', dataInputs.pathJoin)
  .post('/dataInputs/readCsvFileInfo', dataInputs.readCsvFileInfo)
  .post('/dataInputs/pathResolve', dataInputs.pathResolve)
  .post('/dataInputs/pathParse', dataInputs.pathParse)
  .post('/dataInputs/pathJoin', dataInputs.pathJoin)
  .post('/dataInputs/getDocFolder', dataInputs.getDocFolder) // 这个接口bs架构不用
  .post('/dataInputs/readDirectory', dataInputs.readDirectory)
  .post('/dataInputs/labelReadDirectory', dataInputs.labelReadDirectory)
  .post('/dataInputs/downloadFile', dataInputs.downloadFile)// bs下载文件
  .post('/dataInputs/import', dataInputs.import) // 上传功能放后面做
  .post('/dataInputs/getDataInputPreview', dataInputs.getDataInputPreview)
  .post('/dataInputs/getDataInputMorePreview', dataInputs.getDataInputMorePreview)
  .post('/dataInputs/readCsvFileMeta', dataInputs.readCsvFileMeta)
  .post('/dataInputs/readCsvFile', dataInputs.readCsvFile)

  .post('/models/openFileDialog', models.openFileDialog)
  .post('/models/importModelJSON', models.importModelJSON)
  .post('/models/writeModelJSONFileToDisk', models.writeModelJSONFileToDisk)
  .post('/models/getModelCreator', models.getModelCreator)
  .post('/models/readFileIndexPos', models.readFileIndexPos)
  .post('/models/db/queryAllModelsOfWorkspace', models.queryAllModelsOfWorkspace)
  .post('/models/db/queryAllClassifyListFromDB', models.queryAllClassifyListFromDB)
  .post('/models/db/queryModel', models.queryModel)
  .post('/models/db/queryModels', models.queryModels)
  .post('/models/db/queryProduct', models.queryProduct)
  .post('/models/db/queryProducts', models.queryProducts)
  .post('/models/db/queryAllProduct', models.queryAllProduct)
  .post('/models/db/queryAllProductByModel', models.queryAllProductByModel)
  .post('/models/db/queryModelWithItsBlocks', models.queryModelWithItsBlocks)
  .post('/models/db/importModelJSON', models.dbImportModelJSON)
  .post('/models/db/insertModelBlock', models.insertModelBlock)
  .post('/models/db/insertProduct', models.insertProduct)
  .post('/models/db/updateModel', models.updateModel)
  .post('/models/db/queryModelBlock', models.queryModelBlock)
  .post('/models/db/updateModelBlock', models.updateModelBlock)
  .post('/models/db/updateProduct', models.updateProduct)
  .post('/models/db/updateModelBlocks', models.updateModelBlocks)
  .post('/models/db/updateProducts', models.updateProducts)
  .post('/models/db/insertModel', models.insertModel)
  .post('/models/db/copyModel', models.copyModel)
  .post('/models/db/copyModelBlock', models.copyModelBlock)
  .post('/models/db/deleteModel', models.deleteModel)
  .post('/models/db/deleteProduct', models.deleteProduct)
  .post('/models/db/deleteModelBlock', models.deleteModelBlock)
  .post('/models/db/deleteModelBlocks', models.deleteModelBlocks)
  .post('/models/db/insertModelsClassifyListToDB', models.insertModelsClassifyListToDB)

  .post('/runs/db/queryAllTargetsOfWorkspace', runs.queryAllTargetsOfWorkspace)
  .post('/runs/db/queryAllProjectionsOfWorkspace', runs.queryAllProjectionsOfWorkspace)
  .post('/runs/db/queryAllRunnersOfWorkspace', runs.queryAllRunnersOfWorkspace)

  .post('/runs/db/queryTargets', runs.queryTargets)
  .post('/runs/db/insertTarget', runs.insertTarget)
  .post('/runs/db/updateTarget', runs.updateTarget)
  .post('/runs/db/deleteTarget', runs.deleteTarget)
  .post('/runs/db/queryAllRunnersOfModel', runs.queryAllRunnersOfModel)
  .post('/runs/db/queryRunner', runs.queryRunner)
  .post('/runs/db/queryRunners', runs.queryRunners)
  .post('/runs/db/insertRunner', runs.insertRunner)
  .post('/runs/db/updateRunner', runs.updateRunner)
  .post('/runs/db/deleteRunner', runs.deleteRunner)
  .post('/runs/db/queryProjection', runs.queryProjection)
  .post('/runs/db/queryProjections', runs.queryProjections)
  .post('/runs/db/insertProjection', runs.insertProjection)
  .post('/runs/db/updateProjection', runs.updateProjection)
  .post('/runs/db/deleteProjection', runs.deleteProjection)
  .post('/runs/db/deleteQueueRunnerItem', runs.deleteQueueRunnerItem)
  .post('/runs/db/queryProjectionQueues', runs.queryProjectionQueues)
  .post('/runs/db/insertQueueRunner', runs.insertQueueRunner)
  .post('/runs/db/updateQueueRunner', runs.updateQueueRunner)
  .post('/runs/db/queryCpusFromDB', runs.queryCpusFromDB)

  .post('/outputs/db/queryAllOutputsOfWorkspace', outputs.queryAllOutputsOfWorkspace)
  .post('/outputs/db/queryOutputs', outputs.queryOutputs)
  .post('/outputs/db/insertOutput', outputs.insertOutput)
  .post('/outputs/db/updateOutput', outputs.updateOutput)
  .post('/outputs/db/deleteOutput', outputs.deleteOutput)
  .post('/outputs/db/updateOutputs', outputs.updateOutputs)

  .post('/assumptionVarPages/db/queryAllFileListFromDB', assumptionVarPages.queryAllFileListFromDB)
  .post('/assumptionVarPages/db/queryAllAssumptionVars', assumptionVarPages.queryAllAssumptionVars)

  .post('/assumptionVarPages/outputExellFile', assumptionVarPages.outputExellFile)
  .post('/assumptionVarPages/outputExellAppendFile', assumptionVarPages.outputExellAppendFile)
  .post('/assumptionVarPages/deleteTableFile', assumptionVarPages.deleteTableFile)
  .post('/assumptionVarPages/copyTableFile', assumptionVarPages.copyTableFile)
  .post('/assumptionVarPages/renameTableFile', assumptionVarPages.renameTableFile)
  .post('/assumptionVarPages/addTableFile', assumptionVarPages.addTableFile)
  .post('/assumptionVarPages/addTableDirectory', assumptionVarPages.addTableDirectory)
  .post('/assumptionVarPages/db/queryAssumptionVar', assumptionVarPages.queryAssumptionVar)
  .post('/assumptionVarPages/db/insertAssumptionVarPage', assumptionVarPages.insertAssumptionVarPage)
  .post('/assumptionVarPages/db/deleteAssumptionVarPages', assumptionVarPages.deleteAssumptionVarPages)
  .post('/assumptionVarPages/db/deleteAssumptionVarPagesInModel', assumptionVarPages.deleteAssumptionVarPagesInModel)
  .post('/assumptionVarPages/db/updateAssumptionVarPageName', assumptionVarPages.updateAssumptionVarPageName)
  .post('/assumptionVarPages/db/insertAssumptionVarVariable', assumptionVarPages.insertAssumptionVarVariable)
  .post('/assumptionVarPages/db/updatedVariableKeyValToDB', assumptionVarPages.updatedVariableKeyValToDB).post('/assumptionVarPages/db/queryAllVariableVars', assumptionVarPages.queryAllVariableVars)
  .post('/assumptionVarPages/db/queryVariableVar', assumptionVarPages.queryVariableVar)
  .post('/assumptionVarPages/db/queryVariableVarById', assumptionVarPages.queryVariableVarById)
  .post('/assumptionVarPages/db/updateAssumptionVarVariableName', assumptionVarPages.updateAssumptionVarVariableName)
  .post('/assumptionVarPages/db/insertAssumptionVarSection', assumptionVarPages.insertAssumptionVarSection).post('/assumptionVarPages/db/querySectionVar', assumptionVarPages.querySectionVar)
  .post('/assumptionVarPages/db/querySectionVarById', assumptionVarPages.querySectionVarById)
  .post('/assumptionVarPages/db/updateAssumptionSection', assumptionVarPages.updateAssumptionSection).post('/assumptionVarPages/db/deleteAssumptionSection', assumptionVarPages.deleteAssumptionSection).post('/assumptionVarPages/db/deleteAssumptionVariable', assumptionVarPages.deleteAssumptionVariable).post('/assumptionVarPages/db/deleteAssumptionSections', assumptionVarPages.deleteAssumptionSections).post('/assumptionVarPages/db/deleteAssumptionVariables', assumptionVarPages.deleteAssumptionVariables).post('/assumptionVarPages/db/deleteAssumptionSectionByModelId', assumptionVarPages.deleteAssumptionSectionByModelId)
  .post('/assumptionVarPages/db/deleteAssumptionVariableModelId', assumptionVarPages.deleteAssumptionVariableModelId)
  .post('/assumptionVarPages/db/saveUpdatedPropertyAssumptionBindToDB', assumptionVarPages.saveUpdatedPropertyAssumptionBindToDB)
  .post('/assumptionVarPages/db/insertAssumptionFileListToDB', assumptionVarPages.insertAssumptionFileListToDB)

  .post('/assumptionTable/isExists', assumptionTable.isExists)
  .post('/assumptionTable/isDeleteDir', assumptionTable.isDeleteDir)
  .post('/assumptionTable/importDirectory', assumptionTable.importDirectory)
  .post('/assumptionTable/assumptionTablleCreateDocs', assumptionTable.assumptionTablleCreateDocs)
  .post('/assumptionTable/assumptionTablleCreateDocs', assumptionTable.assumptionTabllePasteShear)
  .post('/assumptionTable/assumptionTablleDelteFileDist', assumptionTable.assumptionTablleDelteFileDist)
  .post('/assumptionTable/assumptionTablleDelteFile', assumptionTable.assumptionTablleDelteFile)
  .post('/assumptionTable/clearDirWatcher', assumptionTable.clearDirWatcher)

  .post('/tasks/readConsoleFile', tasks.readConsoleFile)
  .post('/tasks/readCsvFile', tasks.readCsvFile)
  .post('/tasks/db/insertTaskMonitsToDB', tasks.insertTaskMonitsToDB)
  .post('/tasks/db/queryTaskMonitsFromDB', tasks.queryTaskMonitsFromDB)
  .post('/tasks/db/deleteTaskMoniteToDB', tasks.deleteTaskMoniteToDB)
  .post('/tasks/db/updateTaskMoniteToDB', tasks.updateTaskMoniteToDB)
  .post('/tasks/db/updateTaskMoniteSubmitTimeToDB', tasks.updateTaskMoniteSubmitTimeToDB)
  .post('/tasks/run/compileModel', tasks.compileModel)
  .post('/tasks/run/stopProcess', tasks.stopProcess)
  .post('/tasks/run/runProjection', tasks.runProjection)

  .post('/helps/readDocFile', help.readDocFile)
  .post('/helps/helpFileInfos', help.helpFileInfos)
  .post('/helps/readHelpdir', help.readHelpdir)
  .post('/helps/readImg', help.readImg)

  .post('/products/indicators/db/queryCodeIndexesByModelId', products.queryCodeIndexesByModelId)
  .post('/products/indicators/db/importCodeIndexes', products.importCodeIndexes)
  .post('/products/products/db/queryAllMasterOfWorkspace', products.queryAllMasterOfWorkspace)
  .post('/products/indicators/db/updateCodeIndexes', products.updateCodeIndexes)
export default router
