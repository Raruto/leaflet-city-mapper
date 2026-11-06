import { triangulate } from '../triangulation/triangulate.js';
import { local } from './bridgeLocal.js';
import { bridgePaths } from './bridgePaths.js';
import { indexBridge } from './indexBridge.js';
import { bridgeFaces } from './bridgeFaces.js';
import { bridgeSides } from './bridgeSides.js';

export function bridgePolygon(context, polygon) {
  const { backend, map, zoom, crs, origin, metres, base } = context;
  const rings = /* alloc */ [];
  let ring, path, lng, lat, z, p, coordinate, paths, contour, holes, triangles;
  for (ring of polygon) {
    path = ring.slice(0, -1);
    if (path.length >= 3) rings.push(path);
  }
  if (!rings.length) return;
  const pixels = /* alloc */ [], points = /* alloc */ [];
  for (ring of rings) for ([lng, lat, z] of ring) {
    p = map.project(/* alloc */ [lat, lng], zoom);
    pixels.push(/* alloc */ [p.x, p.y, z]);
  }
  for (ring of rings) for (coordinate of ring) points.push(local(coordinate, crs, origin, metres, base));
  try {
    paths = bridgePaths(rings, pixels);
    [contour, ...holes] = paths;
    triangles = triangulate(contour, holes);
  } catch { return; }
  indexBridge(backend, pixels, triangles);
  bridgeFaces(context, points, triangles);
  bridgeSides(context, points, rings);
}
