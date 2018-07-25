

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('projects').del()
    .then(function () {
      // Inserts seed entries
      return Promise.all([
        knex('projects').insert({
          name: 'test-project'}, 'id')
        .then(project => {
          return Promise.all([
            knex('palettes').insert([
            {
              name: 'sample-palette',
              project_id: project[0],
              colors: ['#FF0689','#6E52E9','#399B8D','#0D7CE9','#26F420']
            }
          ])
        ]);
        })
        .then(() => console.log('seeding complete!'))
        .catch(error => console.log(`${error}`))
      ]);
    })
    .catch(error => console.log(`${error}`))
};