
exports.up = function(knex) {
  return knex.schema.table('blocks', function (table) {
    table.boolean('allowManualResize')
    table.string('finalizeFormula')
  })
}

exports.down = function(knex) {}
