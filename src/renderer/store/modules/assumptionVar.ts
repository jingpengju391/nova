import { ModuleOption } from '../definition'
import { useAssumptionVarPagesAPIs } from '@/hooks/apis'
import { addModelsToDataSourceAndNaviTree, deletionAssociationByPageId } from './assumptionVarDataSource'
import { tableColumnWidth, copySection, CheckedHalflimiter } from '@shared/dataModelTypes/assumptions'
import modelsDataSource from './modelsDataSource'
import { PropertyType } from '@shared/dataModelTypes/models/helpers'
import { getPropertyType } from '@/utils'
import { clone } from '@shared/functional'
import { NaviNodeIdDelimiter } from '@shared/dataModelTypes/models/models'
import store from '../index'

import type {
  AssumptionVarPage,
  SimplifiedModel,
  AssumptionVariable,
  AssumptionSection,
  fieldTypes
} from '@shared/dataModelTypes/assumptions'
import masterDataSource from './masterDataSource'
import { getCurrentModelBlockModelId } from '../baseModules'
interface State {
  pages: AssumptionVarPage[]
  currentAssumptionModelNode: AssumptionVarPage | undefined
  variable: AssumptionVariable[]
  section: AssumptionSection[]
  currVariable: AssumptionVariable
  tableData: object[]
  tableColumn: object[]
  PropertyModelNode: object[]
  hideAssumptionView: boolean
  hideConsole: boolean
  printLines: string[]
  currentCopySection: copySection
  isAddSectionInputs: boolean,
  currentCopyVariable:any
}

interface Getters {
  pages: AssumptionVarPage[]
  variable: AssumptionVariable[]
  section: AssumptionSection[]
  currVariable: AssumptionVariable
  gTableData: object[]
  gTableColumn: object[]
  gPropertyModelNode: object[]
  gettersHideAssumptionView: boolean
  gettersHideConsole: boolean
  gettersPrintLines: string[]
  gettersCurrentCopySection: copySection
}

interface Mutations {
  addAssumptionVarPages: AssumptionVarPage[]
  recoverAssumptionVarPages: AssumptionVarPage[]
  deleteAssumptionVarPages: string[]
  updateAssumptionVarPageName: Partial<AssumptionVarPage>
  addVariableInputs: AssumptionVariable[]
  queryVariableInputs: AssumptionVariable[]
  updateVariableInputs: Partial<AssumptionVariable>
  addVariableField: fieldTypes
  deleteVariableField: fieldTypes
  deleteVariableInputs: Partial<AssumptionVariable>
  addSectionInputs: AssumptionSection
  updateSectionInputs: AssumptionSection
  rollBackSectionInputs: AssumptionSection[]
  deleteSectionInputs: Partial<AssumptionSection>
  deleteSectionsInputs: AssumptionSection[]
  addCurrVariable: Partial<AssumptionVariable>
  addTableData: {}
  addTableColumn: {}
  addPropertyModelNode: object[]
  toggleAssumptionViewDisplay: void
  toggleConsoleDisplay: void
  filterAssumptionVarPagesById: void
  filterAssumptionVarSectionById: void
  setCurrentCopySection: copySection
  addSectionDisabled: boolean
  setCurrentCopyVariable: copySection
  updateCurrentAssumptionModelNode: AssumptionVarPage
}

interface Actions {
  addAssumptionVarPageWithDBSync: (payload: AssumptionVarPage) => Promise<any>
  deleteAssumptionVarPagesWithDBSync: (dataInputIDs: number[]) => Promise<any>
  recoverAssumptionVarPagesFromDB: (ids: number[]) => Promise<any>
  updateAssumptionVarPageWithDBSync: (payload: AssumptionVarPage) => Promise<any>
  rollBackAssumptionVarPageName: (id: number) => Promise<any>
  addVariableInputsWithDBSync: (payload: Partial<AssumptionVariable>) => Promise<any>
  updateVariableInputsWithDBSync: (payload: Partial<AssumptionVariable>) => Promise<any>
  deleteVariableInputsWithDBSync: (payload: Partial<AssumptionVariable>) => Promise<any>
  addVariableFieldWithDBSync: (payload: fieldTypes) => Promise<any>
  updateBlockVariableWithDBSync: (payload: object[]) => Promise<any>
  addSectionInputsWithDBSync: (payload: AssumptionSection) => Promise<any>
  updateSectionInputsWithDBSync: (payload: AssumptionSection) => Promise<any>
  deleteSectionInputsWithDBSync: (payload: Partial<AssumptionSection>) => Promise<any>
  deleteSectionsInputsWithDBSync: (payload: number[]) => Promise<any>
  rollBackAssumptionVarVariableName: (payload: AssumptionVariable) => Promise<any>
  rollBackAssumptionVarSectionName: (payload: AssumptionSection) => Promise<any>
  addTableDataAsync: (obj: object) => void,
  addTableColumnAsync: (obj: object) => void
  addPropertyModelNodeAsync: (obj: number) => void
  rollBackAssumptionVarVariableById: (variableId: number) => Promise<any>
  rollBackAssumptionSectionFromDB: (id: number) => Promise<any>
  updateVariablesWithDBSync:(payload: AssumptionVariable[]) => Promise<any>
  updateSectionsWithDBSync:(payload: AssumptionSection[]) => Promise<any>
}
export type AssumptionVarsModule = ModuleOption<State, Getters, Mutations, Actions>;

const mod: AssumptionVarsModule = {
  namespaced: true,
  state: {
    pages: [] as AssumptionVarPage[],
    currentAssumptionModelNode: undefined,
    variable: [] as AssumptionVariable[],
    section: [
      {
        label: '名称',
        value: 'name',
        width: tableColumnWidth
      }
    ] as AssumptionSection[],
    currVariable: {},
    tableData: [],
    tableColumn: [
      {
        prop: 'name',
        label: '名称',
        minWidth: '150'
      },
      {
        prop: 'Section',
        label: '情景',
        minWidth: '150'
      }
    ],
    PropertyModelNode: [],
    hideAssumptionView: false,
    hideConsole: true,
    printLines: ['no message!'],
    currentCopySection: {} as copySection,
    isAddSectionInputs: true,
    currentCopyVariable: null
  },
  getters: {
    pages: state => state.pages,
    variable: state => state.variable,
    section: state => state.section,
    currVariable: state => state.currVariable,
    gettersCurrentCopySection: state => state.currentCopySection,
    gTableData(state): object[] {
      return state.tableData
    },
    gTableColumn(state): object[] {
      return state.tableColumn
    },
    gPropertyModelNode(state): object[] {
      return state.PropertyModelNode
    },
    gettersHideAssumptionView(state): boolean {
      return state.hideAssumptionView
    },
    gettersHideConsole(state): boolean {
      return state.hideConsole
    },
    gettersPrintLines(state): string[] {
      return state.printLines
    }
  },
  mutations: {
    addAssumptionVarPages: (state, dataInputs) => {
      state.pages.push(...dataInputs)
    },
    recoverAssumptionVarPages: (state, dataInputs) => {
      state.pages.length = 0
      // dataInputs
      state.pages.push(...dataInputs)
    },
    deleteAssumptionVarPages: (state, dataInputIDs) => {
      state.pages = state.pages.filter(f => !dataInputIDs.includes(f.id))
    },
    filterAssumptionVarPagesById: (state) => {
      state.pages = state.pages.filter(f => f.id)
    },
    filterAssumptionVarSectionById: (state) => {
      state.section.pop()
    },
    updateAssumptionVarPageName: (state, update) => {
      const index = state.pages.findIndex(f => f.id === update.id!)
      if (index > -1) {
        state.pages[index].name = update.name!
      }
    },
    addVariableInputs: (state, dataInputs) => {
      state.variable.push(...dataInputs)
    },
    queryVariableInputs: (state, dataInputs) => {
      state.variable.length = 0
      state.variable.push(...dataInputs)
    },
    updateVariableInputs: (state, dataInputIDs) => {
      const subscript = state.variable.findIndex(item => item.id === dataInputIDs.id)
      if (subscript > -1) {
        state.variable[subscript] = dataInputIDs
      }
    },
    deleteVariableInputs: (state, update) => {
      const subscript = state.variable.findIndex(item => item.id === update.id)
      state.variable.splice(subscript, 1)
    },
    addSectionInputs: (state, dataInputs) => {
      const subscript = state.section.findIndex(item => !item.id)
      if (subscript === -1) {
        state.section.push(dataInputs)
      } else {
        state.section[subscript] = { ...state.section[subscript], ...dataInputs, isEdit: false }
      }
    },
    rollBackSectionInputs: (state, dataInputIDs) => {
      state.section.length = 0
      state.section.push(...dataInputIDs)
    },
    updateSectionInputs: (state, dataInputIDs) => {
      const subscript = state.section.findIndex(item => item.id === dataInputIDs.id)
      state.section[subscript] = { ...state.section[subscript], ...dataInputIDs, isEdit: false }
    },
    deleteSectionInputs: (state, update) => {
      const subscript = state.section.findIndex(item => item.id === update.id)
      state.section.splice(subscript, 1)
    },
    deleteSectionsInputs: (state, update) => {
      const subscript = state.section.findIndex((item: any) => item.id === update)
      // state.section.length = 1
    },
    addVariableField: (state, data) => {
      state.variable.forEach(item => {
        if (item.id === data.id) item = data
      })
    },
    deleteVariableField: (state, data) => {

    },
    addCurrVariable: (state, data) => {
      state.currVariable = data
    },
    addTableData(state, obj) {
      state.tableData.push(obj)
    },
    addTableColumn(state, obj) {
      state.tableColumn.push(obj)
    },
    addPropertyModelNode(state, obj) {
      state.PropertyModelNode = obj
    },
    toggleAssumptionViewDisplay(state) {
      state.hideAssumptionView = !state.hideAssumptionView
    },
    toggleConsoleDisplay(state) {
      state.hideConsole = !state.hideConsole
    },
    setCurrentCopySection(state, obj) {
      state.currentCopySection = obj
    },
    setCurrentCopyVariable(state, obj) {
      state.currentCopyVariable = obj
    },
    addSectionDisabled(state, flag) {
      state.isAddSectionInputs = flag
    },
    updateCurrentAssumptionModelNode(state, currentNode) {
      state.currentAssumptionModelNode = currentNode
    }
  },
  actions: {
    addAssumptionVarPageWithDBSync: ({ commit, rootState }, dataInput: Partial<AssumptionVarPage>): Promise<any> => {
      const U = JSON.parse(JSON.stringify(dataInput))
      return useAssumptionVarPagesAPIs().db.insertAssumptionVarPage(U, rootState.workspace.id).then((id: number) => {
        U.id = id
        commit('addAssumptionVarPages', [U])
      })
    },
    deleteAssumptionVarPagesWithDBSync: ({ commit }, payload: any): Promise<any> => {
      const params = clone(payload)
      const ids = params.map((item: any) => item.id)
      return useAssumptionVarPagesAPIs().db.deleteAssumptionVarPages(ids).then((res) => {
        commit('deleteAssumptionVarPages', ids)

        deletionAssociationByPageId(params)
      })
    },
    recoverAssumptionVarPagesFromDB: ({ commit, rootState }, ids: number[]): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.queryAllAssumptionVars(ids, rootState.workspace.id).then((dataInputs: AssumptionVarPage[]) => {
        if (dataInputs.length && dataInputs.length > 0) {
          commit('recoverAssumptionVarPages', dataInputs)
        }
        return dataInputs
      })
    },
    rollBackAssumptionSectionFromDB: ({ commit }, id: number): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.querySectionVarById(id).then((section: AssumptionVarPage) => {
        return section
      })
    },
    updateAssumptionVarPageWithDBSync: ({ commit }, payload: AssumptionVarPage): Promise<any> => {
      // // 修改成id:number
      // const id:number = parseInt(payload.id.split(NaviNodeIdDelimiter)[1])
      return useAssumptionVarPagesAPIs().db.updateAssumptionVarPageName(payload.id, payload.name).then(() => {
      })
    },
    rollBackAssumptionVarPageName: ({ commit }, id: number): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.queryAssumptionVar(id).then((result: AssumptionVarPage) => {
        return result
      })
    },
    addVariableInputsWithDBSync: ({ commit, rootState }, payload: AssumptionVariable): Promise<any> => {
      const U = { ...JSON.parse(JSON.stringify(payload)), sort: new Date().getTime() }
      return useAssumptionVarPagesAPIs().db.insertAssumptionVarVariable(U, rootState.workspace.id).then((id: number) => {
        commit('addVariableInputs', [{ ...U, id }])
        return id
      })
    },
    updateVariableInputsWithDBSync: ({ commit }, payload: AssumptionVariable): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.updateAssumptionVarVariableName(payload).then(() => {
        commit('updateVariableInputs', payload)
      })
    },
    deleteVariableInputsWithDBSync: ({ commit }, payload: AssumptionVariable): Promise<any> => {
      const U = JSON.parse(JSON.stringify(payload))
      return useAssumptionVarPagesAPIs().db.deleteAssumptionVariable(U).then((res) => {
        commit('deleteVariableInputs', U)
      })
    },
    rollBackAssumptionVarVariableName: ({ commit }, payload: any): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.queryVariableVar(payload.id).then((result: AssumptionVariable[]) => {
        commit('queryVariableInputs', result)
      })
    },
    rollBackAssumptionVarVariableById: ({ commit }, payload: number): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.queryVariableVarById(payload)
    },
    addSectionInputsWithDBSync: ({ commit, rootState }, payload: AssumptionSection): Promise<any> => {
      const U = JSON.parse(JSON.stringify(payload))
      return useAssumptionVarPagesAPIs().db.insertAssumptionVarSection(U, rootState.workspace.id).then((id: number) => {
        commit('addSectionInputs', { ...payload, id })
      })
    },
    rollBackAssumptionVarSectionName: ({ commit }, payload: any): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.querySectionVar(payload.id).then((result: AssumptionSection[]) => {
        commit('rollBackSectionInputs', result)
        return result
      })
    },
    deleteSectionsInputsWithDBSync: ({ commit }, payload: number[]): Promise<any> => {
      return useAssumptionVarPagesAPIs().db.deleteAssumptionSections(payload).then((result: AssumptionSection[]) => {
        commit('deleteSectionsInputs', result)
      })
    },
    updateSectionInputsWithDBSync: ({ commit }, payload: AssumptionSection): Promise<any> => {
      const U = JSON.parse(JSON.stringify(payload))
      return useAssumptionVarPagesAPIs().db.updateAssumptionSection(U).then((id) => {
        commit('updateSectionInputs', payload)
      })
    },
    deleteSectionInputsWithDBSync: ({ commit }, payload: Partial<AssumptionSection>): Promise<any> => {
      const U = JSON.parse(JSON.stringify(payload))
      return useAssumptionVarPagesAPIs().db.deleteAssumptionSection(U).then((id) => {
        commit('deleteSectionInputs', U)
      })
    },
    addVariableFieldWithDBSync: ({ commit }, payload: fieldTypes): Promise<any> => {
      return new Promise((resolve, reject) => {
        // 模拟数据
        const res = {
        }
        resolve(res)
      }).then(res => {
        commit('addVariableField', payload)
      })
    },
    updateBlockVariableWithDBSync: ({ commit }, payload: object[]): Promise<any> => {
      const params: any = []
      const currentProperty = store.state.models.currentProperty
      const currentModelNode = store.state.models.currentModelNode!
      payload.forEach((item: any) => {
        // CheckedHalflimiter
        const propertyType = getPropertyType(item.children[0])
        const properties = modelsDataSource.getAllClonedPropertiesOfType(propertyType, item.id)
        item.children.forEach((iter: any) => {
          iter.id = iter.id.split(CheckedHalflimiter)[0]
          const propertyToUpdate = modelsDataSource.getProperty(iter.id, PropertyType.variables, item.id)
          propertyToUpdate.assumptionBind = iter.assumptionBind
          if (currentProperty && iter.id === currentProperty?.id && item.modelId === currentModelNode.id) {
            currentProperty.assumptionBind = iter.assumptionBind
          }
          (properties[iter.id] as any) = clone(iter)
        })
        params.push({
          blockId: item.id,
          variables: properties
        })
      })
      const modelId = getCurrentModelBlockModelId()
      const products = masterDataSource.getCompleteMastersByModelId(modelId as number)
      return useAssumptionVarPagesAPIs().db.saveUpdatedPropertyAssumptionBindToDB(params).then(r => {
        payload.forEach((item: any) => {
          const propertyType = getPropertyType(item.children[0])
          item.children.forEach((iter: any) => {
            const newFields = new Map<string, any>()
            newFields.set('assumptionBind', clone(iter.assumptionBind))
            newFields.forEach((newValue, fieldKey) => {
              modelsDataSource.getCompleteModelBlock(item.id)!.updatePropertyForKey(
                propertyType, iter.id, fieldKey, newValue, products)
            })
          })
        })
      })
    },
    async addTableDataAsync({ commit }, obj: object) {
      commit('addTableData', obj)
    },
    async addTableColumnAsync({ commit }, obj: object) {
      commit('addTableColumn', obj)
    },
    async addPropertyModelNodeAsync({ commit }, id: number) {
      const newNavTree = addModelsToDataSourceAndNaviTree(id)
      commit('addPropertyModelNode', newNavTree)
      return newNavTree
    },
    updateVariablesWithDBSync({ commit }, variables: AssumptionVariable[]) {
      return useAssumptionVarPagesAPIs().db.updatedVariablesSortToDB(variables)
    },
    updateSectionsWithDBSync({ commit }, sections: AssumptionSection[]) {
      return useAssumptionVarPagesAPIs().db.updatedSectionsSortToDB(sections)
    }
  }
}
export default mod
