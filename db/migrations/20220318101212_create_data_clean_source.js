
exports.up = function (knex) {
  const timingNow = knex.fn.now()
  return knex.schema
    .createTable('data_clean_source', table => {
      table.increments('id').primary()
      table.timestamp('ImportTime').defaultTo(timingNow)
      table.string('name')
      table.string('navName')
      table.string('path')
      table.integer('workspaceId')
      table.integer('modelId')
      table.boolean('isRelative')
      table.boolean('headerExists')
      table.string('dataType')
      table.string('fields')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')
      table.foreign('modelId').references('models.id').onDelete('CASCADE')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('data_clean_source')
}
