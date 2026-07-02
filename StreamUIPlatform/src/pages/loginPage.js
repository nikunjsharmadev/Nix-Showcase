import { Auth } from "../services/authService.js";
export function LoginPage() {
  return `
    <div class="login-page">
        <form id="loginForm" class="login-form">
            <h2>Login</h2>
            <input autocomplete="on" id="username" type="text" placeholder="Username" required>
            <input autocomplete="on" id="password" type="password" placeholder="password" required>
            <button>Login</button>
            <p id="error"></p>
        </form>
    </div>
    `;
}

export function initLogin() {
  const form = document.getElementById("loginForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    if (Auth.login(user, pass)) {
      location.hash = "/feed";
    } else {
      document.getElementById("error").textContent = "Invalid credentials";
    }
  });
}
