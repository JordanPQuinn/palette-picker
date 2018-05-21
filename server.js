const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Palette Picker';
app.use(bodyParser.json());

app.enable('trust proxy');

app.use(function (req, res, next) {
  if (req.secure || environment !== 'production') {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
});

app.use(express.static('public'));

app.get('/api/v1/project', async (request, response) => {
  try {
    const projects = await database('project').select()
    return response.status(200).json(projects);
  } catch (error) {
    return response.status(500).json({ error });
  }
})

app.get('/api/v1/palettes', async (request, response) => {
  try {
    const palettes = await database('palettes')
    return response.status(200).json(palettes);
  } catch (error) {
    return response.status(500).json({ error });
  }
})

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});