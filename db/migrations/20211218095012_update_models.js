
exports.up = function(knex) {
  knex.schema.hasColumn('models', 'products').then(exists => {
    if (!exists) {
      return knex.schema.table('models', function (table) {
        table.json('products')
      })
    }
  })
}

exports.down = function(knex) {}
