
exports.up = function(knex) {
  return knex.schema.table('blocks', function (table) {
    table.dropColumn('finalizeFormula')
  })
}

exports.down = function(knex) {}
