
exports.up = function (knex) {
  const timingNow = knex.fn.now()
  return knex.schema
    .createTable('projectionqueue', table => {
      table.increments('id').primary()
      table.string('name') // .unique()
      table.integer('projectionId')
      table.integer('parentId')

      table.integer('workspaceId')
      table.foreign('workspaceId').references('workspaces.id').onDelete('CASCADE')

      table.integer('multiThreadNumber')
      table.boolean('slidingWindow')
      table.boolean('rebaseSwitch')
      table.boolean('rebaseDepth')
      // table.boolean('shareBlockResults')
      // table.boolean('allowStaticBlocks')
      table.boolean('allowScope')
      table.integer('scopeFrom')
      table.integer('scopeTo')
      table.boolean('allowInnerLoopNumber')
      table.integer('innerLoopNumberFrom')
      table.integer('innerLoopNumberTo')
      table.boolean('allowOuterLoopNumber')
      table.integer('outerLoopNumberFrom')
      table.integer('outerLoopNumberTo')
      table.boolean('modelPointsOutput')
      table.boolean('independentInnerLoop')
      table.boolean('independentOuterLoop')
      table.boolean('allowIterationWhenCircularReference')
      table.boolean('isInherit')
      table.integer('runnerId')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('projectionqueue')
}
