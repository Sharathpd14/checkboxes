import { createClient } from '@redis/client';
import { env } from './env.js';

function makeClient() {
  return createClient({ url: env.redisUrl, socket: { reconnectStrategy: (retries) => Math.min(retries * 100, 3000) } });
}

export const redis = makeClient();
export const redisPub = makeClient();
export const redisSub = makeClient();

export async function connectRedis() {
  await Promise.all([redis.connect(), redisPub.connect(), redisSub.connect()]);
  console.log('[redis] connected');
}
