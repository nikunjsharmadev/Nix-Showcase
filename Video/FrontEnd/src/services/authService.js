export class AuthService {
  login(username, password) {
    if (username && password) {
      const user = {
        username,
        role: username === "admin" ? "admin" : "user",
      };
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    }
    return null;
  }
  logout() {
    localStorage.removeItem("user");
  }
  getUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
  isLoggedIn() {
    return !!localStorage.getItem("user");
  }
}