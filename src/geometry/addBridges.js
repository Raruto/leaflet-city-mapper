import { radians } from '../globals/radians.js';
import { sceneByLayer } from '../globals/sceneByLayer.js';


import { createMesh } from '../rendering/createMesh.js';
import { triangulate } from '../triangulation/triangulate.js';
import { local } from './bridgeLocal.js';

/**
 * Bare-earth DEMs drop bridges: `getElevation` returns the deck height inside these polygons (GeoJSON
 * Polygon/MultiPolygon with Z, e.g. IGN BD TOPO), and one mesh draws the 1.2 m thick decks.
 * ponytail: anything under a deck (quays, boats asking `getElevation`) also gets the deck height.
 */

export function addBridges(backend, geojson) {
  const map = backend._map, crs = map.options.crs, zoom = sceneByLayer.get(backend)._terrainZoom;
  const origin = crs.project(sceneByLayer.get(backend).location), metres = Math.cos(sceneByLayer.get(backend).location.lat * radians);
  const base = sceneByLayer.get(backend).root.position[1];
  const position = /* alloc */ [];
  const normal = /* alloc */ [];
  const color = /* alloc */ [];
  sceneByLayer.get(backend)._bridges = /* alloc */ new Map();
  let geometry, polygons, polygon, rings, ring, path, pixels, points, lng, lat, z, p, coordinate;
  let triangles, paths, start, i, contour, holes, bridgeTriangles, minX, minY, maxX, maxY, t, triangle, bridge, x, y;
  let key, a, b, c, pa, pb, pc, start2, q, length, nx, nz, corner, k, bucket, polygonIndex;
  for ({ geometry } of geojson.features) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    polygons = geometry.coordinates;
    for (polygonIndex = 0; polygonIndex < (geometry.type === 'Polygon' ? 1 : polygons.length); polygonIndex++) {
      polygon = geometry.type === 'Polygon' ? polygons : polygons[polygonIndex];
      rings = /* alloc */ [];
      for (ring of polygon) {
        path = ring.slice(0, -1);
        if (path.length >= 3) rings.push(path);
      }
      if (!rings.length) continue;
      pixels = /* alloc */ [];
      points = /* alloc */ [];
      for (ring of rings) for ([lng, lat, z] of ring) {
        p = map.project(/* alloc */ [lat, lng], zoom);
        pixels.push(/* alloc */ [p.x, p.y, z]);
      }
      for (ring of rings) for (coordinate of ring) points.push(local(coordinate, crs, origin, metres, base));
      triangles = void 0;
      try {
        paths = /* alloc */ [];
        start = 0;
        for (ring of rings) {
          path = /* alloc */ [];
          for (i = 0; i < ring.length; i++) path.push(/* alloc */ { x: pixels[start + i][0], y: pixels[start + i][1] });
          paths.push(path);
          start += ring.length;
        }
        [contour, ...holes] = paths;
        triangles = triangulate(contour, holes);
      } catch { continue; }
      bridgeTriangles = /* alloc */ [];
      minX = minY = Infinity; maxX = maxY = -Infinity;
      for (t of triangles) {
        triangle = /* alloc */ [];
        for (i of t) triangle.push(pixels[i]);
        bridgeTriangles.push(triangle);
      }
      for (p of pixels) {
        minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]);
        maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]);
      }
      bridge = /* alloc */ {
        triangles: bridgeTriangles,
        min: /* alloc */ [minX, minY],
        max: /* alloc */ [maxX, maxY],
      };
      for (x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
        for (y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
          key = `${x}/${y}`;
          bucket = sceneByLayer.get(backend)._bridges.get(key);
          if (!bucket) sceneByLayer.get(backend)._bridges.set(key, bucket = /* alloc */ []);
          bucket.push(bridge);
        }
      }
      for ([a, b, c] of triangles) {
        // Counter-clockwise seen from above, so double-sided shading keeps the top lit.
        pa = points[a]; pb = points[b]; pc = points[c];
        if ((pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]) < 0) { i = b; b = c; c = i; }
        for (k = 0; k < 6; k++) {
          i = k === 0 || k === 3 ? a : k === 1 || k === 5 ? b : c;
          p = points[i];
          position.push(p[0], p[1] - (k >= 3 ? 1.2 : 0), p[2]);
          normal.push(0, k >= 3 ? -1 : 1, 0); color.push(0.6, 0.58, 0.54);
        }
      }
      start2 = 0;
      for (ring of rings) {
        for (i = 0; i < ring.length; i++) {
          p = points[start2 + i], q = points[start2 + (i + 1) % ring.length];
          length = Math.hypot(q[0] - p[0], q[2] - p[2]) || 1;
          nx = (q[2] - p[2]) / length; nz = -(q[0] - p[0]) / length;
          for (k = 0; k < 6; k++) {
            corner = k === 0 || k === 3 || k === 5 ? p : q;
            position.push(corner[0], corner[1] - (k === 2 || k >= 4 ? 1.2 : 0), corner[2]);
            normal.push(nx, 0, nz); color.push(0.6, 0.58, 0.54);
          }
        }
        start2 += ring.length;
      }
    }
  }
  if (position.length) {
    sceneByLayer.get(backend)._bridgeMesh = createMesh(backend, /* alloc */ { position, normal, color });
  }
}
