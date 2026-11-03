import { createMesh } from '../utils/createMesh.js';
import { triangulate } from '../utils/triangulate.js';

/**
 * Bare-earth DEMs drop bridges: `_getElevation` returns the deck height inside these polygons (GeoJSON
 * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
 * ponytail: anything under a deck (quays, boats asking `_getElevation`) also gets the deck height.
 */
export function _addBridges(backend, geojson) {
  const map = backend._map, crs = map.options.crs, zoom = backend._terrainZoom;
  const origin = crs.project(backend.location), metres = Math.cos(backend.location.lat * Math.PI / 180);
  const base = backend.root.position[1], position = [], normal = [], color = [];
  const local = ([lng, lat, z]) => {
    const p = crs.project(new L.LatLng(lat, lng));
    return [(p.x - origin.x) * metres, z - base, -(p.y - origin.y) * metres];
  };
  const push = (p, n) => { position.push(...p); normal.push(...n); color.push(0.6, 0.58, 0.54); };
  backend._bridges = new Map();
  for (const { geometry } of geojson.features) {
    const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
    for (const polygon of polygons) {
      const rings = polygon.map(ring => ring.slice(0, -1)).filter(ring => ring.length >= 3);
      if (!rings.length) continue;
      const pixels = rings.flat().map(([lng, lat, z]) => { const p = map.project([lat, lng], zoom); return [p.x, p.y, z]; });
      const points = rings.flat().map(local);
      let triangles;
      try {
        const starts = rings.map((ring, r) => rings.slice(0, r).reduce((sum, previous) => sum + previous.length, 0));
        const [contour, ...holes] = rings.map((ring, r) => ring.map((c, i) => ({ x: pixels[starts[r] + i][0], y: pixels[starts[r] + i][1] })));
        triangles = triangulate(contour, holes);
      } catch { continue; }
      const bridge = {
        triangles: triangles.map(t => t.map(i => pixels[i])),
        min: [Math.min(...pixels.map(p => p[0])), Math.min(...pixels.map(p => p[1]))],
        max: [Math.max(...pixels.map(p => p[0])), Math.max(...pixels.map(p => p[1]))],
      };
      for (let x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
        for (let y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
          const key = `${x}/${y}`;
          backend._bridges.set(key, [...backend._bridges.get(key) || [], bridge]);
        }
      }
      const below = p => [p[0], p[1] - 1.2, p[2]];
      for (let [a, b, c] of triangles) {
        // Counter-clockwise seen from above, so double-sided shading keeps the top lit.
        const [pa, pb, pc] = [points[a], points[b], points[c]];
        if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) [b, c] = [c, b];
        for (const i of [a, b, c]) push(points[i], [0, 1, 0]);
        for (const i of [a, c, b]) push(below(points[i]), [0, -1, 0]);
      }
      let start = 0;
      for (const ring of rings) {
        for (let i = 0; i < ring.length; i++) {
          const p = points[start + i], q = points[start + (i + 1) % ring.length];
          const length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1, n = [(q[2] - p[2]) / length, 0, -(q[0] - p[0]) / length];
          for (const corner of [p, q, below(q), p, below(q), below(p)]) push(corner, n);
        }
        start += ring.length;
      }
    }
  }
  if (position.length) {
    backend._bridgeMesh = createMesh(backend, { position, normal, color });
  }
}
