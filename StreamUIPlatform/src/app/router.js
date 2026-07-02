import { HomePage } from "../pages/homePage.js";
import { FeedPage } from "../pages/feedPage.js";
import { initLogin, LoginPage } from "../pages/loginPage.js";
import { Auth } from "../services/authService.js";
import { initNavbar, NavBar } from "../components/navbar.js";
import { initNotFound, pageNotFound } from "../pages/pageNotFound.js";
export class Router {
  constructor(root) {
    this.init();
  }
  init() {
    window.addEventListener("hashchange", () => this.render());
    window.addEventListener("load", () => this.render());
  }
  getPath() {
    return location.hash.replace("#", "") || "/";
  }
  render() {
    const path = this.getPath();
    if (!guardRoute(path)) return;
    const view = document.getElementById("view");
    const navbar = document.getElementById("navbar");
    switch (path) {
      case "/login":
        view.innerHTML = LoginPage();
        navbar.innerHTML = "";
        initLogin();
        break;
      case "/feed":
        view.innerHTML = FeedPage();
        navbar.innerHTML = NavBar();
        initNavbar();
        break;
      default:
        view.innerHTML = pageNotFound();
        navbar.innerHTML = "";
        initNotFound();
    }
  }
}
export function guardRoute(path) {
  const protectedRoute = ["/feed"];
  if (protectedRoute.includes(path)) {
    if (!Auth.isLoggedIn()) {
      location.hash = "/login";
      return false;
    }
  }
  return true;
}
