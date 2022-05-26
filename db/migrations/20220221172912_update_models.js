
exports.up = function (knex) {
  return knex.schema.table('models', function (table) {
    table.boolean('isDateCenter')
    table.string('dateAlignType')
  })
}

exports.down = function (knex) { }
