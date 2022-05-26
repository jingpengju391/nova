
import webApis from './webapis'
if (window.apis === undefined) {
  // @ts-ignore
  window.apis = webApis.apis
} else {
  console.log('windows.apis')
}

const {
  appSettings, dataClean, dataInputs, assumptionVarPages, assumptionTable, helps, models,
  workspaces, tasks, runs, outputs, ipcRenderer, products, user
} = window.apis
export function useAppSettingsAPIs() {
  return appSettings
}
export function useDataCleanAPIs() {
  return dataClean
}
export function useDataInputsAPIs() {
  return dataInputs
}

export function useModelsAPIs() {
  return models
}

export function useWorkspacesAPIs() {
  return workspaces
}

export function useTasksAPIs() {
  return tasks
}

export function useRunsAPIs() {
  return runs
}

export function useOutputsAPIs() {
  return outputs
}

export function useIpcRenderer() {
  return ipcRenderer
}

export function useAssumptionVarPagesAPIs() {
  return assumptionVarPages
}

export function useAssumptionTableAPIs() {
  return assumptionTable
}

export function useHelpsAPIs() {
  return helps
}
export function useProductsAPIs() {
  return products
}
export function userAPIs() {
  return user
}
