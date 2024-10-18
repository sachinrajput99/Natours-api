/*eslint-disable */

//whenever make change in index.js file take a note to run (npm run  watch:js command)
import '@babel/polyfill'; //polyfills this code so as to run in older browser
import { login, logout } from './login';
import { displayMap } from './mapbox';
// Event listener for form submission

// DOM ELEMENT
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

//DELEGATION
if (mapBox) {
  const location1 = JSON.parse(
    document.getElementById('map').dataset.locations
  );
  displayMap(location1);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}
if (logOutBtn) logOutBtn.addEventListener('click', logout);