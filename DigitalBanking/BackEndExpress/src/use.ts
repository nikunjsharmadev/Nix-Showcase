import express from "express";
import cors from "cors";
import helmet from "helmet";
import type { Express } from "express";
import { CORS_CONFIG, HELMET_CONFIG } from "./constants/index.js";
import { catchApiError, logTime, pageNotFound } from "./utils/index.js";
import { AppRoutes } from "./routes/index.js";
// APP USE
export function AppUse(app: Express) {
  app.disable("x-powered-by");
  app.use(cors(CORS_CONFIG));
  app.use(helmet(HELMET_CONFIG));
  app.use(express.json());
  app.use(logTime);
  app.use("/api/v1", AppRoutes());
  app.use(pageNotFound);
  app.use(catchApiError);
}
