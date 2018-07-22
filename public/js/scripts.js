const getPalettes = async () => {
  let projectResponse = await fetchJson('/api/v1/project');
  let paletteResponse = await fetchJson('api/v1/palettes');
  setSelectionOptions(projectResponse);
  localStorage.setItem('projects', JSON.stringify(projectResponse));
  localStorage.setItem('palettes', JSON.stringify(paletteResponse));
  localStorage.setItem('lockedColors', JSON.stringify({}));
  displayProjects(projectResponse, paletteResponse);
  renderPaletteBoxes();
}

const setSelectionOptions = (projects) => {
   $('#project-dropdown').empty();
  projects.forEach(project => {
      $('#project-dropdown').append($('<option>', { value: project.id, text: project.name }));
  });
};

$('.project-box').on('click', function (event) {
    if ($(event.target).hasClass('far')) {
      removePalette($(event.target).closest('div').children('h3').text())
    }
});

$('.lock').on('click', function (event) {
  const index = $(this).closest('article')[0].id;
  const lockedColors = JSON.parse(localStorage.getItem('lockedColors'));
  lockedColors[index] ? 
    unlock(lockedColors, index, this) 
    : lock(lockedColors, index, this);
}); 

const lock = (lockedColors, index, element) => {
  $(element).css('background-image', 'url(../assets/lock.svg)');
  const colors = JSON.parse(localStorage.getItem('generatedColors'));
  lockedColors[index] = colors[index];
  localStorage.setItem('lockedColors', JSON.stringify(lockedColors));
}

const unlock = (lockedColors, index, element) => {
  $(element).css('background-image', 'url(../assets/unlock.svg)');
  delete lockedColors[index]
  localStorage.setItem('lockedColors', JSON.stringify(lockedColors));
}

const checkLocked = (colorIndex) => {
  const lockedColors = JSON.parse(localStorage.getItem('lockedColors'));
  return lockedColors[colorIndex] ? lockedColors[colorIndex] :  generateRandomColor();
}

const removePalette = async (paletteName) => {
  const palettes = await fetchJson('api/v1/palettes');
  const id = palettes.find(palette => palette.name == paletteName).id;
  await fetch(`/api/v1/palettes/${id}`, {
    method: 'DELETE'
  });
  getPalettes();
}

const postPalette = async (e) => {
  e.preventDefault();
  const parsedPalette = JSON.parse(localStorage.getItem('generatedColors'));
  const body = { 
    project_id: e.path[2][0].value, 
    colors: parsedPalette, 
    name: e.path[2][1].value 
  }

  await postToDb('api/v1/palettes', body);
  getPalettes();
  clearInputs();
}

const postProject = async (e) => {
  e.preventDefault();
  const body = {
    name: e.path[2][0].value
  }

  await postToDb('api/v1/project', body);
  getPalettes();
  clearInputs();
}

const clearInputs = () => {
  $('#project-name').val('');
  $('#palette-name').val('');
}

const postToDb = (url, body) => {
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(body), 
    headers: new Headers({
      'Content-Type': 'application/json'
    })
  })
}

const displayProjects = (projects, palettes) => {
  const projectsWithPalettes = projects.map(project => {
    let filteredPalettes = palettes.filter(palette => palette.project_id === project.id)
    return { ...project, palettes: [...filteredPalettes]}
  });
  $('.project-box').empty();
  const display = projectsWithPalettes.map(project => {
    const palettesToAdd = getProjectDisplay(project.palettes);
    return (`
      <article class='project'>
        <h3 class='project-name'>${project.name}</h3>
        ${palettesToAdd}
      </article>
    `)
  }).join('')

  $('.project-box').prepend(display);
}

const getProjectDisplay = (palettes) => {
  return palettes.map(palette => {
    const paletteColors = createColorBoxes(palette.colors).join('');
    return (`
      <div class='project-palettes'>
        <div>
          <h3 class='palette-subheader2'>${palette.name}</h3>
          <p><i class='far fa-trash-alt' id='remove'></i></p>
        </div>
        ${paletteColors}
      </div>
    `)
  })
}

const createColorBoxes = (colors) => {
  return colors.map( color => {
    return (`
      <div class="append-box" style="background-color:${color};"></div>
    `)
  })
}

const fetchJson = async (url) => {
  const response = await fetch(url);
  return response.json();
}

const generateRandomColor = () => {
  const hexValues = '0123456789ABCDEF';
  let hexString = '#'
  for(let i = 0; i < 6; i++) {
      let letter = hexValues[Math.floor(Math.random() * 16)];
      hexString += letter;
  }
  return hexString;
}

const createPaletteValues = (colorBoxes) => {
  let storage = [];
  colorBoxes.forEach(box => {
    let generatedColor = checkLocked(box.id)
    storage.push(generatedColor);
    box.style.backgroundColor = generatedColor;
    $(box).children('div').text(generatedColor);
  });
  localStorage.setItem('generatedColors', JSON.stringify(storage));
}

const renderPaletteBoxes = () => {
  const colorBoxes = document.querySelectorAll('.color-box');
  createPaletteValues(colorBoxes);
}

const paletteButton = document.querySelector('.palette-button');
const paletteSubmit = document.querySelector('#palette-submit');
const projectSubmit = document.querySelector('#project-submit');

paletteButton.addEventListener('click', renderPaletteBoxes);
paletteSubmit.addEventListener('click', postPalette);
projectSubmit.addEventListener('click', postProject);
window.addEventListener('load', getPalettes);