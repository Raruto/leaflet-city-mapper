import { decodeVectorTile } from '../mvt/decodeVectorTile.js';
import { prepareVectorStyleLayer } from './prepareVectorStyleLayer.js';

/**
 * Decode a vector tile and prepare its styled geometry and label candidates.
 *
 * @param {ArrayBuffer} buffer Encoded vector tile.
 * @param {Object} coords Tile coordinates.
 * @param {Array} style Style layer entries.
 * @param {number} zoom Style zoom.
 * @param {string} source Optional source identifier.
 * @param {number} maxZoom Maximum map zoom for style evaluation.
 * @param {number} mapZoom Current map zoom.
 *
 * @returns {Object} Prepared batches and labels.
 */
export function prepareVectorTile(buffer, coords, style, zoom, source, maxZoom = 19, mapZoom = zoom) {
  const layers = decodeVectorTile(buffer), byName = /* alloc */ new Map();
  const job = /* alloc */ { coords, zoom, mapZoom, maxZoom, output: /* alloc */ [], labels: /* alloc */ [],
    triangles: /* alloc */ new WeakMap(), projected: /* alloc */ new WeakMap() };
  let layer, order, entry;
  for (layer of layers) byName.set(layer.name, layer);
  for ([order, entry] of style.entries()) {
    layer = byName.get(entry['source-layer']);
    if (!layer || source !== undefined && entry.source !== source) continue;
    prepareVectorStyleLayer(job, layer, entry, order);
  }
  return /* alloc */ { batches: job.output, labels: job.labels };
}
