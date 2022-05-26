
import jsJoin from './jsPath'
import { httpPost } from './http'
// import AjaxRequest from '../../../lib/ajaxRequest'
// import socket from 'vue-socket.io'
import { io } from 'socket.io-client'
import {
  DataInputFile, DataInputMetaItem, CsvFileBody, ModelJSON, Model,
  ModelBlock, SimplifiedModelBlock, Workspace
} from '@shared/dataModelTypes'
import { AssumptionVarPage, AssumptionVariable, AssumptionSection, FileTable } from '@shared/dataModelTypes/assumptions'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { ClassifyList } from '@shared/dataModelTypes/models/models'
import { Projection, Queue, SimplifiedProjection } from '@shared/dataModelTypes/runs/projections'
import { taskMonit } from '@shared/dataModelTypes/tasks/index'
import { Target } from '@shared/dataModelTypes/runs/targets'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import { Output } from '@shared/dataModelTypes/runs/outputs'
import { omit } from '@shared/functional'
import { CodeIndex } from '@shared/dataModelTypes/product/indicators'
import { AnchorProductInterface, AnchorProductJson, AnchorProduct } from '@shared/dataModelTypes/product/products'
import { AppSettings } from '@shared/dataModelTypes/appSettings'
const baseUrl = 'https://feiyanplatform.deeplightconnect.com:3000'
// const baseUrl = 'https://127.0.0.1:3000'
export const base = baseUrl
// const ajaxRequest = new AjaxRequest(baseUrl)
let socketIo: any = null
let userSpace: string
const webApis = {
  apis: {
    appSettings: {
      app: {
        update: async (fields: Partial<AppSettings>) => {
          return await httpPost(baseUrl + '/settings/app/update', { fields })
        },
        query: async () => {
          return await httpPost(baseUrl + '/settings/app/query', {})
        }
      },
      task: {
        update: async (fields: Partial<AppSettings>) => {
          return await httpPost(baseUrl + '/settings/task/update', { fields })
        },
        query: async () => {
          return await httpPost(baseUrl + '/settings/task/query', {})
        }
      },
      runner: {
        update: async (fields: Partial<AppSettings>) => {
          return await httpPost(baseUrl + '/settings/runner/update', { fields })
        },
        query: async () => {
          return await httpPost(baseUrl + '/settings/runner/query', {})
        }
      },
      isAppStartedInitialValue: () => {
        return false
      },
      isWin: () => {
        return true
      }
    },

    dataInputs: {
      pathParse: async (p: string) => {
        //  return path.parse(p)
        return await httpPost(baseUrl + '/get-apis/dataInputs/pathParse', { p: p })
      },
      pathResolve: async (p: string) => {
        // return path.resolve(p)
        return await httpPost(baseUrl + '/get-apis/dataInputs/pathResolve', { p: p })
      },
      pathJoin: (...args: string[]) => {
        return jsJoin(args)
      },
      readDirectory: async (p: string) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/readDirectory', { p: p })
      },
      labelReadDirectory: async (p: string, label: string) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/labelReadDirectory', { p: p, label: label })
      },
      downloadFile: async (p: string) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/downloadFile', { p: p })
      },
      import: async (relativePath: string, filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/import', { relativePath: relativePath, filePath: filePath })
      },
      getDataInputPreview: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/getDataInputPreview', { filePath: filePath })
      },
      getDataInputMorePreview: async (filePath: string, limit: number) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/getDataInputMorePreview', { filePath: filePath, limit: limit })
      },
      readCsvFileMeta: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/readCsvFileMeta', { filePath: filePath })
      },
      readCsvFileInfo: async (filePath: string) => {
        const filePath1 = await filePath
        console.log(filePath1)
        return await httpPost(baseUrl + '/get-apis/dataInputs/readCsvFileInfo', { filePath: filePath })
      },
      readCsvFile: async (filePath: string, limit: number = 20) => {
        return await httpPost(baseUrl + '/get-apis/dataInputs/readCsvFile', { filePath: filePath, limit: limit })
      },
      db: {
        queryAllDataInputsOfWorkspace: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/queryAllDataInputsOfWorkspace', { workspaceId: workspaceId })
        },
        queryDataInput: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/queryDataInput', { id: id })
        },
        queryDataInputs: async (ids: number[]) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/queryDataInputs', { ids: ids })
        },
        insertDataInput: async (dataInput: DataInputFile, workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/insertDataInput', { dataInput: dataInput, workspaceId })
        },
        insertDataInputBatch: async (dataInput: DataInputFile[]) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/insertDataInputBatch', { dataInput: dataInput })
        },
        deleteDataInputs: async (dataInputIDs: number[]) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/deleteDataInputs', { dataInputIDs: dataInputIDs })
        },
        deleteDataInputsInModel: async (modelIds: number[]) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/deleteDataInputsInModel', { modelIds: modelIds })
        },
        updateDataInputName: async (id: number, newName: string) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/updateDataInputName', { id: id, newName: newName })
        },
        updateDataInput: async (dataInput: DataInputFile) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/updateDataInput', { dataInput: dataInput })
        },
        updateDataInputBatch: async (dataInput: DataInputFile[]) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/updateDataInput', { dataInput: dataInput })
        },
        queryAllDataInputsByModelId: async (modelId: number) => {
          return await httpPost(baseUrl + '/get-apis/dataInputs/db/queryAllDataInputsByModelId', { modelId: modelId })
        }
      }

    },
    assumptionVarPages: {
      outputExellFile: async (filePath: string, data: any) => {
        return await httpPost(baseUrl + '/get-apis/assumptionVarPages/outputExellFile', { filePath: filePath, data: data })
      },
      outputExellAppendFile: async (filePath: string, data: any) => {
        return await httpPost(baseUrl + '/get-apis/assumptionVarPages/outputExellAppendFile', { filePath: filePath, data: data })
      },
      deleteTableFile: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionVarPages/deleteTableFile', { filePath: filePath })
      },
      addTableFile: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionVarPages/addTableFile', { filePath: filePath })
      },
      addTableDirectory: async (filePath: string, newPath: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionVarPages/addTableFile', { filePath: filePath, newPath: newPath })
      },
      renameTableFile: async (filePath: string, newPath: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionVarPages/renameTableFile', { filePath: filePath, newPath: newPath })
      },
      db: {
        queryAllAssumptionVars: async (ids: number[], workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/queryAllAssumptionVars', { ids: ids, workspaceId })
        },
        queryAssumptionVar: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/queryAssumptionVar', { id: id })
        },
        insertAssumptionVarPage: async (assumptionVarPage: AssumptionVarPage, workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/insertAssumptionVarPage', { assumptionVarPage, workspaceId })
        },
        deleteAssumptionVarPages: async (assumptionVarPageIDs: number[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionVarPages', { assumptionVarPageIDs })
        },
        deleteAssumptionVarPagesInModel: async (modelIds: number[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionVarPagesInModel', { modelIds: modelIds })
        },
        updateAssumptionVarPageName: async (id: number, newName: string) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/updateAssumptionVarPageName', { id: id, newName: newName })
        },
        insertAssumptionVarVariable: async (assumptionVariable: AssumptionVariable, workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/insertAssumptionVarVariable', { assumptionVariable: assumptionVariable, workspaceId })
        },
        queryAllVariableVars: async () => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/queryAllVariableVars', {})
        },
        queryVariableVar: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/queryVariableVar', { id: id })
        },
        queryVariableVarById: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/queryVariableVarById', { id: id })
        },
        updateAssumptionVarVariableName: async (assumptionVariable: AssumptionVariable) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/updateAssumptionVarVariableName', { assumptionVariable: assumptionVariable })
        },
        insertAssumptionVarSection: async (assumptionSection: AssumptionSection, workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/insertAssumptionVarSection', { assumptionSection: assumptionSection, workspaceId })
        },
        querySectionVar: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/querySectionVar', { id: id })
        },
        updateAssumptionSection: async (assumptionSection: AssumptionSection) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/updateAssumptionSection', { assumptionSection: assumptionSection })
        },
        deleteAssumptionSection: async (assumptionSection: AssumptionSection) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionSection', { assumptionSection: assumptionSection })
        },
        deleteAssumptionVariable: async (assumptionSection: AssumptionSection) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionVariable', { assumptionSection: assumptionSection })
        },
        deleteAssumptionSections: async (assumptionSection: AssumptionSection) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionSections', { assumptionSection: assumptionSection })
        },
        querySectionVarById: async (id: any) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/querySectionVarById', { id: id })
        },
        deleteAssumptionVariables: async (variables: number[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionVariables', { variables: variables })
        },
        deleteAssumptionSectionByModelId: async (modelId: number[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionSectionByModelId', { id: modelId })
        },
        deleteAssumptionVariableModelId: async (modelId: number[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/deleteAssumptionVariableModelId', { id: modelId })
        },
        querySectionVarByPageId: async (pageId: number[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/querySectionVarByPageId', { pageId: pageId })
        },
        saveUpdatedPropertyAssumptionBindToDB: async (property: any) => {
          console.log(property)
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/saveUpdatedPropertyAssumptionBindToDB', { property: property })
        },
        updatedVariableKeyValToDB: async (property: AssumptionVariable[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/updatedVariableKeyValToDB', { property: property })
        },
        insertAssumptionFileListToDB: async (workspaceId: number, FileTable: FileTable[]) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/insertAssumptionFileListToDB', { workspaceId: workspaceId, FileTable: FileTable })
        },
        queryAllFileListFromDB: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/assumptionVarPages/db/queryAllFileListFromDB', { workspaceId: workspaceId })
        }
      }

    },
    models: {
      openFileDialog: async () => {
        return await httpPost(baseUrl + '/get-apis/models/openFileDialog', {})
      },
      importModelJSON: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/models/importModelJSON', { filePath: filePath })
      },
      export: async () => {
        return await httpPost(baseUrl + '/get-apis/models/export', {})
      },
      generateModelJSON: async (fblockIdFilters: number[]) => {
        return await httpPost(baseUrl + '/get-apis/models/generateModelJSON', { fblockIdFilters: fblockIdFilters })
      },
      writeModelJSONFileToDisk: async (filePath: string, model: Model) => {
        return await httpPost(baseUrl + '/get-apis/models/writeModelJSONFileToDisk', { filePath: filePath, model: model })
      },
      getModelCreator: async () => {
        return await httpPost(baseUrl + '/get-apis/models/getModelCreator', {})
      },
      readFileIndexPos: async (filePath: string, len: number, pos: number) => {
        return await httpPost(baseUrl + '/get-apis/models/readFileIndexPos', { filePath: filePath, len: len, pos: pos })
      },

      db: {
        queryAllModelsOfWorkspace: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/queryAllModelsOfWorkspace', {
            workspaceId: workspaceId
          })
        },
        queryModel: async (modelId: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/queryModel', {
            modelId
          })
        },
        queryModels: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/queryModels', {
            workspaceId: workspaceId
          })
        },
        importModelJSON: async (modelJSON: ModelJSON) => {
          return await httpPost(baseUrl + '/get-apis/models/db/importModelJSON', { modelJSON: modelJSON })
        },
        insertModelBlock: async (modelBlock: Partial<ModelBlock>, maskId?: number) => {
          const newmodelBlock = omit(['detailedParent'], modelBlock)
          return await httpPost(baseUrl + '/get-apis/models/db/insertModelBlock', { modelBlock: newmodelBlock, maskId: maskId })
        },
        updateModelBlock: async (id: number, fields: Partial<ModelBlock>, maskId?: number, updatedFormula?: boolean, updatedHeader?: boolean) => {
          return await httpPost(baseUrl + '/get-apis/models/db/updateModelBlock', {
            id: id,
            fields: fields,
            maskId: maskId,
            updatedFormula: updatedFormula,
            updatedHeader: updatedHeader
          })
        },
        updateModelBlocks: async (ids: number[], fields: Partial<ModelBlock>, maskId?: number, updatedFormula?: boolean, updatedHeader?: boolean) => {
          return await httpPost(baseUrl + '/get-apis/models/db/updateModelBlocks', {
            ids: ids,
            fields: fields,
            updatedFormula: updatedFormula,
            updatedHeader: updatedHeader
          })
        },
        insertModel: async (model: Partial<Model>) => {
          return await httpPost(baseUrl + '/get-apis/models/db/insertModel', {
            model: model
          })
        },
        updateModel: async (id: number, fields: Partial<Model>) => {
          return await httpPost(baseUrl + '/get-apis/models/db/updateModel', {
            id: id,
            fields: fields
          })
        },
        copyModel: async (modelToCopy: Model, newModelName: string, allModelBlocks: ModelBlock[]) => {
          const newModelToCopy = omit(['detailedChildren', 'anchorProducts', 'detailedParent'], modelToCopy)
          return await httpPost(baseUrl + '/get-apis/models/db/copyModel', {
            newModelName: newModelName,
            modelToCopy: newModelToCopy,
            allModelBlocks: allModelBlocks
          })
        },
        copyModelBlock: async (modelBlockToCopy: ModelBlock, newBlockName: string, maskId?: number) => {
          const newmodelBlockToCopy = omit(['detailedChildren', 'detailedParent'], modelBlockToCopy)
          return await httpPost(baseUrl + '/get-apis/models/db/copyModelBlock', {
            modelBlockToCopy: newmodelBlockToCopy,
            newBlockName: newBlockName,
            maskId: maskId
          })
        },
        deleteModel: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/deleteModel', {
            id: id
          })
        },
        deleteModelBlock: async (id: number, maskId?: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/deleteModelBlock', {
            id: id,
            maskId: maskId
          })
        },
        deleteModelBlocks: async (ids: number[]) => {
          return await httpPost(baseUrl + '/get-apis/models/db/deleteModelBlocks', {
            ids: ids
          })
        },
        deleteProperty: async (id: string, type: PropertyType, block: SimplifiedModelBlock, maskId?: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/deleteModelBlock', {
            id: id,
            type: type,
            block: block,
            maskId: maskId
          })
        },
        insertModelsClassifyListToDB: async (workspaceId: number, ClassifyList: ClassifyList[]) => {
          return await httpPost(baseUrl + '/get-apis/models/db/insertModelsClassifyListToDB', {
            workspaceId: workspaceId,
            ClassifyList: ClassifyList
          })
        },
        queryAllClassifyListFromDB: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/models/db/queryAllClassifyListFromDB', {
            workspaceId: workspaceId
          })
        }
      }
    },
    workspaces: {
      uploadWorkspacePath: async (formData: FormData, config: any) => {
        return await httpPost(baseUrl + '/workspaces/upload', formData, config)
      },
      chooseWorkspacePath: async () => {
        return await httpPost(baseUrl + '/get-apis/workspaces/chooseWorkspacePath', {})
      },
      createWorkspacePath: async (newModelName: string | undefined) => {
        return await httpPost(baseUrl + '/get-apis/workspaces/createWorkspacePath', { newModelName })
      },
      readWorkspacePath: async (currentPath: string, extension: string, onlyDir: boolean) => {
        return await httpPost(baseUrl + '/workspaces/readWorkspacePath', { currentPath, extension, onlyDir })
      },
      openWorkspaceInNewWindow: async () => {
        return await httpPost(baseUrl + '/get-apis/workspaces/openWorkspaceInNewWindow', {})
      },
      removeTempFolderForModel: async (workspaceName: string, modelName: string) => {
        return await httpPost(baseUrl + '/get-apis/workspaces/removeTempFolderForModel', { workspaceName: workspaceName, modelName: modelName })
      },
      removeTempFolder: async () => {
        return await httpPost(baseUrl + '/get-apis/workspaces/removeTempFolder', {})
      },
      deleteWorkspacePath: async (deletePath: string) => {
        return await httpPost(baseUrl + '/workspaces/delete', { deletePath })
      },
      db: {
        getDefaultWorkspace: async () => {
          return await httpPost(baseUrl + '/get-apis/workspaces/db/getDefaultWorkspace', {})
        }
      }
    },
    tasks: {
      readConsoleFile: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/tasks/readConsoleFile', { src: src })
      },
      readCsvFile: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/tasks/readConsoleFile', { filePath: filePath })
      },
      run: {
        compileModel: async (model: { name: string, id: number }, workspace: Workspace) => {
          return await httpPost(baseUrl + '/get-apis/tasks/run/compileModel', { model: model, workspace: workspace })
        },
        stopProcess: async (pid: number | undefined, taskId?: number, uuid?: string) => {
          return await httpPost(baseUrl + '/get-apis/tasks/run/stopProcess', { pid: pid, taskId: taskId, uuid: uuid })
        },
        runProjection: async (simplifiedProjection: SimplifiedProjection, workspace: Workspace) => {
          return await httpPost(baseUrl + '/get-apis/tasks/run/runProjection', { simplifiedProjection: simplifiedProjection, workspace: workspace })
        }
        // runProjectionInSeries: async (projection: Projection, workspacePath: string) => {
        //   return await httpPost(baseUrl + '/get-apis/tasks/run/runProjectionInSeries', { projection: projection, workspacePath: workspacePath })
        // }
      },
      db: {
        insertTaskMonitsToDB: async (workspaceId: number, taskMonit: taskMonit) => {
          return await httpPost(baseUrl + '/get-apis/tasks/db/insertTaskMonitsToDB', { workspaceId: workspaceId, taskMonit: taskMonit })
        },
        queryTaskMonitsFromDB: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/tasks/db/queryTaskMonitsFromDB', { workspaceId: workspaceId })
        },
        deleteTaskMoniteToDB: async (idArr: number[]) => {
          return await httpPost(baseUrl + '/get-apis/tasks/db/deleteTaskMoniteToDB', { idArr: idArr })
        },
        updateTaskMoniteToDB: async (projectionId: number, status: number) => {
          return await httpPost(baseUrl + '/get-apis/tasks/db/updateTaskMoniteToDB', { id: projectionId, status: status })
        },
        updateTaskMoniteSubmitTimeToDB: async (projectionId: number) => {
          return await httpPost(baseUrl + '/get-apis/tasks/db/updateTaskMoniteSubmitTimeToDB', { id: projectionId })
        }
      }
    },
    runs: {
      db: {
        queryAllRunnersOfWorkspace: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/queryAllRunnersOfWorkspace', { workspaceId: workspaceId })
        },
        insertTarget: async (target: Partial<Target>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/insertTarget', { target: target })
        },
        updateTarget: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/updateTarget', { id: id })
        },
        deleteTarget: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/deleteTarget', { id: id })
        },
        insertRunner: async (runner: Partial<Runner>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/insertRunner', { runner: runner })
        },
        updateRunner: async (id: number, fields: Partial<Runner>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/updateRunner', { id: id, fields: fields })
        },
        queryAllTargetsOfWorkspace: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/queryAllTargetsOfWorkspace', { workspaceId: workspaceId })
        },
        deleteRunner: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/deleteRunner', { id: id })
        },
        queryAllProjectionsOfWorkspace: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/queryAllProjectionsOfWorkspace', { workspaceId: workspaceId })
        },
        insertProjection: async (projection: Partial<Projection>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/insertProjection', { projection: projection })
        },
        updateProjection: async (id: number, fields: Partial<Projection>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/updateProjection', { id: id, fields: fields })
        },
        deleteProjection: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/deleteProjection', { id: id })
        },
        deleteQueueRunnerItem: async(ids: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/deleteQueueRunnerItem', { ids: ids })
        },
        queryProjectionQueues: async(workspaceId: number, projectionId: number, mode: string, parentId: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/queryProjectionQueues', { workspaceId: workspaceId, projectionId: projectionId, mode: mode, parentId: parentId })
        },
        insertQueueRunner: async(queueRunner: Partial<Queue>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/insertQueueRunner', { queueRunner: queueRunner })
        },
        updateQueueRunner: async(id: number, fields: Partial<Queue>) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/updateQueueRunner', { id: id, fields: fields })
        },
        queryCpusFromDB: async(id: number) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/queryCpusFromDB', { id: id })
        },
        queryProjections: async(projectionIds: number[]) => {
          return await httpPost(baseUrl + '/get-apis/runs/db/queryProjections', { projectionIds: projectionIds })
        }
      }
    },
    outputs: {
      db: {
        queryAllOutputsOfWorkspace: async (workspaceId: number) => {
          return await httpPost(baseUrl + '/get-apis/outputs/db/queryAllOutputsOfWorkspace', { workspaceId: workspaceId })
        },
        insertOutput: async (output: Partial<Output>) => {
          return await httpPost(baseUrl + '/get-apis/outputs/db/insertOutput', { output: output })
        },
        updateOutput: async (id: number, fields: Partial<Output>) => {
          return await httpPost(baseUrl + '/get-apis/outputs/db/updateOutput', { id: id, fields: fields })
        },
        deleteOutput: async (id: number) => {
          return await httpPost(baseUrl + '/get-apis/outputs/db/deleteOutput', { id: id })
        },
        updateOutputs: async (fields: Partial<Output[]>) => {
          return await httpPost(baseUrl + '/get-apis/outputs/db/updateOutputs', { fields: fields })
        }
      }
    },
    assumptionTable: {
      importDirectory: async (filePath: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/importDirectory', { filePath: filePath })
      },
      assumptionTablleCreateDocs: async (src: string, dist: string, callback: void) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/assumptionTablleCreateDocs', { src: src, dist: dist, callback: callback })
      },
      assumptionTabllePasteShear: async (src: string, dist: string, callback: void) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/assumptionTabllePasteShear', { src: src, dist: dist, callback: callback })
      },
      assumptionTablleDelteFileDist: async (src: string, callback: void) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/assumptionTablleDelteFileDist', { src: src, callback: callback })
      },
      assumptionTablleDelteFile: async (src: string, callback: void) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/assumptionTablleDelteFile', { src: src, callback: callback })
      },
      isExists: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/isExists', { src: src })
      },
      isDeleteDir: async (src: string) => {
        return new Promise((resolve: any) => {
          let socket = io(baseUrl)
          console.log(socket)
          socket.emit('get-apis/assumptionTable/isDeleteDir', { src: 'C:\\workspaces\\SampleModel\\feiyan\\SampleModel\\data\\trad.csv' })
          let data = ''
          // socket.on()用于接收服务端发来的消息
          socket.on('connect', () => {
            console.log('client connect server')
          })
          socket.on('closed', () => {
            console.log('client connect close')
          })
          socket.on('get-apis/assumptionTable/isDeleteDir', (msg) => {
            console.log('isDeleteDir-res-------', msg)
            resolve(msg)
          })
          // return true// data
          //  return await httpPost(baseUrl + '/get-apis/assumptionTable/isDeleteDir', { src: src })
        })
      },
      clearDirWatcher: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/assumptionTable/clearDirWatcher', { src: src })
      }
    },
    helps: {
      readDocFile: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/helps/readDocFile', { src: src })
      },
      readHelpdir: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/helps/readHelpdir', { src: src })
      },
      helpFileInfos: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/helps/helpFileInfos', { src: src })
      },
      readImg: async (src: string) => {
        return await httpPost(baseUrl + '/get-apis/helps/readImg', { src: src })
      }
    },
    products: {
      indicators: {
        db: {
          insertCodeIndexes: async (codeIndex: CodeIndex) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/insertCodeIndexes', { codeIndex: codeIndex })
          },
          deleteCodeIndexesById: async (ids: number[]) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/deleteCodeIndexesById', { ids: ids })
          },
          updateCodeIndexesById: async (codeIndex: Partial<CodeIndex>) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/updateCodeIndexesById', { codeIndex: codeIndex })
          },
          queryAllCodeIndexesOfWorkspace: async (workspaceId: number) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/queryAllCodeIndexesOfWorkspace', { workspaceId: workspaceId })
          },
          queryCodeIndexById: async (id: number) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/queryCodeIndexById', { id: id })
          },
          queryCodeIndexesByModelId: async (modelId: number) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/queryCodeIndexesByModelId', { modelId: modelId })
          },
          importCodeIndexes: async (codeIndexes: CodeIndex[]) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/importCodeIndexes', { codeIndexes })
          },
          updateCodeIndexes: async (codeIndexes: CodeIndex[]) => {
            return await httpPost(baseUrl + '/get-apis/products/indicators/db/updateCodeIndexes', { codeIndexes })
          }

        }
      },
      products: {
        db: {
          insertMastert: async (master: AnchorProductJson) => {
            return await httpPost(baseUrl + '/get-apis/products/products/db/insertMastert', { master: master })
          },
          deleteMasterById: async (id: number) => {
            return await httpPost(baseUrl + '/get-apis/products/products/db/deleteMasterById', { id: id })
          },
          updateMasterById: async (master: Partial<AnchorProductJson>) => {
            return await httpPost(baseUrl + '/get-apis/products/products/db/updateMasterById', { master: master })
          },
          queryAllMasterOfWorkspace: async (workspaceId: number) => {
            return await httpPost(baseUrl + '/get-apis/products/products/db/queryAllMasterOfWorkspace', { workspaceId: workspaceId })
          }
        }
      }
    },
    ipcRenderer: {
      socketInit: () => {
        socketIo = io(baseUrl)
        socketIo.on('connect', () => {
          console.log('client connect server')
          socketIo.emit('create', userSpace)
        })
      },
      on: (channel: string, listener: any) => {
        interface Msg {
          lines: string | number,
          taskId: string | number,
          code: number,
          processType: string | number,
          taskStatus: string | number
        }

        switch (channel) {
          case 'task:newPrintLines':
          case 'task:error':
          case 'task:exit':
          case 'task:updateStatus':
          case 'task:close':
          case 'task:pid':
            socketIo.on(channel, (msg:any) => {
              listener('', ...msg)
            })
            break
          // case :
          //   socketIo.on('task:exit', (msg: any) => {
          //     console.log('task:exit-------', msg)
          //     listener('', ...msg)
          //   })
          //   break
          // case :
          //   socketIo.on('task:updateStatus', (msg: any) => {
          //     console.log('task:updateStatus-------', msg)
          //     listener('', ...msg)
          //   })
          //   break
          // case :
          //   socketIo.on('task:close', (msg: any) => {
          //     console.log('task:close-------', msg)
          //     listener('', ...msg)
          //   })
          //   break
          // case :
          //   socketIo.on('task:pid', (msg: any) => {
          //     console.log('task:pid-------', msg)
          //     listener('', ...msg)
          //   })
          //   break
          case 'task:startCompiling':
            socketIo.on('task:startCompiling', (msg: any) => {
              listener()
            })
        }
      }
    },
    initializeWorkspace: async (workspacePath: string, createNew: boolean) => {
      return await httpPost(baseUrl + '/get-apis/initializeWorkspace', { workspacePath: workspacePath, createNew: createNew })
    },
    user: {
      login: async (username: string, password: string, spaceNum: number) => {
        // let res = await ajaxRequest.request( {
        //   method: 'post',
        //   url: '/user/login',
        //   data: {
        //     username: username,password:password
        //   }})
        // return res
        const res: any = await httpPost(baseUrl + '/user/login', { username: username, password: password, spaceNum })
        userSpace = res.userSpace
        return res
      },
      logout: async () => {
        return await httpPost(baseUrl + '/user/logout', { })
      }
    }
  }
}
export default webApis
