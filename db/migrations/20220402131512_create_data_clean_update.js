
exports.up = function(knex) {
  return knex.schema.table('data_clean_source', function (table) {
    table.dropForeign('workspaceId')
    table.dropForeign('modelId')
  })
}

exports.down = function(knex) {}