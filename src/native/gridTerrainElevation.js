import { terrainElevation } from '../terrain/terrainElevation.js';
import { nativeTerrainElevation } from './nativeTerrainElevation.js';

export function gridTerrainElevation(state, location) {
  let z = Math.max(0, Math.min(24, Math.round(state.map.getZoom())));
  const tiles = /* alloc */ new Map();
  let point, limit, x, y, index, dx, dy, tx, ty, entry, elevation;
  for (; z >= 0; z--) {
    point = state.map.project(location, z), limit = 2 ** z;
    x = Math.floor(point.x / 256), y = Math.floor(point.y / 256);
    elevation = nativeTerrainElevation(state, point, x, y, z);
    if (Number.isFinite(elevation)) return elevation;
    tiles.clear();
    for (index = 0; index < 9; index++) {
      dx = index % 3 - 1;
      dy = Math.floor(index / 3) - 1;
      tx = ((x + dx) % limit + limit) % limit;
      ty = Math.max(0, Math.min(limit - 1, y + dy));
      entry = state.terrainCache.get(`${z}/${tx}/${ty}`);
      if (entry?.data) tiles.set(`${x + dx}/${y + dy}`, entry.data);
    }
    elevation = terrainElevation(point, tiles);
    if (Number.isFinite(elevation)) return elevation;
  }
  return null;
}
