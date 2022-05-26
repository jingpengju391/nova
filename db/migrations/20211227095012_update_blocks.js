
exports.up = function(knex) {
  knex.schema.hasColumn('blocks', 'productId').then(exists => {
    if (!exists) {
      return knex.schema.table('blocks', function (table) {
        table.integer('productId')
      })
    }
  })
}

exports.down = function(knex) {}
