import { NavBar } from "./components/navbar.js";
export function renderApp() {
  const app = document.getElementById("app");
  app.innerHTML = `
  <div id="layout">
    ${NavBar()}
    <div id="view"></view>
  </div>`;
}
