import http from 'http';
import { connectMongo } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { env, validateEnv } from './config/env.js';
import { createApp } from './app.js';
import { ensureGridInitialized } from './services/gridState.js';
import { registerSocketServer } from './sockets/index.js';

async function bootstrap() {
  validateEnv();
  await connectMongo();
  await connectRedis();
  await ensureGridInitialized();
  const { app, sessionMiddleware } = createApp();
  const server = http.createServer(app);
  await registerSocketServer(server, sessionMiddleware);
  server.listen(env.port, () => console.log(`[server] listening on ${env.appBaseUrl}`));
}

bootstrap().catch((error) => {
  console.error('[bootstrap] failed', error);
  process.exit(1);
});
