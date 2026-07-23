import express from 'express';
import { asyncWrapper, checkAppHealth, logTime } from './utils/index.js';
import { AppUse, Database } from './index.js';
// APP
export function App() {
  const app = express();
  app.use(logTime);
  app.use(cors(CORS_CONFIG));
  app.get('/api/v1', asyncWrapper(checkAppHealth));
  AppUse(app);
  Database();
  return app;
}
