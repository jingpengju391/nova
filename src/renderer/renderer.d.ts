/* eslint-disable no-unused-vars */
import { Message } from 'element-plus'
import ContextMenu from './views/components/ContextMenu'
import {
  DataInputFile, DataInputMetaItem, CsvFileBody, ModelJSON, Model,
  ModelBlock, SimplifiedModelBlock, Workspace
} from '@shared/dataModelTypes'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { ClassifyList } from '@shared/dataModelTypes/models/models'
import { Target, CpuContrast } from '@shared/dataModelTypes/runs/targets'
import { Output } from '@shared/dataModelTypes/runs/outputs'
import { Runner } from '@shared/dataModelTypes/runs/runners'
import { dataCleanSource } from '@shared/dataModelTypes/dataClean/index'
import { Projection, SimplifiedProjection, Queue } from '@shared/dataModelTypes/runs/projections'
import { taskMonit } from '@shared/dataModelTypes/tasks/index'
import { AssumptionVarPage, AssumptionVariable, AssumptionSection, FileTable } from '@shared/dataModelTypes/assumptions/assumption'
import { EnumStringMember } from '@babel/types'
import type { IpcRenderer } from 'electron'
import type LanguageServer from './formulaLanguageServer'
import { gitConfig } from '@shared/PrivateDeployment'
import { AnchorProductInterface, AnchorProductJson, AnchorProduct } from '@shared/dataModelTypes/product/products'
import { DataCleanProject } from '@shared/dataModelTypes/dataClean'
import { CodeIndex, IndexBlock } from '@shared/dataModelTypes/product/indicators'
import { AppSettings, TaskSettings, RunnerSettings } from '@shared/dataModelTypes/appSettings'
declare global {
  interface Window {
    apis: {
      appSettings: {
        app: {
          update: (fields: Partial<AppSettings>) => Promise<number>
          query: () => Promise<AppSettings>
          insert: (fields: AppSettings) => Promise<void>
        },
        task: {
          update: (fields: Partial<TaskSettings>) => Promise<number>
          query: () => Promise<TaskSettings>
          insert: (fields: TaskSettings) => Promise<void>
        },
        runner: {
          update: (fields: Partial<RunnerSettings>) => Promise<number>
          query: () => Promise<RunnerSettings>
          insert: (RunnerSettings) => Promise<void>
        },
        isAppStartedInitialValue: () => boolean
        isWin: () => boolean
      },
      ipcRenderer: IpcRenderer,
      dataClean: {
        run: (userSpace: string) => Promise<any>
        readCsvFile: (filePath: string) => Promise<CsvFileBody>
        readTxtFile: (filePath: string) => Promise<any>
        runDataClean: (dataCleanProject: any) => Promise<any>
        db: {
          checkDataNavigationNameExists: (navName: string) => Promise<boolean>
          insertDataCleanSource: (dataSource: any, workspaceId: number) => Promise<number>
          insertDataCleanSourceImpot: (params: any[], workspaceId: number) => Promise<number[]>
          updateDataCleanSourceImpot: (params: any[], workspaceId: number) => Promise<number[]>
          queryAllDataCleanSources: (workspaceId: number) => Promise<any>
          queryDataCleanSource: (id: number) => Promise<any>
          deleteDataCleanSource: (name: string) => Promise<any>
          insertDataCleanProjects: (dataCleanProject: DataCleanProject) => Promise<number>
          queryDataCleanProjects: (workspaceId: number) => Promise<DataCleanProject[]>
          deleteDataCleanProjects: (id: number) => Promise<number>
          deleteDataCleanSourceByIds: (ids: number[]) => Promise<number[]>
          updateDataCleanProjects: (dataCleanProject: any) => Promise<number>
          updateDataCleanProjectname: (dataCleanProject: any) => Promise<number>
          renameDataLinkNavName:(curName:string, newName:string)=>Promise<any>
        }
      },
      dataInputs: {
        pathParse: (p: string) => string
        pathResolve: (p: string) => string
        pathJoin: (...args: string[]) => string
        getDocFolder: () => string
        readDirectory: (p: string) => Promise<string[]>
        labelReadDirectory: (p: string, label: string) => Promise<string[]>
        downloadFile: (p:string) => Promise<any>
        import: (relativePath: string, filePath: string) => Promise<{ canceled: boolean, dataInputFile: null | DataInputFile }>
        dataSourceImport: (relativePath: string, filePath: string) => Promise<{ canceled: boolean, dataInputFiles: null | DataInputFile[] }>
        getDataInputPreview: (filePath: string) => Promise<string[]>
        getDataInputMorePreview: (filePath: EnumStringMember, limit: number) => Promise<string[]>
        readCsvFileMeta(filePath: string): Promise<(string[])>
        readCsvFileInfo(filePath: string): Promise<(string[])>
        readCsvFile(filePath: string, limit: number = 20): Promise<CsvFileBody>
        db: {
          queryAllDataInputsOfWorkspace: (workspaceId: number) => Promise<DataInputFile[]>
          queryDataInput: (id: number) => Promise<any>
          queryDataInputs: (ids: number[]) => Promise<DataInputFile[]>
          insertDataInput: (dataInput: DataInputFile, workspaceId: number) => Promise<any>
          insertDataInputBatch: (dataInput: DataInputFile[], workspaceId: number) => Promise<any>
          deleteDataInputs: (dataInputIDs: number[]) => Promise<any>
          deleteDataInputsInModel: (modelIds: number[]) => Promise<any>
          updateDataInputName: (id: number, newName: string) => Promise<any>
          updateDataInput: (dataInput: DataInputFile) => Promise<any>
          updateDataInputBatch: (dataInput: DataInputFile[]) => Promise<number[]>
          queryAllDataInputsByModelId: (modelId: number) => Promise<any>
        }
      }
      assumptionVarPages: {
        outputExellFile(filePath: string, data: any): Promise<any>
        outputExellAppendFile(filePath: string, data: any): Promise<any>
        deleteTableFile(filePath: string): Promise<any>
        addTableFile(filePath: string): Promise<any>
        addTableDirectory(filePath: string): Promise<any>
        copyTableFile(filePath: string, newPath: string): Promise<any>
        renameTableFile(filePath: string, newPath: string): Promise<any>
        createTableDirectoryOrFile(basepath: string, path: string): Promise<any>
        createTableFile(path: string): Promise<any>
        backPath(path: string): Promise<any>
        db: {
          queryAllAssumptionVars: (ids: number[], workspaceId: number) => Promise<AssumptionVarPage[]>
          queryAssumptionVar: (id: number) => Promise<any>
          insertAssumptionVarPage: (assumptionPage: AssumptionVarPage, workspaceId: number) => Promise<any>
          deleteAssumptionVarPages: (assumptionPageIDs: number[]) => Promise<any>
          deleteAssumptionVarPagesInModel: (modelIds: number[]) => Promise<any>
          updateAssumptionVarPageName: (id: number, newName: string) => Promise<any>
          insertAssumptionVarVariable: (assumptionVariable: AssumptionVariable, workspaceId: number) => Promise<any>
          queryAllVariableVars: (workspaceId: number) => Promise<any>
          queryVariableVar: (id: number) => Promise<any>
          queryVariableVarById: (id: number) => Promise<any>
          updateAssumptionVarVariableName: (assumptionVariable: AssumptionVariable) => Promise<any>
          insertAssumptionVarSection: (assumptionSection: AssumptionSection, workspaceId: number) => Promise<any>
          querySectionVar: (id: number) => Promise<any>
          updateAssumptionSection: (assumptionSection: AssumptionSection) => Promise<any>
          deleteAssumptionSection: (assumptionSection: AssumptionSection) => Promise<any>
          deleteAssumptionVariable: (assumptionSection: AssumptionVariable) => Promise<any>
          deleteAssumptionSections: (assumptionSection: AssumptionVariable) => Promise<any>
          querySectionVarById: (sectionId: any) => Promise<any>
          deleteAssumptionVariables: (variables: number[]) => Promise<any>
          deleteAssumptionSectionByModelId: (modelId: number[]) => Promise<any>
          deleteAssumptionVariableModelId: (modelId: number[]) => Promise<any>
          querySectionVarByPageId: (pageId: number) => Promise<any>
          saveUpdatedPropertyAssumptionBindToDB: (property: any) => Promise<any>
          updatedVariableKeyValToDB: (property: AssumptionVariable[]) => Promise<any>
          insertAssumptionFileListToDB: (workspaceId: number, FileTable: FileTable[]) => Promise<any>
          queryAllFileListFromDB: (workspaceId: number) => Promise<any>
          updatedSectionsSortToDB: (assumptionSection: AssumptionSection[]) => Promise<any>
          updatedVariablesSortToDB: (assumptionSection: AssumptionVariable[]) => Promise<any>
        }
      }
      models: {
        openFileDialog: () => Promise<{ canceled: boolean, filePath: string | undefined }>
        importModelJSON: (filePath: string) => Promise<ModelJSON>
        export: () => Promise<{ canceled: boolean, filePath: string | null }>
        generateModelJSON: (blockIdFilters: number[]) => Promise<ModelJSON>
        writeModelJSONFileToDisk: (filePath: string, model: Model) => Promise<void>
        getModelCreator: () => Promise<string>
        readFileIndexPos: (filePath: string, len: number, pos: number) => Promise<void>
        db: {
          queryAllModelsOfWorkspace: (workspaceId: number) => Promise<Model[]>
          queryModel: (modelId: number) => Promise<Model>
          queryModels: (modelIds: number[]) => Promise<Model[]>
          queryProduct: (productId: number) => Promise<AnchorProductInterface>
          queryAllProduct: (workspaceId: number) => Promise<AnchorProductInterface[]>
          queryAllProductByModel: (modelId: number) => Promise<AnchorProductInterface[]>
          queryProducts: (productIds: number[]) => Promise<AnchorProductInterface[]>
          queryAllModelsOfWorkspace: (workspaceId: number) => Promise<AnchorProductInterface[]>
          importModelJSON: (modelJSON: ModelJSON) => Promise<Model>
          insertModelBlock: (modelBlock: Partial<ModelBlock>, maskId?: number) => Promise<number>
          insertModelBlocks: (fields: Partial<ModelBlock[]>, maskId?: number) => Promise<number[]>
          insertProduct: (fields: Partial<AnchorProductInterface>) => Promise<number>
          updateModelBlock: (id: number, fields: Partial<ModelBlock>, maskId?: number, updatedFormula?: boolean, updatedHeader?: boolean) => Promise<void>
          updateModelBlocks: (ids: number[], fields: Partial<ModelBlock[]>, updatedFormula?: boolean, updatedHeader?: boolean, maskId?: number) => Promise<void>
          updateProduct: (id: number, fields: Partial<AnchorProductInterface>) => Promise<void>
          updateProducts: (ids: number[], fields: Partial<AnchorProductInterface>) => Promise<void>
          insertModel: (model: Partial<Model>) => Promise<number>
          updateModelRootBlockId: (modelId: number, rootBlockId: number | null) => Promise<void>
          updateModel: (id: number, model: Partial<Model>) => Promise<void>
          copyModel: (model: Model, newModelName: string, modelBlocks: ModelBlock[]) => Promise<Model>
          copyModelBlock: (modelBlockToCopy: ModelBlock, names: string[], maskId?: number) => Promise<ModelBlock[]>
          deleteModel: (id: number) => Promise<void>
          deleteProduct: (id: number) => Promise<void>
          deleteModelBlock: (id: number, maskId?: number) => Promise<void>
          deleteModelBlocks: (ids: number[]) => Promise<void>
          deleteProperty: (id: string, type: PropertyType, block: SimplifiedModelBlock, maskId?: number) => Promise<void>
          insertModelsClassifyListToDB: (workspaceId: number, ClassifyList: ClassifyList[]) => Promise<void>
          queryAllClassifyListFromDB: (workspaceId: number) => Promise<any>
        }
      }
      workspaces: {
        createWorkspacePath(): Promise<{ canceled: boolean, workspacePath: string | null }>
        readWorkspacePath(currentPath: string, extension: string, onlyDir: boolean): Promise<{ currentPath: string, dirList: Array, fileList: Array }>
        chooseWorkspacePath(): Promise<{ canceled: boolean, workspacePath: string | null }>
        chooseAuthorizationPath(): Promise<{ canceled: boolean, workspacePath: string | null }>
        uploadWorkspacePath(formData: FormData, config: any): Promise<{ filePath: string | null }>
        uploadDirWorkspacePath(formData: FormData): Promise<{ filePath: string | null }>
        openWorkspaceInNewWindow(): void
        removeTempFolderForModel(workspaceName: string, modelName: string): Promise<boolean>
        removeTempFolder(): Promise<boolean>
        deleteWorkspacePath(deletePath: string): Promise<boolean>
        db: {
          getDefaultWorkspace(): Promise<Workspace | null>
        }
      }
      tasks: {
        readConsoleFile: (src: string) => Promise<any>
        readCsvFile(filePath: string): Promise<CsvFileBody>
        openTaskListDir: (path: string) => Promise<boolean>
        run: {
          compileModel: (model: { name: string, id: number }, workspace: Workspace) => Promise<boolean>,
          stopProcess: (pid: number | undefined, uuid?: string | undefined) => Promise<boolean>,
          runProjection: (simplifiedProjection: SimplifiedProjection, workspace: Workspace) => Promise<boolean>,
          // runProjectionInSeries: (projection: Projection, workspacePath: string) => Promise<void>
        },
        db: {
          insertTaskMonitsToDB: (workspaceId: number, taskMonit: taskMonit) => Promise<any>
          queryTaskMonitsFromDB: (workspaceId: number) => Promise<any>
          deleteTaskMoniteToDB: (idArr: number[]) => Promise<any>
          updateTaskMoniteToDB: (projectionId: number, status: number) => Promise<any>
          updateTaskMoniteSubmitTimeToDB: (projectionId: number) => Promise<any>
        }
      }
      runs: {
        db: {
          queryAllTargetsOfWorkspace: (workspaceId: number) => Promise<Target[]>
          insertTarget: (target: Partial<Target>) => Promise<number>
          updateTarget: (id: number, fields: Partial<Target>) => Promise<void>
          deleteTarget: (id: number) => Promise<void>
          insertRunner: (runner: Partial<Runner>) => Promise<number>
          updateRunner: (id: number, fields: Partial<Runner>) => Promise<void>
          queryAllRunnersOfWorkspace: (workspaceId: number) => Promise<Runner[]>
          deleteRunner: (id: number) => Promise<void>
          queryAllProjectionsOfWorkspace: (workspaceId: number) => Promise<Projection[]>
          insertProjection: (projection: Partial<Projection>) => Promise<number>
          updateProjection: (id: number, fields: Partial<Projection>) => Promise<void>
          queryQueueRunner: (queueRunnerId: number) => Promise<Queue | null>
          queryQueueRunners: (queueRunnerId: number[]) => Promise<Queue | null>
          deleteProjection: (id: number) => Promise<void>
          insertQueueRunner: (queueRunner: Partial<Queue>) => Promise<number>
          updateQueueRunner: (id: number, fields: Partial<Queue>) => Promise<void>
          queryProjectionQueues: (workspaceId: number, projectionId: number, mode: string, parentId: number) => Promise<Queue[]>
          queryAllProjectionQueues: (workspaceId: number) => Promise<Queue[]>
          deleteQueueRunnerItem: (ids: number[]) => Promise<void>
          queryProjections: (ids: number[]) => Promise<Projection[]>
          queryCpusFromDB: (id: number) => Promise<CpuContrast>
        }
      }
      outputs: {
        db: {
          queryAllOutputsOfWorkspace: (workspaceId: number) => Promise<Output[]>
          insertOutput: (output: Partial<Output>) => Promise<number>
          updateOutput: (id: number, fields: Partial<Output>) => Promise<void>
          deleteOutput: (id: number) => Promise<void>
          updateOutputs: (fields: Partial<Output[]>) => Promise<void>
        }
      }
      assumptionTable: {
        importDirectory: (filePath: string | undefined) => Promise<{ result: any, canceled: boolean, dataInputDirectory: object }>
        assumptionTablleCreateDocs(src: string, dist: string, callback: void): Promise<any>
        assumptionTabllePasteShear(src: string, dist: string, callback: void): Promise<any>
        assumptionTablleDelteFileDist(src: string, callback: void): Promise<any>
        assumptionTablleDelteFile(src: string, callback: void): Promise<any>
        isExists(src: string): boolean
        isDeleteDir(src: string): Promise<any>
        clearDirWatcher(src: string)
      },
      helps: {
        readDocFile(src: string): Promise<any>
        readHelpdir(src: string): Promise<any>
        helpFileInfos(src: string): any
        readImg(src: string): Promise<any>
      },
      products: {
        indicators: {
          db: {
            insertCodeIndexes(codeIndex: CodeIndex): Promise<number>
            importCodeIndexes(codeIndexes: CodeIndex[]): Promise<{ ids: number[], updatedAt: number }>
            deleteCodeIndexesById(ids: number[]): Promise<any>
            updateCodeIndexById(codeIndex: Partial<CodeIndex>): Promise<any>
            updateCodeIndexes(codeIndexes: Partial<CodeIndex[]>): Promise<any>
            queryAllCodeIndexesOfWorkspace(workspaceId: number): Promise<any>
            queryCodeIndexById(id: number): Promise<CodeIndex>
            queryCodeIndexesByModelId(modelId: number): Promise<CodeIndex[]>
            queryCodeIndexesByCodeIndexId(codeIndexId: number): Promise<CodeIndex>
          }
        },
        products: {
          db: {
            insertMastert(master: AnchorProductJson): Promise<any>
            deleteMasterById(id: number): Promise<any>
            updateMasterById(master: Partial<AnchorProductJson>): Promise<any>
            queryAllMasterOfWorkspace(workspaceId: number): Promise<AnchorProduct[]>
          }
        }
      },
      initializeWorkspace: (workspacePath: string, createNew: boolean) => Promise<void>
      user: {
        login(username: string, password: string, spaceNum: number): Promise<any>
        showPhysicalAddress(): Function,
        logout(): Promise<any>
      },
    }
  }

  declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $options: {
      languageServer?: LanguageServer
    }
    $message: typeof Message
    $contextMenu: typeof ContextMenu
    $confirm: (message: any, title: any, options: any) => Promise<any>
  }
}
