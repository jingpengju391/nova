
exports.up = function(knex) {
  return knex.schema.table('runners', function (table) {
    table.dropForeign('inputId')
  })
}

exports.down = function(knex) {}
