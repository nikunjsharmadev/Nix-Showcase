import express from "express";
import { UPLOAD_DIR } from "./consts/index.js";
import {
  checkAppHealth,
  logTime,
  pageNotFound,
  catchApiError,
  asyncWrapper,
} from "./utils/index.js";
import { AppRouter } from "./routes/index.js";
export default function App() {
  const app = express();
  app.get("/api", asyncWrapper(checkAppHealth));
  app.use(logTime);
  app.use(express.json());
  app.use("/compressed", express.static(UPLOAD_DIR));
  app.use("/api", AppRouter());
  app.use(pageNotFound);
  app.use(catchApiError);
  return app;
}
