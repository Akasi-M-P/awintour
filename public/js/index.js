import { login, logout } from "./login";
import { displayMap } from "./mapbox";
import "@babel/polyfill";

// SELECT THE MAP CONTAINER ELEMENT FROM THE DOM
const mapEl = document.getElementById("map");
const loginForm = document.querySelector(".form");
const logOutBtn = document.querySelector(".nav__el--logout");

displayMap(mapEl);

if (loginForm)
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // VALUES
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener("click", logout);
