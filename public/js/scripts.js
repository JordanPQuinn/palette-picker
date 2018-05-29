const getStuff = async () => {
  let projectResponse = await fetchJson('/api/v1/project');
  let paletteResponse = await fetchJson('api/v1/palettes');
  localStorage.setItem('projects', JSON.stringify(projectResponse));
  localStorage.setItem('palettes', JSON.stringify(paletteResponse));
  displayProjects(projectResponse, paletteResponse);
}

const displayProjects = (projects, palettes) => {
  let projectMap = projects.map(project => {
    let filteredPalettes = palettes.filter(palette => palette.project_id === project.id)
    return { ...project, palettes: [...filteredPalettes]}
  });
  let rendered = projectMap.map(project)
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
  colorBoxes.forEach(box => {
    box.style.backgroundColor = generateRandomColor();
  });
}

const renderPaletteBoxes = () => {
  const colorBoxes = document.querySelectorAll('.color-box');
  createPaletteValues(colorBoxes);
}

const paletteButton = document.querySelector('.palette-button');
paletteButton.addEventListener('click', renderPaletteBoxes);
window.addEventListener('load', getStuff);
