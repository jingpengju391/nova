
exports.up = function (knex) {
  return knex.schema.table('projections', function (table) {
    table.boolean('childFolderSelect')
    table.integer('modelId')
  })
}

exports.down = function (knex) { }
