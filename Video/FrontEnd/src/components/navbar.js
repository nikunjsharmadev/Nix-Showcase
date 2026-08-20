import { AuthService } from "../services/index.js";
import { filterVideos } from "../pages/index.js";
import { debounce } from "../utils/index.js";

export function NavBar() {
  setTimeout(() => initNavbar(), 0);
  return `
    <div class="nav-links">
      <div class="search-box">
        <input id="search" placeholder="Search" />
      </div>
    </div>
    <button class="logout-btn" id="logoutBtn">Logout</button>`;
}

export function initNavbar() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  const authService = new AuthService();
  btn.addEventListener("click", () => {
    authService.logout();
    location.hash = "/login";
  });
  const user = authService.getUser();
  setTimeout(() => {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    searchInput.addEventListener(
      "input",
      debounce((e) => {
        const value = e.target.value.toLowerCase();
        filterVideos(value);
      }, 300),
    );
  }, 0);
}
