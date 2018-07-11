const getPalettes = async () => {
  let projectResponse = await fetchJson('/api/v1/project');
  let paletteResponse = await fetchJson('api/v1/palettes');
  setSelectionOptions(projectResponse);
  localStorage.setItem('projects', JSON.stringify(projectResponse));
  localStorage.setItem('palettes', JSON.stringify(paletteResponse));
  displayProjects(projectResponse, paletteResponse);
}

const setSelectionOptions = (projects) => {
   $('#project-dropdown').empty();
  projects.forEach(project => {
      $('#project-dropdown').append($('<option>', { value: project.id, text: project.name }));
  });
};

$('.project-box').on('click', function (event) {
    if ($(event.target).hasClass('far')) {
      removePalette($($(event.target).closest('h3')[0]).text())
    }
});

removePalette = async (paletteName) => {
  const palettes = await fetchJson('api/v1/palettes');
  const id = palettes.find(palette => palette.name == paletteName).id;
  await fetch(`/api/v1/palettes/${id}`, {
    method: 'DELETE'
  });
  getPalettes();
}

postPalette = async (e) => {
  e.preventDefault();
  const parsedPalette = JSON.parse(localStorage.getItem('generatedColors'));
  const body = { 
    project_id: e.path[1][0].value, 
    colors: parsedPalette, 
    name: e.path[1][1].value 
  }

  await postToDb('api/v1/palettes', body);
  getPalettes();
  clearInputs();
}

postProject = async (e) => {
  e.preventDefault();
  const body = {
    name: e.path[1][0].value
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
  let projectMap = projects.map(project => {
    let filteredPalettes = palettes.filter(palette => palette.project_id === project.id)
    return { ...project, palettes: [...filteredPalettes]}
  });
  $('.project-box').empty();
  projectMap.map(project => {
    $('.project-box').append(`<h1> ${project.name} </h1>`)
    project.palettes.map(palette => {
      $('.project-box').append(`<h3>${palette.name}<i class="far fa-trash-alt" id="remove"></i></h3>`)
      palette.colors.forEach(color => {
        $('.project-box').append(`<div class='append-box' style="background-color: ${color}"/>`)
      });
    });
  });
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
    let generatedColor = generateRandomColor();
    storage.push(generatedColor);
    box.style.backgroundColor = generatedColor;
    box.innerText = (generatedColor);
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
const newPaletteForm = document.querySelector('#new-palette');
paletteButton.addEventListener('click', renderPaletteBoxes);
paletteSubmit.addEventListener('click', postPalette);
projectSubmit.addEventListener('click', postProject);
window.addEventListener('load', getPalettes);