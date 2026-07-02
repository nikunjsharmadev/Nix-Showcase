import { renderApp } from "./app/app.js";
import { Router } from "./app/router.js";
import { HomePage } from "./pages/homePage.js";
import { FeedPage } from "./pages/feedPage.js";
import { LoginPage } from "./pages/loginPage.js";
renderApp();
const router = new Router({
  "/": HomePage,
  "/feed": FeedPage,
  "/login": LoginPage,
});
