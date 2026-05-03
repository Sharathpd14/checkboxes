import { env } from '../config/env.js';
import { redis } from '../config/redis.js';

const BITSET_KEY = 'grid:bitset';
const VERSION_KEY = 'grid:version';

export async function ensureGridInitialized() {
  const exists = await redis.exists(BITSET_KEY);
  if (!exists) {
    await redis.setBit(BITSET_KEY, env.gridTotalBits - 1, 0);
    await redis.set(VERSION_KEY, '1');
  }
}

export async function getVisibleGrid() {
  const count = Math.min(env.visibleGridCells, env.gridTotalBits);
  const multi = redis.multi();
  for (let i = 0; i < count; i += 1) multi.getBit(BITSET_KEY, i);
  const raw = await multi.exec();
  return raw.map((item) => Number(Array.isArray(item) ? item[1] : item));
}

export async function toggleCheckbox(index) {
  const current = await redis.getBit(BITSET_KEY, index);
  const next = current === 1 ? 0 : 1;
  await redis.multi().setBit(BITSET_KEY, index, next).incr(VERSION_KEY).exec();
  return { index, checked: next === 1 };
}
