import { Router } from 'express';
import { getVisibleGrid } from '../services/gridState.js';
import { httpRateLimit } from '../services/rateLimiter.js';
import { env } from '../config/env.js';

export const gridRouter = Router();
gridRouter.use(httpRateLimit('grid-api'));

gridRouter.get('/visible', async (_req, res, next) => {
  try {
    res.json({ totalBits: env.gridTotalBits, visibleCells: env.visibleGridCells, bits: await getVisibleGrid() });
  } catch (error) {
    next(error);
  }
});
