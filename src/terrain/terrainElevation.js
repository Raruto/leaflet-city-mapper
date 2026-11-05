import { sample } from './sample.js';

/** Bilinear DEM sampling, with the original first-valid-neighbour no-data rule. */

export function terrainElevation(point, tiles) {
  const x = point.x - 0.5, y = point.y - 0.5;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const a = sample(tiles, x0, y0), b = sample(tiles, x0 + 1, y0);
  const c = sample(tiles, x0, y0 + 1), d = sample(tiles, x0 + 1, y0 + 1);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) {
    return Number.isFinite(a) ? a : Number.isFinite(b) ? b : Number.isFinite(c) ? c : Number.isFinite(d) ? d : null;
  }
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}
