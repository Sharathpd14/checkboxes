import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:4000',
  sessionSecret: process.env.SESSION_SECRET || '',
  jwtSigningSecret: process.env.JWT_SIGNING_SECRET || '',
  mongodbUri: process.env.MONGODB_URI || '',
  redisUrl: process.env.REDIS_URL || '',
  gridTotalBits: Number(process.env.GRID_TOTAL_BITS || 1000000),
  visibleGridCells: Number(process.env.VISIBLE_GRID_CELLS || 600),
  httpRateLimit: Number(process.env.HTTP_RATE_LIMIT || 150),
  wsRateLimit: Number(process.env.WS_RATE_LIMIT || 120),
  toggleRateLimit: Number(process.env.TOGGLE_RATE_LIMIT || 50),
  rateLimitWindowSeconds: Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60),
  trustProxy: Number(process.env.TRUST_PROXY || 1),
  clientId: process.env.CLIENT_ID || 'realtime-checkbox-client',
  clientRedirectUri: process.env.CLIENT_REDIRECT_URI || 'http://localhost:4000/api/auth/callback'
};

export function validateEnv() {
  const required = ['sessionSecret', 'jwtSigningSecret', 'mongodbUri', 'redisUrl'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}
