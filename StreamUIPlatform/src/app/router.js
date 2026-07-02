import { HomePage } from "../pages/homePage.js";
import { FeedPage } from "../pages/feedPage.js";
import { initLogin, LoginPage } from "../pages/loginPage.js";
import { Auth } from "../services/authService.js";
import { initNavbar, NavBar } from "../components/navbar.js";
const routes = {
  "/": HomePage,
  "/feed": FeedPage,
  "/login": LoginPage,
};
export class Router {
  constructor(root) {
    this.routes = routes;
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
    const page = this.routes[path] || this.routes["/"];
    const view = document.getElementById("view");
    view.innerHTML = page();
    const element = document.getElementById("navbar");
    if (path === "/login") {
      element.innerHTML = "";
      initLogin();
    } else {
      element.innerHTML = NavBar();
      initNavbar();
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
