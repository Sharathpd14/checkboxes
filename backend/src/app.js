import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { createSessionMiddleware } from './services/session.js';
import { authRouter } from './routes/authRoutes.js';
import { oidcRouter } from './routes/oidcRoutes.js';
import { gridRouter } from './routes/gridRoutes.js';
import { pageRouter } from './routes/pageRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../../../frontend/public');

export function createApp() {
  const app = express();
  const sessionMiddleware = createSessionMiddleware();
  app.set('trust proxy', env.trustProxy);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.appBaseUrl, credentials: true }));
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(sessionMiddleware);
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/oidc', oidcRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/grid', gridRouter);
  app.use(express.static(publicDir));
  app.use(pageRouter);
  app.use((error, _req, res, _next) => {
    res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
  });
  return { app, sessionMiddleware };
}
