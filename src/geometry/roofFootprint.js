import { radians } from '../globals/radians.js';
import { earthCirc } from '../globals/earthCirc.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';

export function roofFootprint(mesh, backend, layer) {
  const map = backend._map, bounds = mesh.geometry.bounds, world = mesh.worldMatrix;
  const state = sceneByLayer.get(layer), zoom = state._tileZoom;
  const origin = map.project(sceneByLayer.get(backend)._sceneOrigin, zoom);
  const scale = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneByLayer.get(backend)._sceneOrigin.lat * radians));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let i, x, y, z, px, py, nw, se;
  for (i = 0; i < 8; i++) {
    x = i & 1 ? bounds.max[0] : bounds.min[0], y = i & 2 ? bounds.max[1] : bounds.min[1];
    z = i & 4 ? bounds.max[2] : bounds.min[2];
    px = origin.x + (world[0] * x + world[4] * y + world[8] * z + world[12]) * scale;
    py = origin.y + (world[2] * x + world[6] * y + world[10] * z + world[14]) * scale;
    minX = Math.min(minX, px); minY = Math.min(minY, py);
    maxX = Math.max(maxX, px); maxY = Math.max(maxY, py);
  }
  if (state.header.maxLat !== undefined && state.header.minLon !== undefined &&
    state.header.minLat !== undefined && state.header.maxLon !== undefined) {
    nw = map.project(/* alloc */ [state.header.maxLat, state.header.minLon], zoom);
    se = map.project(/* alloc */ [state.header.minLat, state.header.maxLon], zoom);
    minX = Math.max(minX, nw.x); minY = Math.max(minY, nw.y);
    maxX = Math.min(maxX, se.x); maxY = Math.min(maxY, se.y);
    if (minX >= maxX || minY >= maxY) return null;
  }
  return /* alloc */ [minX, minY, maxX, maxY];
}
