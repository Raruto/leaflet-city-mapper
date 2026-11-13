import { CELL } from '../globals/CELL.js';

/**
 * Add a triangle index to every X/Z grid cell touched by its projected bounding box.
 *
 * @param {Map<string, number[]>} cells Spatial grid receiving triangle indices.
 * @param {number[]} v Packed triangle coordinates.
 * @param {number} t Triangle index.
 */
export function indexTriangle(cells, v, t) {
  let ix, iz, key;
  for (ix = Math.floor(Math.min(v[0], v[3], v[6]) / CELL); ix <= Math.floor(Math.max(v[0], v[3], v[6]) / CELL); ix++)
    for (iz = Math.floor(Math.min(v[2], v[5], v[8]) / CELL); iz <= Math.floor(Math.max(v[2], v[5], v[8]) / CELL); iz++) {
      key = ix + ',' + iz;
      if (!cells.has(key)) cells.set(key, /* alloc */ []);
      cells.get(key).push(t);
    }
}
