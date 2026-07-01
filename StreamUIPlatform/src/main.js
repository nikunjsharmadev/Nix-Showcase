import { renderApp } from "./app.js";
import { Router } from "./router.js";
import { HomePage } from "./pages/home.js";
import { FeedPage } from "./pages/feed.js";

renderApp();
const router = new Router({
  "/": HomePage,
  "/feed": FeedPage,
});
