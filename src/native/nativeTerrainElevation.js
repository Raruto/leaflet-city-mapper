import { terrainElevation } from '../terrain/terrainElevation.js';
import { nativeGPUByLayer } from '../weakmaps/nativeGPUByLayer.js';

/**
 * Sample the finest rendered native terrain, including retained zoom levels.
 *
 * @param {Object} state Terrain stream state.
 * @param {Object} location Geographic location to sample.
 *
 * @returns {number|null} Elevation, or null if no rendered sample is available.
 */
export function nativeTerrainElevation(state, location) {
  let layer, native, mesh, request, coords, point, selected, x, y, col, row, u, v, a, b, c, d;
  let zoom = -1, projectedZoom;
  for (layer of Object.values(state.map._layers)) {
    native = nativeGPUByLayer.get(layer);
    if (native?.disposed || native?.terrainStream !== state) continue;
    for (mesh of native.meshes.values()) {
      request = mesh._terrainRequest;
      if (!request?.tiles || request.tile.coords.z <= zoom) continue;
      coords = request.tile.coords;
      if (projectedZoom !== coords.z) {
        point = state.map.project(location, coords.z);
        projectedZoom = coords.z;
      }
      if (point.x < coords.x * 256 || point.x > (coords.x + 1) * 256 ||
          point.y < coords.y * 256 || point.y > (coords.y + 1) * 256) continue;
      selected = request;
      zoom = coords.z;
    }
  }
  if (!selected) return null;
  point = state.map.project(location, zoom);
  ({ x, y } = selected.tile.coords);
  col = Math.max(0, Math.min(31, Math.floor((point.x - x * 256) / 8)));
  row = Math.max(0, Math.min(31, Math.floor((point.y - y * 256) / 8)));
  u = (point.x - x * 256 - col * 8) / 8;
  v = (point.y - y * 256 - row * 8) / 8;
  a = terrainElevation(/* alloc */ { x: x * 256 + col * 8, y: y * 256 + row * 8 }, selected.tiles);
  b = terrainElevation(/* alloc */ { x: x * 256 + (col + 1) * 8, y: y * 256 + row * 8 }, selected.tiles);
  c = terrainElevation(/* alloc */ { x: x * 256 + col * 8, y: y * 256 + (row + 1) * 8 }, selected.tiles);
  d = terrainElevation(/* alloc */ { x: x * 256 + (col + 1) * 8, y: y * 256 + (row + 1) * 8 }, selected.tiles);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)) return null;
  return u + v <= 1 ? a * (1 - u - v) + b * u + c * v :
    b * (1 - v) + c * (1 - u) + d * (u + v - 1);
}
