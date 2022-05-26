import type { Knex } from 'knex'
const knex = require('knex')

class UserDbClient {
  static #instance: Knex
  static #userDbPath: string

  static getInstance(): Knex {
    return UserDbClient.#instance
  }

  static async initialize(userDbPath: string) {
    if (UserDbClient.#userDbPath === userDbPath) {
      return
    }
    UserDbClient.#userDbPath = userDbPath
    UserDbClient.#instance = knex({
      client: 'sqlite3',
      connection: {
        filename: userDbPath
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
  }
}

export default UserDbClient
