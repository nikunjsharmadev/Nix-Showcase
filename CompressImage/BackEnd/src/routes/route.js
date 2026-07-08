import express from "express";
import { asyncWrapper, getUploadStorageConfig } from "../utils/index.js";
import { CompressImageController } from "../controllers/index.js";
export function AppRouter() {
  const router = express.Router();
  router
    .route("/image")
    .post(getUploadStorageConfig(), asyncWrapper(CompressImageController));
  return router;
}
