import { createMesh } from '../rendering/createMesh.js';
import { triangulate } from './triangulate.js';
import { local } from './local.js';
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
  for (const { geometry } of geojson.features) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
    for (const polygon of polygons) {
      const rings = [];
      for (const ring of polygon) {
        const path = ring.slice(0, -1);
        if (path.length >= 3) rings.push(path);
      }
      if (!rings.length) continue;
      const pixels = [], points = [];
      for (const ring of rings) for (const [lng, lat, z] of ring) {
        const p = map.project([lat, lng], zoom);
        pixels.push([p.x, p.y, z]);
      }
      for (const ring of rings) for (const coordinate of ring) points.push(local(coordinate, crs, origin, metres, base));
      let triangles;
      try {
        const paths = [];
        let start = 0;
        for (const ring of rings) {
          const path = [];
          for (let i = 0; i < ring.length; i++) path.push({ x: pixels[start + i][0], y: pixels[start + i][1] });
          paths.push(path);
          start += ring.length;
        }
        const [contour, ...holes] = paths;
        triangles = triangulate(contour, holes);
      } catch { continue; }
      const bridgeTriangles = [], xs = [], ys = [];
      for (const t of triangles) {
        const triangle = [];
        for (const i of t) triangle.push(pixels[i]);
        bridgeTriangles.push(triangle);
      }
      for (const p of pixels) { xs.push(p[0]); ys.push(p[1]); }
      const bridge = {
        triangles: bridgeTriangles,
        min: [Math.min(...xs), Math.min(...ys)],
        max: [Math.max(...xs), Math.max(...ys)],
      };
      for (let x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
        for (let y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
          const key = `${x}/${y}`;
          backend._bridges.set(key, [...backend._bridges.get(key) || [], bridge]);
        }
      }
      for (let [a, b, c] of triangles) {
        // Counter-clockwise seen from above, so double-sided shading keeps the top lit.
        const [pa, pb, pc] = [points[a], points[b], points[c]];
        if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) [b, c] = [c, b];
        for (const i of [a, b, c]) push(position, normal, color, points[i], [0, 1, 0]);
        for (const i of [a, c, b]) push(position, normal, color, below(points[i]), [0, -1, 0]);
      }
      let start = 0;
      for (const ring of rings) {
        for (let i = 0; i < ring.length; i++) {
          const p = points[start + i], q = points[start + (i + 1) % ring.length];
          const length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1, n = [(q[2] - p[2]) / length, 0, -(q[0] - p[0]) / length];
          for (const corner of [p, q, below(q), p, below(q), below(p)]) push(position, normal, color, corner, n);
        }
        start += ring.length;
      }
    }
  }
  if (position.length) {
    backend._bridgeMesh = createMesh(backend, { position, normal, color });
  }
}
