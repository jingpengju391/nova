exports.up = function (knex) {
  return knex.schema
    .createTable('app', table => {
      table.increments('id').primary()
      table.string('name')
      table.string('userName').unique()
      table.integer('calculationStackHeightLimit')
      table.integer('errorTraceLength')
    })
    .createTable('tasks', table => {
      table.increments('id').primary()
      table.string('name')
      table.string('userName').unique()
      table.string('outputFolder')
      table.integer('outputPrecision')
      table.string('mode')
      table.boolean('childFolderSelect')
    })
    .createTable('runners', table => {
      table.increments('id').primary()
      table.string('name')
      table.string('userName').unique()
      table.integer('multiThreadNumber')
      table.boolean('slidingWindow')
      table.boolean('rebaseSwitch')
      table.boolean('rebaseDepth')
      table.boolean('allowScope')
      table.boolean('modelPointsOutput')
      table.boolean('allowIterationWhenCircularReference')
      table.boolean('allowInnerLoopNumber')
      table.boolean('allowOuterLoopNumber')
      table.boolean('independentInnerLoop')
      table.boolean('independentOuterLoop')
      table.integer('scopeFrom')
      table.integer('scopeTo')
      table.integer('innerLoopNumberFrom')
      table.integer('innerLoopNumberTo')
      table.integer('outerLoopNumberFrom')
      table.integer('outerLoopNumberTo')
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTable('app')
    .dropTable('tasks')
    .dropTable('runners')
}
