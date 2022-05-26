import type { AssumptionVarPage, AssumptionVariable, FileTable, AssumptionSection } from '@shared/dataModelTypes/assumptions'
import DBClient from '../../service/db/dbClient'
import fs from 'fs'
import { clone } from '@shared/functional'
import { ensureFile, copy } from 'fs-extra'
const path = require('path')
let assumptionVarsAPIs = {
  // username: '',
  userSpace: '',
  async outputExellFile(filePath: string, data: any): Promise<any> {
    // data = 'fdfdf,dfdfdf,fdfdfd\nfdfdfd,fdfdf,dfdfd'
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (!err) {
          resolve(true)
        } else {
          reject(err)
        }
      })
    })
  },
  async outputExellAppendFile(filePath: string, data: any): Promise<any> {
    fs.appendFile(filePath, data, err => {
      if (!err) {
        return true
      } else {
        return false
      }
    })
    return {}
  },
  async deleteTableFile(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, function (err) {
        if (!err) {
          resolve(true)
        } else {
          reject(err)
        }
      })
    })
  },
  async createTableDirectoryOrFile(basepath:string, path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      copy(basepath, path, async (a) => {
        resolve(a)
      })
    })
  },
  async createTableFile(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      ensureFile(path, (a) => {
        resolve(a)
      })
    })
  },
  backPath(pathStr: string) {
    return path.join(pathStr, '../')
  },
  async copyTableFile(filePath: string, newPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.copyFile(filePath, newPath, (err) => {
        if (!err) {
          resolve(true)
        } else {
          reject(err)
        }
      })
    })
  },
  async renameTableFile(filePath: string, newPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.rename(filePath, newPath, (err) => {
        if (!err) {
          resolve(true)
        } else {
          reject(err)
        }
      })
    })
  },
  async addTableFile(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      var createStream = fs.createWriteStream(filePath)
      createStream.end()
      resolve(true)
    })
  },
  async addTableDirectory(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.mkdir(filePath, { recursive: true }, (err) => {
        if (!err) {
          resolve(true)
        } else {
          reject(err)
        }
      })
    })
  },
  db: {
    queryAllAssumptionVars(ids: number[], workspaceId: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('assumption_page').where('workspaceID', workspaceId)
        .whereIn('modelId', ids)
        .select('id', 'name', 'modelId', 'child', 'status')
        .orderBy('modelId')
        .orderBy('id')
        .then((result: any) => {
          return result
        })
    },
    queryAssumptionVar(id: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('assumption_page')
        .where('id', id)
        .select('*')
        .first()
        .then((result: any) => {
          return result
        })
    },
    // TODO: using workspace info from vuex
    insertAssumptionVarPage(assumptionVarPage: AssumptionVarPage, workspaceId: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('assumption_page').insert({
        name: assumptionVarPage.name,
        modelId: assumptionVarPage.modelId,
        child: assumptionVarPage.child,
        status: assumptionVarPage.status,
        workspaceID: workspaceId
      }).then(([id]: any) => {
        // TODO: sqlite3 do not support returning() of knex, so the result will only has id column, and it's an array
        return id
      })
    },
    deleteAssumptionVarPages(assumptionVarPageIDs: number[]) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('assumption_page')
        .whereIn('id', assumptionVarPageIDs)
        .delete()
        .then((result: any) => {
          // TODO: sqlite3 do not support returning() of knex, so the result will only has id column
          return result
        })
    },
    deleteAssumptionVarPagesInModel(modelIds: number[]) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('assumption_page')
        .whereIn('modelId', modelIds)
        .delete()
        .then((result: any) => {
          // TODO: sqlite3 do not support returning() of knex, so the result will only has id column
          return result
        })
    },
    updateAssumptionVarPageName(id: number, newName: string) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('assumption_page')
        .where('id', id)
        .update({ name: newName })
        .then((result: any) => {
          return result
        })
    },
    insertAssumptionVarVariable(assumptionVariable: AssumptionVariable, workspaceId: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs').insert({
        name: assumptionVariable.name,
        type: assumptionVariable.type,
        describe: assumptionVariable.describe,
        source: assumptionVariable.source,
        sectionKey: assumptionVariable.sectionKey,
        sectionVal: assumptionVariable.sectionVal,
        pageId: assumptionVariable.pageId,
        modelId: assumptionVariable.modelId,
        workspaceID: workspaceId,
        sort: assumptionVariable.sort
      }).then(([id]: any) => {
        return id
      })
    },
    async updatedVariableKeyValToDB(property: AssumptionVariable[]) {
      const params = JSON.parse(JSON.stringify(property))
      return await DBClient.getInstance(assumptionVarsAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          await trx('variable_inputs')
            .where('id', item.id)
            .update({
              sectionKey: item.sectionKey,
              sectionVal: item.sectionVal
            })
        }
      })
    },
    async updatedSectionsSortToDB(property: AssumptionSection[]) {
      const params = JSON.parse(JSON.stringify(property))
      return await DBClient.getInstance(assumptionVarsAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          await trx('section_inputs')
            .where('id', item.id)
            .update({
              sort: item.sort
            })
        }
      })
    },
    async updatedVariablesSortToDB(property: AssumptionVariable[]) {
      const params = JSON.parse(JSON.stringify(property))
      return await DBClient.getInstance(assumptionVarsAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          await trx('variable_inputs')
            .where('id', item.id)
            .update({
              sort: item.sort
            })
        }
      })
    },
    queryAllVariableVars(workspaceId: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs').where('workspaceID', workspaceId)
        .select('id', 'name', 'type', 'describe', 'source', 'sectionKey', 'sectionVal', 'pageId')
        .orderBy('pageId')
        .orderBy('id')
        .then((result: any) => {
          return result
        })
    },
    queryVariableVar(id: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs')
        .where('pageId', id)
        .select('*')
        .orderBy('sort')
        .then((result: any) => {
          return result
        })
    },
    queryVariableVarById(id: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs')
        .where('id', id)
        .select('*')
        .then((result: any) => {
          return result
        })
    },
    updateAssumptionVarVariableName(assumptionVariable: AssumptionVariable) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs')
        .where('id', assumptionVariable.id)
        .update({
          name: assumptionVariable.name,
          type: assumptionVariable.type,
          describe: assumptionVariable.describe,
          source: assumptionVariable.source,
          sectionKey: assumptionVariable.sectionKey,
          sectionVal: assumptionVariable.sectionVal
        })
        .then((result: any) => {
          return result
        })
    },
    insertAssumptionVarSection(assumptionSection: AssumptionSection, workspaceId: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs').insert({
        value: assumptionSection.value,
        label: assumptionSection.label,
        pageId: assumptionSection.pageId,
        modelId: assumptionSection.modelId,
        status: assumptionSection.status,
        sort: assumptionSection.sort,
        workspaceID: workspaceId
      }).then(([id]: any) => {
        return id
      })
    },
    querySectionVar(id: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs')
        .where('pageId', id)
        .select('*')
        .orderBy('sort')
        .then((result: any) => {
          return result
        })
    },
    querySectionVarById(id: any) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs')
        .where('id', id)
        .select('*')
        .first()
        .then((result: any) => {
          return result
        })
    },
    updateAssumptionSection(assumptionSection: AssumptionSection) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs')
        .where('id', assumptionSection.id)
        .update({
          status: assumptionSection.status,
          label: assumptionSection.label
        })
        .then((result: any) => {
          return assumptionSection.id
        })
    },
    deleteAssumptionSection(assumptionSection: AssumptionSection) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs')
        .where('id', assumptionSection.id)
        .delete()
        .then((result: any) => {
          return assumptionSection.id
        })
    },
    deleteAssumptionVariable(assumptionSection: AssumptionVariable) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs')
        .where('id', assumptionSection.id)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    deleteAssumptionSections(sectionIds: number[]) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs')
        .whereIn('id', sectionIds)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    deleteAssumptionVariables(assumptionSection: number[]) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs')
        .whereIn('id', assumptionSection)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    deleteAssumptionSectionByModelId(id: number[]) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('section_inputs')
        .whereIn('modelId', id)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    deleteAssumptionVariableModelId(id: number[]) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('variable_inputs')
        .whereIn('modelId', id)
        .delete()
        .then((result: any) => {
          return result
        })
    },
    async saveUpdatedPropertyAssumptionBindToDB(property: any) {
      const params = JSON.parse(JSON.stringify(property))
      return await DBClient.getInstance(assumptionVarsAPIs.userSpace).transaction(async trx => {
        for (let i = 0; i < params.length; i++) {
          const item = params[i]
          await trx('blocks')
            .where('id', item.blockId)
            .update({ variables: JSON.stringify(item.variables) })
        }
      })
    },
    async insertAssumptionFileListToDB(workspaceId: number, FileTable: FileTable[]) {
      return await DBClient.getInstance(assumptionVarsAPIs.userSpace)('models').where('id', workspaceId).update({
        fileList: JSON.stringify(FileTable)
      })
    },
    queryAllFileListFromDB(workspaceId: number) {
      return DBClient.getInstance(assumptionVarsAPIs.userSpace)('models').where('workspaceId', workspaceId)
        .select('fileList')
        .then((results: any) => {
          const isWin = process.platform === 'win32'
          const reArr: any = []
          results.map((item: any) => {
            if (item.fileList != null) {
              item.fileList = JSON.parse(item.fileList)

              item.fileList.map((file: any) => {
                // file = JSON.parse(file)
                const path = isWin
                  ? file.path.replace(/\//g, '\\')
                  : file.path.replace(/\\/g, '/')

                file.path = path
                reArr.push(file)
              })
            }
          })
          return reArr
        })
    }
  }
}

export default assumptionVarsAPIs
