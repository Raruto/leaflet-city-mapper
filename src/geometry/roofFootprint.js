import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { sceneOriginByLayer } from '../weakmaps/sceneOriginByLayer.js';
import { tileZoomByLayer } from '../weakmaps/tileZoomByLayer.js';
import { radians } from '../globals/radians.js';
import { earthCirc } from '../globals/earthCirc.js';

export function roofFootprint(mesh, layer, rasterLayer) {
  const map = layer._map, bounds = mesh.geometry.bounds, world = mesh.worldMatrix;
  const zoom = tileZoomByLayer.get(rasterLayer)
  const origin = map.project(sceneOriginByLayer.get(layer), zoom);
  const scale = map.options.crs.scale(zoom) / (earthCirc * Math.cos(sceneOriginByLayer.get(layer).lat * radians));
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
  if (headerByLayer.get(rasterLayer).maxLat !== undefined && headerByLayer.get(rasterLayer).minLon !== undefined &&
    headerByLayer.get(rasterLayer).minLat !== undefined && headerByLayer.get(rasterLayer).maxLon !== undefined) {
    nw = map.project(/* alloc */ [headerByLayer.get(rasterLayer).maxLat, headerByLayer.get(rasterLayer).minLon], zoom);
    se = map.project(/* alloc */ [headerByLayer.get(rasterLayer).minLat, headerByLayer.get(rasterLayer).maxLon], zoom);
    minX = Math.max(minX, nw.x); minY = Math.max(minY, nw.y);
    maxX = Math.min(maxX, se.x); maxY = Math.min(maxY, se.y);
    if (minX >= maxX || minY >= maxY) return null;
  }
  return /* alloc */ [minX, minY, maxX, maxY];
}
