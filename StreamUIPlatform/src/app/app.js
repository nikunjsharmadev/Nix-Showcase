import { initNavbar, NavBar } from "../components/navbar.js";
export function renderApp() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div id="layout">
    <nav id="navbar" class="navbar">
      ${NavBar()}
    </nav>
    <div id="view"></view>
  </div>`;
  initNavbar();
}
