import { createMesh } from '../rendering/createMesh.js';
import { triangulate } from '../triangulation/triangulate.js';
import { local } from './bridgeLocal.js';
import { push } from './push.js';
import { below } from './below.js';

/**
 * Bare-earth DEMs drop bridges: `getElevation` returns the deck height inside these polygons (GeoJSON
 * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
 * ponytail: anything under a deck (quays, boats asking `getElevation`) also gets the deck height.
 */

export function addBridges(backend, geojson) {
  const map = backend._map, crs = map.options.crs, zoom = backend._terrainZoom;
  const origin = crs.project(backend.location), metres = Math.cos(backend.location.lat * Math.PI / 180);
  const base = backend.root.position[1], position = [], normal = [], color = [];
  backend._bridges = new Map();
  let geometry, polygons, polygon, rings, ring, path, pixels, points, lng, lat, z, p, coordinate;
  let triangles, paths, start, i, contour, holes, bridgeTriangles, xs, ys, t, triangle, bridge, x, y;
  let key, a, b, c, pa, pb, pc, start2, q, length, n, corner;
  for ({ geometry } of geojson.features) {
    polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
    for (polygon of polygons) {
      rings = [];
      for (ring of polygon) {
        path = ring.slice(0, -1);
        if (path.length >= 3) rings.push(path);
      }
      if (!rings.length) continue;
      pixels = [], points = [];
      for (ring of rings) for ([lng, lat, z] of ring) {
        p = map.project([lat, lng], zoom);
        pixels.push([p.x, p.y, z]);
      }
      for (ring of rings) for (coordinate of ring) points.push(local(coordinate, crs, origin, metres, base));
      triangles = void 0;
      try {
        paths = [];
        start = 0;
        for (ring of rings) {
          path = [];
          for (i = 0; i < ring.length; i++) path.push({ x: pixels[start + i][0], y: pixels[start + i][1] });
          paths.push(path);
          start += ring.length;
        }
        [contour, ...holes] = paths;
        triangles = triangulate(contour, holes);
      } catch { continue; }
      bridgeTriangles = [], xs = [], ys = [];
      for (t of triangles) {
        triangle = [];
        for (i of t) triangle.push(pixels[i]);
        bridgeTriangles.push(triangle);
      }
      for (p of pixels) { xs.push(p[0]); ys.push(p[1]); }
      bridge = {
        triangles: bridgeTriangles,
        min: [Math.min(...xs), Math.min(...ys)],
        max: [Math.max(...xs), Math.max(...ys)],
      };
      for (x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
        for (y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
          key = `${x}/${y}`;
          backend._bridges.set(key, [...backend._bridges.get(key) || [], bridge]);
        }
      }
      for ([a, b, c] of triangles) {
        // Counter-clockwise seen from above, so double-sided shading keeps the top lit.
        [pa, pb, pc] = [points[a], points[b], points[c]];
        if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) [b, c] = [c, b];
        for (i of [a, b, c]) push(position, normal, color, points[i], [0, 1, 0]);
        for (i of [a, c, b]) push(position, normal, color, below(points[i]), [0, -1, 0]);
      }
      start2 = 0;
      for (ring of rings) {
        for (i = 0; i < ring.length; i++) {
          p = points[start2 + i], q = points[start2 + (i + 1) % ring.length];
          length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1, n = [(q[2] - p[2]) / length, 0, -(q[0] - p[0]) / length];
          for (corner of [p, q, below(q), p, below(q), below(p)]) push(position, normal, color, corner, n);
        }
        start2 += ring.length;
      }
    }
  }
  if (position.length) {
    backend._bridgeMesh = createMesh(backend, { position, normal, color });
  }
}
