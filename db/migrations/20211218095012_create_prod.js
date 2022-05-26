
exports.up = function (knex) {
  const timingNow = knex.fn.now()
  return knex.schema
    .createTable('products', table => {
      table.increments('id').primary()
      table.string('name') // .unique()
      table.string('description')
      table.string('creator')
      table.timestamp('updatedAt').defaultTo(timingNow)
      table.string('codeIndexForEval')
      table.json('codeIndexes')
      table.integer('workspaceId')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')
    })
    .createTable('codeIndex', table => {
      table.increments('id').primary()
      table.string('name') // .unique()
      table.string('description')
      table.string('classify')
      table.boolean('moduleOnly')
      table.boolean('productOnly')
      table.boolean('newProductDefault')
      table.boolean('newBlockDefault')
      table.string('chooseIf')
      table.string('abandonIf')
      table.string('creator')
      table.timestamp('updatedAt').defaultTo(timingNow)
      table.integer('modelId') // .references('models.id').onDelete('CASCADE')
      table.integer('workspaceId')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')
    })
}

exports.down = function (knex) {
  return null
}
