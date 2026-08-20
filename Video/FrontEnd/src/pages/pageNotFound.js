import { AuthService } from "../services/index.js";
export function PageNotFound() {
  setTimeout(() => initPageNotFound(), 0);
  const authService = new AuthService();
  const buttonText = authService.isLoggedIn() ? "Go to Feed" : "Go to Login";
  return `
    <div class="not-found">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist</p>
        <button id="goFeedBtn">${buttonText}</button>
    </div>`;
}
function initPageNotFound() {
  const btn = document.getElementById("goFeedBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isLoggedIn = !!localStorage.getItem("user");
    location.hash = isLoggedIn ? "/feed" : "/login";
  });
}
