
exports.up = function (knex) {
  return knex.schema.table('projections', function (table) {
    table.string('evaluationTimePoint')
  })
}

exports.down = function (knex) { }
