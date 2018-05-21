const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.set('port', process.env.PORT || 3000);
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
app.locals.title = 'Palette Picker';

app.use(bodyParser.json());
app.use(express.static('public'));

app.enable('trust proxy');

app.get('/api/v1/projects', (request, response) => {
  database('projects').select()
    .then((projects) => {
        return response.status(200).json(projects);
    })
    .catch((error) => {
      response.status(500).json({ error });
    })
});

app.get('api/v1/palettes', (request, response) => {
  database('palettes').select()
    .then((palettes) => {
      return response.status(200).json(projects);
    })
    .catch((error) => {
      response.status(500).json({ error });
    })
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});