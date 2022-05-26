import DBClient from '../../service/db/dbClient'
import { convertModelQueryResultToModelArray } from '../../preload/modelsAPIs/utils'
import { Knex } from 'knex'
import { join, parse } from 'path'
import { ipcRenderer } from 'electron'
import moment from 'moment'
import { DBConfigs } from '../../shared/dataModelTypes'
import UserDbClient from './userDbClient'
import modelAPIs from '../../preload/modelsAPIs'
import { ensureDirSync, removeSync, statSync, copyFileSync, existsSync } from 'fs-extra'
import settingsAPIs from '../../preload/settingsAPIs'
// import {processSlot} from '@vue/test-utils/dist/utils/compileSlots'

class DbService {
  userSpace: string
  constructor() {
    this.userSpace = ''
  }

  async initializeDB(workspacePath: string): Promise<void> {
    DBClient.initialize(this.userSpace, workspacePath)
    let dbConfigs
    if (process.env.ARCHITECTURE === 'bs') {
      const path = require('path')
      const dbConfigPaths = {
        migrationFilePath: path.join(__dirname, '../../../../db/migrations'),
        seedFilePath: path.join(__dirname, '../../../../db/seeds')
      }
      dbConfigs = dbConfigPaths
    } else {
      dbConfigs = ipcRenderer.sendSync('app:dbConfigs') as DBConfigs
    }
    const migrationConfig: Knex.MigratorConfig = {
      directory: dbConfigs.migrationFilePath
    }
    await this.backupOldVersionWorkspace(migrationConfig, workspacePath)
    const version = await DBClient.getInstance(this.userSpace).migrate.currentVersion(migrationConfig)
    await DBClient.getInstance(this.userSpace).migrate.latest(migrationConfig)
    const isAppFirstLoaded = version === 'none'
    if (isAppFirstLoaded) {
      await DBClient.getInstance(this.userSpace).seed.run({ directory: dbConfigs.seedFilePath })
    }
  }

  async backupOldVersionWorkspace(migrationConfig: Knex.MigratorConfig, workspacePath: string): Promise<void> {
    let migrateList = await DBClient.getInstance(this.userSpace).migrate.list(migrationConfig)
    // pending migrations length eq to 0
    if (migrateList[1].length !== 0) {
      let currVersion = await DBClient.getInstance(this.userSpace).migrate.currentVersion()
      let dataPath
      if (process.env.ARCHITECTURE !== 'bs') {
        dataPath = ipcRenderer.sendSync('app:userDirectory')
      } else {
        let commApi = require('../../main/communicationAPIs')
        dataPath = commApi.novaUserDirectory()
      }
      let bkDir = join(dataPath, 'db_backup')
      let prs = parse(workspacePath)
      let stamp = moment(new Date()).format('YYYY_MM_DD_HH_MM')
      let bkName = `${prs.name}_${currVersion}_${stamp}${prs.ext}`
      try {
        ensureDirSync(bkDir)
        let bkPath = join(bkDir, bkName)
        if (!existsSync(bkPath)) copyFileSync(workspacePath, bkPath)
      } catch {
        console.log('Lack permit to save backup db.')
      }
    }
  }

  async initUserDB(userName: string): Promise<void> {
    let userDataDir
    if (process.env.ARCHITECTURE !== 'bs') {
      userDataDir = ipcRenderer.sendSync('app:userDirectory')
    } else {
      let commApi = require('../../main/communicationAPIs')
      userDataDir = commApi.novaUserDirectory()
    }
    ensureDirSync(userDataDir)
    let settingsPath = join(userDataDir, 'settings.sqlite')
    let userDbConfigs
    if (process.env.ARCHITECTURE === 'bs') {
      userDbConfigs = {
        migrationFilePath: join(__dirname, '../../../../db/userMigrations')
        // seedFilePath: join(__dirname, '../../../db/userSeeds')
      }
    } else {
      userDbConfigs = ipcRenderer.sendSync('app:userDbConfigs') as DBConfigs
    }
    const migrationConfig: Knex.MigratorConfig = {
      directory: userDbConfigs.migrationFilePath
    }
    try {
      let settingsStat = statSync(settingsPath)
      // rm old setting bf 2022-03-24T03:09:31.850Z
      if (settingsStat.birthtimeMs < 1648091356940) {
        console.log('clear old settings...')
        removeSync(settingsPath)
      }
    } catch (e) {
      console.log('Init settings...')
    } finally {
      await UserDbClient.initialize(settingsPath)
      // let curSettingVersion = await UserDbClient.getInstance().migrate.currentVersion()
      // curSettingVersion !== '20220211073204' && removeSync(settingsPath)
      try {
        await this.migrateUserDbAndSaveInitSettings(migrationConfig, userName)
      } catch {}
    }
  }

  async migrateUserDbAndSaveInitSettings(migrationConfig: Knex.MigratorConfig, userName: string) {
    await UserDbClient.getInstance().migrate.latest(migrationConfig)
    let rets = await UserDbClient.getInstance()('tasks').where({ userName }).select('*')
    if (rets.length === 0) {
      await settingsAPIs.insertDefaultSettings(userName)
    }
  }

  async queryAllModelsOfWorkspace(workspaceId: number) {
    const knex = DBClient.getInstance(this.userSpace)
    const results = await knex('models').select(
      '*',
      knex.ref('models.id').as('modelId'),
      knex.ref('models.name').as('modelName'),
      knex.ref('models.rootBlockId').as('modelRootBlockId'),
      knex.ref('models.tags').as('modelTags'),
      knex.ref('models.description').as('modelDescription')
    ).where({ 'models.workspaceId': workspaceId }
    ).leftJoin('blocks', 'models.id', 'blocks.modelId')
    const products = await modelAPIs.db.queryAllProduct(workspaceId)
    return convertModelQueryResultToModelArray(results, products)
  }

  async queryAllClassifyListFromDB(workspaceId: number) {
    // const knex = DBClient.getInstance()
    return DBClient.getInstance(this.userSpace)('models').where('workspaceId', workspaceId)
      .select('classifyList')
      .then((results: { classifyList: string }[]) => {
        return results.map(item => item.classifyList)
          .filter(item => item)
          .map(classifyListString => JSON.parse(classifyListString))
      })
    // const result = await knex('models').where('workspaceId', workspaceId).select(
    //   'classifyList'
    // ).leftJoin('blocks', 'models.id', 'blocks.modelId')
    // return convertModelQueryResultToModelArray(result)
  }
}

export default new DbService()
