import express from 'express';
import { UPLOAD_DIR } from './consts/index.js';
import { Utils } from './utils/index.js';
import { Routes } from './routes/index.js';
// APP
export const App = () => {
  const utils = Utils;
  const app = express();
  app.get('/api', utils().checkAppHealth);
  app.use(utils().logTime);
  app.use(express.json());
  app.use('/compressed', express.static(UPLOAD_DIR));
  app.use('/api', Routes());
  app.use(utils().pageNotFound);
  app.use(utils().catchApiError);
  return app;
};
