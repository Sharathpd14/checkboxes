import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { redisPub, redisSub } from '../config/redis.js';
import { toggleCheckbox } from '../services/gridState.js';
import { checkSocketRateLimit } from '../services/rateLimiter.js';
import { CHANNELS } from '../utils/pubsub.js';

export async function registerSocketServer(server, sessionMiddleware) {
  const io = new Server(server, { cors: { origin: env.appBaseUrl, credentials: true } });

  io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
  io.use((socket, next) => {
    socket.user = socket.request.session?.user || null;
    if (!socket.user) return next(new Error('Unauthorized'));
    next();
  });

  await redisSub.subscribe(CHANNELS.checkboxUpdated, (message) => {
    io.emit('checkbox:updated', JSON.parse(message));
  });

  io.on('connection', (socket) => {
    socket.emit('session:user', socket.user);
    socket.on('checkbox:toggle', async ({ index }, callback) => {
      try {
        await checkSocketRateLimit(socket, 'ws-events', env.wsRateLimit);
        await checkSocketRateLimit(socket, 'ws-toggle', env.toggleRateLimit);
        const parsed = Number(index);
        if (Number.isNaN(parsed) || parsed < 0 || parsed >= env.visibleGridCells) throw new Error('Invalid checkbox index');
        const update = await toggleCheckbox(parsed);
        const payload = { ...update, updatedBy: socket.user.sub, at: Date.now() };
        await redisPub.publish(CHANNELS.checkboxUpdated, JSON.stringify(payload));
        callback?.({ ok: true, ...payload });
      } catch (error) {
        callback?.({ ok: false, error: error.message, ...(error.data || {}) });
      }
    });
  });
}
