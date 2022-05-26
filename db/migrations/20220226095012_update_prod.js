
exports.up = function(knex) {
  return knex.schema.table('products', function (table) {
    table.dropColumn('products')
    table.dropForeign('modelId')
    table.dropColumn('modelId')
  })
}

exports.down = function(knex) {}
