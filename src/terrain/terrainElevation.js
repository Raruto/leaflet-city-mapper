import { sample } from './sample.js';

/** Bilinear DEM sampling, with the original first-valid-neighbour no-data rule. */

export function terrainElevation(point, tiles) {
  const x = point.x - 0.5, y = point.y - 0.5;
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const values = [sample(tiles, x0, y0), sample(tiles, x0 + 1, y0), sample(tiles, x0, y0 + 1), sample(tiles, x0 + 1, y0 + 1)];
  let valid = 0, first = null;
  let value;
  for (value of values) {
    if (!Number.isFinite(value)) continue;
    if (!valid) first = value;
    valid++;
  }
  if (valid < 4) return first;
  return (values[0] * (1 - fx) + values[1] * fx) * (1 - fy) +
    (values[2] * (1 - fx) + values[3] * fx) * fy;
}
