import express from 'express';
import { utilFactory } from '../utils/index.js';
import { controllerFactory } from '../controllers/index.js';
// ROUTES
const createRoutes = () => {
  const { getUploadStorageConfig, asyncWrapper } = utilFactory;
  const { compressImage } = controllerFactory;
  const router = express.Router();
  router.route('/image').post(getUploadStorageConfig(), asyncWrapper(compressImage));
  return router;
};
export const routeFactory = createRoutes();
