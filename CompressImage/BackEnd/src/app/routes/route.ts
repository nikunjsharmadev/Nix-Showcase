import express from 'express';
import { Utils } from '../utils/index.js';
import { Controllers } from '../controllers/index.js';
// ROUTES
export const Routes = () => {
  const utils = Utils;
  const controller = Controllers;
  const router = express.Router();
  router.route('/image').post(utils().getUploadStorageConfig(), utils().asyncWrapper(controller().compressImage));
  return router;
};
