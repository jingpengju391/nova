
exports.up = function (knex) {
  return knex.schema.table('projections', function (table) {
    table.dropColumn('modelId')
  })
}

exports.down = function (knex) { }
