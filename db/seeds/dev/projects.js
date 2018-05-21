

exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('project').del()
    .then(function () {
      // Inserts seed entries
      return Promise.all([
        knex('project').insert({
          name: 'test-project'}, 'id')
        .then(project => {
          return Promise.all([
            knex('palettes').insert([
            {
              name: 'sample-palette',
              project_id: project[0],
              colors: ['#B38CB4', '#B7918C', '#C5A48A', '#DDC67B', '#F8F272']
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