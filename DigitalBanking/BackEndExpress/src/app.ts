import express from "express";
import { asyncWrapper, checkAppHealth } from "./utils/index.js";
import { AppUse, Database } from "./index.js";
// APP
export function App() {
  const app = express();
  app.get("/api", asyncWrapper(checkAppHealth));
  AppUse(app);
  Database();
  return app;
}
