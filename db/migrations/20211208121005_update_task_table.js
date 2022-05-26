
exports.up = function(knex) {
  knex.schema.hasColumn('tasks', 'processId').then(exists => {
    if (!exists) {
      return knex.schema.table('tasks', function (table) {
        table.string('processId')
        table.integer('pid')
      })
    }
  })
}

exports.down = function(knex) {
}
