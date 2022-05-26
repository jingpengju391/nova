
exports.up = function (knex) {
  const timingNow = knex.fn.now()
  return knex.schema
    .createTable('data_clean_projects', table => {
      table.increments('id').primary()
      table.timestamp('createTime').defaultTo(timingNow)
      table.string('name')
      table.json('dataSources')
      table.json('outputs')
      table.string('coding')
      table.integer('workspaceId')
      table.integer('modelId')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')
      table.foreign('modelId').references('models.id').onDelete('CASCADE')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('data_clean_projects')
}
