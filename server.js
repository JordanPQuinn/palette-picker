// set all imports and required packages here 
const express = require('express');
// instantiate instance of our express server
const app = express();
// body parser in order to handle our json requests
const bodyParser = require('body-parser');
// ensure we are always using the proper environment
const environment = process.env.NODE_ENV || 'development';
// set up our knex configuration based on environment
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
// set listening port based on environment
app.set('port', process.env.PORT || 3000);
app.locals.title = 'Palette Picker';
app.use(bodyParser.json());
app.enable('trust proxy');

// if request is not secured or our environment is not production,
// continue
// if it is production, make sure to redirect to the appropriate secured link
app.use(function (req, res, next) {
  if (req.secure || environment !== 'production') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});
// look for our index.html
app.use(express.static('public'));
// this end point retrieves all projects in the database
app.get('/api/v1/project', async (request, response) => {
  // initiate get request
  try {
    const projects = await database('project').select()
    // if projects are found, return them as json
    return response.status(200).json(projects);
  } catch (error) {
    // if an error is caught, return a 500 status with the error in the message body
    return response.status(500).json({ error });
  }
});

// this end point posts a new project to the database
app.post('/api/v1/project', async (request, response) => {
  // create a const to store our request body
  const projectToPost = request.body;
  // ensure we receieved all required params
  for (let param of ['name']) {
    // if we didn't, return a 422 status with a message indicating which param was missing
    if(!projectToPost[param]) {
      return response
        .status(422)
        .send({ error: `You forgot a ${param}`})
    }
  }
  // if we have all required params, post to the db and 
  // return 201 status with the id of the newly created id for that project
  database('project').insert(projectToPost, 'id')
    .then(project => {
      response.status(201).json({ id: project[0]})
    })
    .catch(error => {
      // if the request fails, return a 500 error with the appropriate messaging
      response.status(500).json({ error });
    });
});

// retrieves all palettes in the db
app.get('/api/v1/palettes', async (request, response) => {
  // initiate get request
  try {
    // if palettes are found, return them as json
    const palettes = await database('palettes')
    return response.status(200).json(palettes);
  } catch (error) {
    // else return a 500 error with appropriate messaging
    return response.status(500).json({ error });
  }
});

// post a new palette to the db
app.post('/api/v1/palettes', (request, response) => {
  // store our palette request body as a const
  const paletteToPost = request.body;
  // make sure we didn't forget any params
  for (let param of ['name', 'project_id', 'colors']) {
    // if we did, return a 422 status with appropriate error messaging
    if(!paletteToPost[param]) {
      return response
        .status(422)
        .send({ error: `You forgot to supply a ${param}` })
    }
  }
  // if we have all params, post the palette to the db
  database('palettes').insert(paletteToPost, 'id')
    .then(palette => {
      // on success, return a 201 status with the id of the newly created palette
      response.status(201).json({ id: palette[0] })
    })
    .catch(error => {
      // on fail, return a 500 status with the appropriate error messaging
      response.status(500).json({ error })
    })
});

// delete a palette by the id
app.delete('/api/v1/palettes/:id', async (request, response) => {
  // store our id as a const by destructuring it out of the params in the request
  const { id } = request.params;
  // find the palette in the db by the id
  database('palettes').where('id', id).del()
    .then( paletteRemoved => {
      // upon removal, return a 202 status code with the id of the removed palette
      response.status(202).json({ id: paletteRemoved.id })
    })
});

// once the app is instantiated, display a nice message to inform us as such 
app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

// export the app for testing 
module.exports = app;