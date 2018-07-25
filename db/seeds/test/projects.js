exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('projects').del()
    .then(function () {
      return Promise.all([
        knex('projects').insert({
          name: 'test-projects'
        }, 'id')
        .then(project => {
          return knex('palettes').insert([
            {
              name: 'palette1', 
              project_id: project[0], 
              colors: ['#6D7EC2', '#94216A', '#A27907', '#FEBED5', '#52A770'] 
            },          
            {
              name: 'palette2', 
              project_id: project[0], 
              colors: ['#39A90C', '#0EC322', '#7EF1D9', '#E61944', '#214002']
            },
          ])
        })  
        .then(() => console.log('Data seeded!'))
        .catch( error => console.log(`Error seeding data: ${error}`))
      ])
  })
};