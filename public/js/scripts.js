const fetchButton = document.querySelector('.fetch-button');


const getStuff = async () => {
  let projectResponse = await fetch('/api/v1/projects');
  let parsedProjectResponse = await projectResponse.json();
  let paletteResponse = await fetch('/api/v1/palettes');
  let parsedPaletteResponse = await paletteResponse.json();

  console.log(parsedProjectResponse);
  console.log(parsedPaletteResponse);
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

fetchButton.addEventListener('click', renderPaletteBoxes);

window.addEventListener('load', getStuff);