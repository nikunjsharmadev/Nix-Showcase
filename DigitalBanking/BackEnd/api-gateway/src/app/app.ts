import express from 'express';
import { routes } from './routes/route.js';
export const App = () => {
  const app = express();
  const _routes = routes();
  app.use('/users', _routes.users());
  return app;
};
