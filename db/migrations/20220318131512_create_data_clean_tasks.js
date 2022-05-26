
exports.up = function (knex) {
  const timingNow = knex.fn.now()
  return knex.schema
    .createTable('data_clean_tasks', table => {
      table.increments('id').primary()
      table.string('name')
      table.boolean('status')
      table.timestamp('submitTime').defaultTo(timingNow)
      table.timestamp('completedTime').defaultTo(timingNow)
      table.string('submitter')
      table.string('outputPath')
      table.integer('workspaceId')
      table.integer('projectId')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('data_clean_tasks')
}
