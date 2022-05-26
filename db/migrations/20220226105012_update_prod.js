
exports.up = function(knex) {
  const timingNow = knex.fn.now()
  return knex.schema
    .createTable('master', table => {
      table.increments('id').primary()
      table.integer('modelId').references('models.id').onDelete('CASCADE')
      table.string('name') // .unique()
      table.string('description')
      table.json('tags')
      table.string('creator')
      table.timestamp('updatedAt').defaultTo(timingNow)
      table.json('products')
      table.json('codeIndexes')
      table.string('codeIndexForEval')
      table.integer('workspaceId')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')
    })
    .table('products', function (table) {
      table.integer('master').references('master.id').onDelete('CASCADE')
    })
}

exports.down = function(knex) {}
