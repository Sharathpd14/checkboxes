import createError from 'http-errors';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

async function consume({ prefix, identifier, limit }) {
  const key = `ratelimit:${prefix}:${identifier}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, env.rateLimitWindowSeconds);
  const retryAfter = await redis.ttl(key);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfter };
}

export function httpRateLimit(prefix = 'http') {
  return async (req, res, next) => {
    try {
      const id = req.session?.user?.sub || req.ip;
      const result = await consume({ prefix, identifier: id, limit: env.httpRateLimit });
      res.setHeader('X-RateLimit-Limit', String(env.httpRateLimit));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));
      if (!result.allowed) return next(createError(429, 'Too many requests'));
      next();
    } catch (error) {
      next(error);
    }
  };
}

export async function checkSocketRateLimit(socket, prefix, limit) {
  const id = socket.user?.sub || socket.handshake.address || socket.id;
  const result = await consume({ prefix, identifier: id, limit });
  if (!result.allowed) {
    const error = new Error('Rate limit exceeded');
    error.data = { retryAfter: result.retryAfter };
    throw error;
  }
}
