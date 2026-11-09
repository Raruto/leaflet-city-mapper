import { decodeVectorTile } from '../mvt/decodeVectorTile.js';
import { prepareVectorStyleLayer } from './prepareVectorStyleLayer.js';

export function prepareVectorTile(buffer, coords, style, zoom, source, maxZoom = 19) {
  const layers = decodeVectorTile(buffer), byName = /* alloc */ new Map();
  const job = /* alloc */ { coords, zoom, maxZoom, output: /* alloc */ [], labels: /* alloc */ [],
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
