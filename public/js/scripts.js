const getPalettes = async () => {
  let projectResponse = await fetchJson('/api/v1/project');
  let paletteResponse = await fetchJson('api/v1/palettes');
  setSelectionOptions(projectResponse);
  localStorage.setItem('projects', JSON.stringify(projectResponse));
  localStorage.setItem('palettes', JSON.stringify(paletteResponse));
  displayProjects(projectResponse, paletteResponse);
}

const setSelectionOptions = (projects) => {
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
  const body = JSON.parse(localStorage.getItem('paletteToSave'));

  await postToDb('api/v1/palettes', body);
  getPalettes();
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

setPaletteToSave = (e) => {
  const parsedPalette = JSON.parse(localStorage.getItem('generatedColors'));
  const paletteToSave = { 
    project_id: e.path[1][0].value, 
    colors: parsedPalette, 
    name: e.path[1][1].value 
  }
  localStorage.setItem('paletteToSave', JSON.stringify(paletteToSave));
}

const displayProjects = (projects, palettes) => {
  let projectMap = projects.map(project => {
    let filteredPalettes = palettes.filter(palette => palette.project_id === project.id)
    return { ...project, palettes: [...filteredPalettes]}
  });
  $('.project-box').empty();
  projectMap.map(project => {
    $('.project-box').prepend(`<h1> ${project.name} </h1>`)
    project.palettes.map(palette => {
          $('.project-box').append(`<h3>${palette.name}<i class="far fa-trash-alt" id="remove"></i></h3>`
          )
      palette.colors.forEach(color => {
        $('.project-box').append(`
          <div class='append-box' style="background-color: ${color}"/>
          `)
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
  });
  localStorage.setItem('generatedColors', JSON.stringify(storage));
}

const renderPaletteBoxes = () => {
  const colorBoxes = document.querySelectorAll('.color-box');
  createPaletteValues(colorBoxes);
}

const paletteButton = document.querySelector('.palette-button');
const paletteSubmit = document.querySelector('#palette-submit');
const newPaletteForm = document.querySelector('#new-palette');
paletteButton.addEventListener('click', renderPaletteBoxes);
newPaletteForm.addEventListener('change', setPaletteToSave);
paletteSubmit.addEventListener('click', postPalette);
window.addEventListener('load', getPalettes);