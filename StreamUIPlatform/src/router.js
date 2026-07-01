import { HomePage } from "./pages/home.js";
import { FeedPage } from "./pages/feed.js";
const routes = {
  "/": HomePage,
  "/feed": FeedPage,
};
export class Router {
  constructor() {
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
    const view = document.getElementById("view");
    const page = this.routes[path] || this.routes["/"];
    view.innerHTML = page();
  }
}
