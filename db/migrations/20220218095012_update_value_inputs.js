
exports.up = function(knex) {
  return knex.schema.table('variable_inputs', function (table) {
    table.integer('sort')
  })
}

exports.down = function(knex) {}
