
exports.up = function(knex) {
  knex.schema.hasColumn('blocks', 'finalizeFormula').then(exists => {
    if (!exists) {
      return knex.schema.table('blocks', function (table) {
        table.integer('finalizeFormula')
      })
    }
  })
}

exports.down = function(knex) {}
