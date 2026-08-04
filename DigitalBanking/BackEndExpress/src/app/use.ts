import express from 'express';
import helmet from 'helmet';
import type { Express } from 'express';
import { HELMET_CONFIG, RATE_LIMIT_CONFIG } from './constants/index.js';
import { catchApiError, pageNotFound } from './utils/index.js';
import { AppRoutes } from './routes/index.js';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
// APP USE MIDDLEWARES
export function AppUse(app: Express) {
  app.disable('x-powered-by');
  app.use(helmet(HELMET_CONFIG));
  app.use(cookieParser());
  app.use(express.json());
  app.use(compression());
  app.use(rateLimit(RATE_LIMIT_CONFIG));
  app.use('/api/v1', AppRoutes());
  app.use(pageNotFound);
  app.use(catchApiError);
}
