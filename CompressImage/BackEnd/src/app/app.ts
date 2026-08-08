import express from 'express';
import cors from 'cors';
import { constantFactory } from './consts/index.js';
import { utilFactory } from './utils/index.js';
import { routeFactory } from './routes/index.js';
import path from 'path';
// APP
const createApp = () => {
  const { CORS_OPTIONS, UPLOAD_DIR } = constantFactory;
  const { checkAppHealth, logTime, pageNotFound, catchApiError } = utilFactory;
  const app = express();
  app.use(cors(CORS_OPTIONS.cors));
  app.use(logTime);
  app.use(express.json());
  app.get('/api', checkAppHealth);
  app.get('/download/:filename', (req, res) => {
    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    res.download(filePath, 'my-image.jpg');
  });
  app.use('/compressed', express.static(UPLOAD_DIR));
  app.use('/api', routeFactory);
  app.use(pageNotFound);
  app.use(catchApiError);
  return app;
};
export const appFactory = createApp();
