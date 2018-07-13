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
});

app.post('/api/v1/project', async (request, response) => {
  const projectToPost = request.body;

  for (let param of ['name']) {
    if(!projectToPost[param]) {
      return response
        .status(422)
        .send({ error: `You forgot a ${param}`})
    }
  }

  database('project').insert(projectToPost, 'id')
    .then(project => {
      response.status(201).json({ id: proj[0]})
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/palettes', async (request, response) => {
  try {
    const palettes = await database('palettes')
    return response.status(200).json(palettes);
  } catch (error) {
    return response.status(500).json({ error });
  }
});

app.post('/api/v1/palettes', (request, response) => {
  const paletteToPost = request.body;
  for (let param of ['name', 'project_id', 'colors']) {
    if(!paletteToPost[param]) {
      return response
        .status(422)
        .send({ error: `You forgot to supply a ${param}` })
    }
  }

  database('palettes').insert(paletteToPost, 'id')
    .then(palette => {
      response.status(201).json({ id: palette[0] })
    })
    .catch(error => {
      response.status(500).json({ error })
    })
});

app.delete('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;
  database('palettes').where('id', id).del()
    .then( paletteRemoved => {
      response.status(202).json({ id: paletteRemoved.id })
    })
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

module.exports = app;