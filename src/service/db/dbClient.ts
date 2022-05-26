import type { Knex } from 'knex'
import config from '../../server/config'
// import { timeoutUsers } from '../../service/schedule'
import schedule from '../../service/schedule'
const knex = require('knex')
const timeoutUsers: any = schedule.timeoutUsers
class DBClient {
  static allUsers: any = {}
  static #instance: Knex
  static #workspacePath: string

  static getInstance(userSpace?: string): Knex {
    if (userSpace === undefined) {
      userSpace = ''
    }
    return DBClient.allUsers[userSpace].instance
  }

  static initialize(userSpace: string, workspacePath: string) {
    if (DBClient.allUsers[userSpace]?.workspacePath && DBClient.allUsers[userSpace].workspacePath === workspacePath) {
      return
    }
    if (!DBClient.allUsers[userSpace]) {
      DBClient.allUsers[userSpace] = {}
    }
    DBClient.allUsers[userSpace].workspacePath = workspacePath
    DBClient.allUsers[userSpace].instance = knex({
      client: 'sqlite3',
      connection: {
        filename: workspacePath
      },
      useNullAsDefault: true,
      pool: {
        min: 3,
        max: 10,
        // https://github.com/knex/knex/issues/453
        afterCreate: (conn: any, cb: any) => conn.run('PRAGMA foreign_keys = ON', cb)
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    })
    if (process.env.ARCHITECTURE === 'bs') {
      DBClient.destroyLater(userSpace)
    }
  }

  static destroyLater(userSpace: string) {
    clearTimeout(timeoutUsers[userSpace])
    delete timeoutUsers[userSpace]
    timeoutUsers[userSpace] = setTimeout(() => {
      clearTimeout(timeoutUsers[userSpace])
      delete timeoutUsers[userSpace]
      delete DBClient.allUsers[userSpace]
    }, config.logoutTime)
  }

  static destroyNow(userSpace: string) {
    clearTimeout(timeoutUsers[userSpace])
    delete timeoutUsers[userSpace]
    delete DBClient.allUsers[userSpace]
  }
}

export default DBClient
