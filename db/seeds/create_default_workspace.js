
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('workspaces').del()
    .then(function () {
      // Inserts seed entries
      return knex('workspaces').insert({ name: 'default' })
    })
}
