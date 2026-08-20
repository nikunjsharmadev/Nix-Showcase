import { HomePage, FeedPage, LoginPage, PageNotFound } from "../pages/index.js";
import { AuthService } from "../services/index.js";
import { NavBar } from "../components/index.js";
export class Router {
  constructor(root) {
    this.init();
  }
  init() {
    window.addEventListener("hashchange", () => this.render());
    window.addEventListener("load", () => this.render());
  }
  getPath() {
    return location.hash.slice(1) || "/";
  }
  render() {
    const path = this.getPath();
    if (!this.guardRoute(path)) return;
    const view = document.getElementById("view");
    const navbar = document.getElementById("navbar");
    switch (path) {
      case "/login":
        view.innerHTML = LoginPage();
        navbar.innerHTML = "";
        break;
      case "/feed":
        view.innerHTML = FeedPage();
        navbar.innerHTML = NavBar();
        break;
      default:
        view.innerHTML = PageNotFound();
        navbar.innerHTML = "";
    }
  }
  guardRoute(path) {
    const authService = new AuthService();
    const protectedRoute = ["/feed"];
    if (protectedRoute.includes(path)) {
      if (!authService.isLoggedIn()) {
        location.hash = "#/login";
        return false;
      }
    }
    return true;
  }
}
