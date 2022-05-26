const path = require("path");
module.exports = {
  client: 'sqlite3',
  connection: {
    filename: './settings.sqlite'
  },
  useNullAsDefault: true,
  pool: {
    min: 3,
    max: 10
  },
  migrations: {
    tableName: 'settings',
    directory: path.join('./userMigrations') // pkg 以 __dirname 识别是否打包
  }
}
