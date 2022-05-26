
exports.up = function(knex) {
  return knex.schema.table('data_clean_tasks', function (table) {
    table.dropForeign('workspaceId')
  })
}

exports.down = function(knex) {}