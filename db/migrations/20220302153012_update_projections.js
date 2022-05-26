
exports.up = function (knex) {
  return knex.schema.table('projections', function (table) {
    table.boolean('subFolderOutput')
    table.json('runQueueSelections')
    table.dropColumn('multiThreadNumber')
    table.dropColumn('slidingWindow')
    table.dropColumn('rebaseSwitch')
    table.dropColumn('rebaseDepth')
    table.dropColumn('allowScope')
    table.dropColumn('scopeFrom')
    table.dropColumn('scopeTo')
    table.dropColumn('allowInnerLoopNumber')
    table.dropColumn('innerLoopNumberFrom')
    table.dropColumn('innerLoopNumberTo')
    table.dropColumn('allowOuterLoopNumber')
    table.dropColumn('outerLoopNumberFrom')
    table.dropColumn('outerLoopNumberTo')
    table.dropColumn('modelPointsOutput')
    table.dropColumn('independentInnerLoop')
    table.dropColumn('independentOuterLoop')
    table.dropColumn('allowIterationWhenCircularReference')
    table.dropColumn('modelId')
  })
}

exports.down = function (knex) { }
