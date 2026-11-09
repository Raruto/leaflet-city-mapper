import { terrainElevation } from '../terrain/terrainElevation.js';
import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';

export function gridTerrainElevation(state, location) {
  let z = Math.max(0, Math.min(24, Math.round(state.map.getZoom())));
  const tiles = /* alloc */ new Map();
  let point, limit, x, y, dx, dy, tx, ty, entry, elevation, layer, native, request;
  for (; z >= 0; z--) {
    point = state.map.project(location, z), limit = 2 ** z;
    x = Math.floor(point.x / 256), y = Math.floor(point.y / 256);
    for (layer of Object.values(state.map._layers)) {
      native = nativeGPUByLayer.get(layer);
      if (native?.disposed || native?.terrainStream !== state) continue;
      request = native.terrainRequests?.get(`${x}:${y}:${z}`);
      if (!request?.tiles || layer._tiles[`${x}:${y}:${z}`] !== request.tile) continue;
      elevation = terrainElevation(point, request.tiles);
      if (Number.isFinite(elevation)) return elevation;
    }
    tiles.clear();
    for (dy = -1; dy <= 1; dy++) for (dx = -1; dx <= 1; dx++) {
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
