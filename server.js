const express = require('express');
const app = express();

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Palette Picker';
app.locals.colorsArray = ['', '', '', '', '']

app.use(express.static('public'));

app.get('/get', (request,response) => {
  var body = 'black';
  return response.status(200).json(body);

});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});