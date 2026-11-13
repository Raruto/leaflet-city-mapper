import { bridgesByLayer } from '../weakmaps/bridgesByLayer.js';

/**
 * Index bridge triangles in 64-pixel buckets for elevation lookup.
 *
 * @param {L.Layer} layer Terrain layer owning the bridge index.
 * @param {Array<Array<number>>} pixels Projected vertices including elevation.
 * @param {Array<Array<number>>} triangles Triangle vertex indices.
 */
export function indexBridge(layer, pixels, triangles) {
  const bridgeTriangles = /* alloc */ [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let t, triangle, i, p, x, y, key, bucket;
  for (t of triangles) {
    triangle = /* alloc */ [];
    for (i of t) triangle.push(pixels[i]);
    bridgeTriangles.push(triangle);
  }
  for (p of pixels) {
    minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]);
    maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]);
  }
  const bridge = /* alloc */ {
    triangles: bridgeTriangles,
    min: /* alloc */ [minX, minY],
    max: /* alloc */ [maxX, maxY],
  };
  for (x = Math.floor(bridge.min[0] / 64); x <= Math.floor(bridge.max[0] / 64); x++) {
    for (y = Math.floor(bridge.min[1] / 64); y <= Math.floor(bridge.max[1] / 64); y++) {
      key = `${x}/${y}`;
      bucket = bridgesByLayer.get(layer).get(key);
      if (!bucket) bridgesByLayer.get(layer).set(key, bucket = /* alloc */ []);
      bucket.push(bridge);
    }
  }
}
