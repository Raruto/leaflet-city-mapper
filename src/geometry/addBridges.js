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
  const origin = crs.project(sceneByLayer.get(backend).location), metres = Math.cos(sceneByLayer.get(backend).location.lat * Math.PI / 180);
  const base = sceneByLayer.get(backend).root.position[1];
  const position = /* allocation: required -- The bridge mesh retains its own position buffer. */ [];
  const normal = /* allocation: required -- The bridge mesh retains its own normal buffer. */ [];
  const color = /* allocation: required -- The bridge mesh retains its own color buffer. */ [];
  sceneByLayer.get(backend)._bridges = /* allocation: required -- Each backend retains an independent terrain bridge index. */ new Map();
  let geometry, polygons, polygon, rings, ring, path, pixels, points, lng, lat, z, p, coordinate;
  let triangles, paths, start, i, contour, holes, bridgeTriangles, minX, minY, maxX, maxY, t, triangle, bridge, x, y;
  let key, a, b, c, pa, pb, pc, start2, q, length, nx, nz, corner, k, bucket, polygonIndex;
  for ({ geometry } of geojson.features) {
    if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') continue;
    polygons = geometry.coordinates;
    for (polygonIndex = 0; polygonIndex < (geometry.type === 'Polygon' ? 1 : polygons.length); polygonIndex++) {
      polygon = geometry.type === 'Polygon' ? polygons : polygons[polygonIndex];
      rings = /* allocation: required -- Polygon ring topology stays private across reentrant projection callbacks. */ [];
      for (ring of polygon) {
        path = ring.slice(0, -1);
        if (path.length >= 3) rings.push(path);
      }
      if (!rings.length) continue;
      pixels = /* allocation: required -- Pixel vertices are retained by this bridge terrain index. */ [];
      points = /* allocation: required -- World vertices stay private across reentrant projection callbacks. */ [];
      for (ring of rings) for ([lng, lat, z] of ring) {
        p = map.project(/* allocation: required -- Projection receives an independent coordinate pair it may retain. */ [lat, lng], zoom);
        pixels.push(/* allocation: required -- Bridge triangles retain each independent pixel vertex and height. */ [p.x, p.y, z]);
      }
      for (ring of rings) for (coordinate of ring) points.push(local(coordinate, crs, origin, metres, base));
      triangles = void 0;
      try {
        paths = /* allocation: required -- Triangulation paths belong to this polygon conversion. */ [];
        start = 0;
        for (ring of rings) {
          path = /* allocation: required -- Each polygon ring needs independently ordered triangulation vertices. */ [];
          for (i = 0; i < ring.length; i++) path.push(/* allocation: required -- A triangulation path retains each pixel coordinate separately. */ { x: pixels[start + i][0], y: pixels[start + i][1] });
          paths.push(path);
          start += ring.length;
        }
        [contour, ...holes] = paths;
        triangles = triangulate(contour, holes);
      } catch { continue; }
      bridgeTriangles = /* allocation: required -- The terrain bridge index retains this polygon triangle list. */ [];
      minX = minY = Infinity; maxX = maxY = -Infinity;
      for (t of triangles) {
        triangle = /* allocation: required -- The terrain index retains each triangle as an independent vertex list. */ [];
        for (i of t) triangle.push(pixels[i]);
        bridgeTriangles.push(triangle);
      }
      for (p of pixels) {
        minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]);
        maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]);
      }
      bridge = /* allocation: required -- Spatial buckets retain this polygon bridge record. */ {
        triangles: bridgeTriangles,
        min: /* allocation: required -- The retained bridge owns its lower pixel bounds. */ [minX, minY],
        max: /* allocation: required -- The retained bridge owns its upper pixel bounds. */ [maxX, maxY],
      };
      for (x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
        for (y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
          key = `${x}/${y}`;
          bucket = sceneByLayer.get(backend)._bridges.get(key);
          if (!bucket) sceneByLayer.get(backend)._bridges.set(key, bucket = /* allocation: required -- This spatial cell retains its own bridge references. */ []);
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
    sceneByLayer.get(backend)._bridgeMesh = createMesh(backend, /* allocation: required -- Mesh construction receives the bridge-owned attribute buffers. */ { position, normal, color });
  }
}
