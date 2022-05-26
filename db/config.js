module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite'
  },
  useNullAsDefault: true,
  pool: {
    min: 3,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}
