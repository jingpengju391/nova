
exports.up = function (knex) {
  return knex.schema.table('projections', function (table) {
    table.dropColumn('evaluationTimePoint')
  })
}

exports.down = function (knex) { }
