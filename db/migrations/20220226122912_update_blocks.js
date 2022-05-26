
exports.up = function (knex) {
  return knex.schema.table('blocks', function (table) {
    table.integer('isProductMask')
  })
}

exports.down = function (knex) { }
