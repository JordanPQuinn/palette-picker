const fetchButton = document.querySelector('.fetch-button');
const colorBoxOne = document.getElementById('color-one');

const getStuff = async () => {
  var response = await fetch('/get');
  var parsedResponse = await response.json();
  colorBoxOne.style.backgroundColor = `${parsedResponse}`;
}

fetchButton.addEventListener('click', getStuff);

