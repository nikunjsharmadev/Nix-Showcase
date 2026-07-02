import { Auth } from "../services/authService.js";
import { filterVideos } from "../pages/feedPage.js";
import { debounce } from "../utils/debounce.js";

export function NavBar() {
  return `
    <div class="nav-links">
      <div class="search-box">
        <input id="search" placeholder="Search videos..." />
      </div>
    </div>
    <button class="logout-btn" id="logoutBtn">Logout</button>`;
}

export function initNavbar() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    Auth.logout();
    location.hash = "/login";
  });
  const user = Auth.getUser();
  if (user?.role === "admin") {
    console.log("show moderation tools");
  }
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
