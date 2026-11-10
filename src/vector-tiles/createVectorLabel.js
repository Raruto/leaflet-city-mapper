import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { projectVectorPoint } from './projectVectorPoint.js';
import { vectorStyleValue } from './vectorStyleValue.js';

export function createVectorLabel(job, layer, entry, properties, order, text, icon, anchor, size) {
  return /* alloc */ {
    text, latlng: projectVectorPoint(anchor.point, job.coords, layer.extent),
    order, entry, properties, size, pixelBase: anchor.length * 256 / layer.extent / 2 ** job.coords.z,
    along: anchor.a ? /* alloc */ [
      projectVectorPoint(anchor.a, job.coords, layer.extent),
      projectVectorPoint(anchor.b, job.coords, layer.extent),
    ] : null,
    icon: text.trim() ? null : icon,
    iconOffset: evaluateStyle(entry.layout?.['icon-offset'], properties, job.zoom) || /* alloc */ [0, 0],
    allowOverlap: entry.layout?.['icon-allow-overlap'] === true,
    color: vectorStyleValue(entry.paint, 'text-color', '#000', properties, job.zoom),
    halo: vectorStyleValue(entry.paint, 'text-halo-color', '#fff', properties, job.zoom),
    haloWidth: vectorStyleValue(entry.paint, 'text-halo-width', 0, properties, job.zoom),
    priority: /* alloc */ ['place_labels', 'place'].includes(entry['source-layer']) ? 0
      : /* alloc */ ['street_labels', 'transportation_name'].includes(entry['source-layer']) ? 1 : 2,
  };
}
