
exports.up = function(knex) {
  return knex.schema.table('data_inputs', function (table) {
    table.string('absolutePath')
  })
}

exports.down = function(knex) {}
