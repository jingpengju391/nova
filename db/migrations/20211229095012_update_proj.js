
exports.up = function(knex) {
  knex.schema.hasColumn('projections', 'allowIterationWhenCircularReference').then(exists => {
    if (!exists) {
      return knex.schema.table('projections', function (table) {
        table.boolean('allowIterationWhenCircularReference')
      })
    }
  })
}

exports.down = function(knex) {}
