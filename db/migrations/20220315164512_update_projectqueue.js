
exports.up = function (knex) {
  return knex.schema.table('projectionqueue', function (table) {
    table.string('evaluationTimePoint')
    table.string('mode')
  })
}

exports.down = function (knex) {

}
