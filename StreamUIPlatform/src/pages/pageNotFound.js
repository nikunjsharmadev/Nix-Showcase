import { Auth } from "../services/authService.js";

export function pageNotFound() {
  const buttonText = Auth.isLoggedIn() ? "Go to Feed" : "Go to Login";
  return `
    <div class="not-found">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist</p>
        <button id="goFeedBtn">${buttonText}</button>
    </div>`;
}
export function initNotFound() {
  const btn = document.getElementById("goFeedBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isLoggedIn = !!localStorage.getItem("user");
    location.hash = isLoggedIn ? "/feed" : "/login";
  });
}
