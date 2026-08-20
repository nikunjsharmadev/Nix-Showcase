import { AuthService } from "../services/index.js";
export function LoginPage() {
  setTimeout(() => initLogin(), 0);
  return `
    <div class="login-page">
        <div class="demo-credentials">
          <p><b>Demo Login</b></p>
          <p>User: user</p>
          <p>Password: anything</p>
        </div>
        <form id="loginForm" class="login-form">
            <h2>Login</h2>
            <input autocomplete="current-password" id="username" type="text" placeholder="Username" required>
            <input autocomplete="username" id="password" type="password" placeholder="password" required>
            <button type="submit">Login</button>
            <p id="error" role="alert" aria-live="polite"></p>
        </form>
    </div>
    `;
}
function initLogin() {
  const form = document.getElementById("loginForm");
  const user = document.getElementById("username");
  const pass = document.getElementById("password");
  user.value = "user";
  pass.value = "anything";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const authService = new AuthService();
    if (authService.login(user.value, pass.value)) {
      location.hash = "#/feed";
    } else {
      document.getElementById("error").textContent = "Invalid credentials";
    }
  });
}
