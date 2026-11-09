import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { projectVectorPoint } from './projectVectorPoint.js';
import { vectorLabelProperty } from './vectorLabelProperty.js';
import { vectorStyleValue } from './vectorStyleValue.js';
import { vectorLabelAnchors } from './vectorLabelAnchors.js';

export function prepareVectorLabel(job, layer, entry, feature, order) {
  let text = entry.layout?.['text-field'];
  const { properties } = feature, { zoom } = job;
  const icon = entry.layout?.['symbol-placement'] === 'line' ? null
    : evaluateStyle(entry.layout?.['icon-image'], properties, zoom);
  if (Array.isArray(text)) text = evaluateStyle(text, properties, zoom);
  if (typeof text !== 'string') text = '';
  text = text.replace(/\{([^}]+)\}/g, vectorLabelProperty.bind(null, properties));
  if (!text.trim() && typeof icon !== 'string') return;
  if (entry.layout?.['text-transform'] === 'uppercase') text = text.toUpperCase();
  const size = vectorStyleValue(entry.layout, 'text-size', 12, properties, zoom), line = feature.type === 2 && text.trim();
  const spacing = layer.extent / 16, anchors = /* alloc */ [];
  let path, anchor;
  for (path of line ? feature.geometry : feature.geometry.slice(0, 1)) {
    if (!path?.length) continue;
    if (!line) anchors.push(/* alloc */ { point: path[Math.floor(path.length / 2)], a: null });
    else for (anchor of vectorLabelAnchors(path, spacing)) anchors.push(anchor);
  }
  for (anchor of anchors) {
    if (anchor.point[0] < 0 || anchor.point[0] >= layer.extent || anchor.point[1] < 0 || anchor.point[1] >= layer.extent) continue;
    job.labels.push(/* alloc */ { text, latlng: projectVectorPoint(anchor.point, job.coords, layer.extent),
    order, entry, properties, size, pixelBase: anchor.length * 256 / layer.extent / 2 ** job.coords.z,
    along: anchor.a ? /* alloc */ [
      projectVectorPoint(anchor.a, job.coords, layer.extent),
      projectVectorPoint(anchor.b, job.coords, layer.extent),
    ] : null,
    icon: text.trim() ? null : icon,
    iconOffset: evaluateStyle(entry.layout?.['icon-offset'], properties, zoom) || /* alloc */ [0, 0],
    allowOverlap: entry.layout?.['icon-allow-overlap'] === true,
    color: vectorStyleValue(entry.paint, 'text-color', '#000', properties, zoom),
    halo: vectorStyleValue(entry.paint, 'text-halo-color', '#fff', properties, zoom),
    haloWidth: vectorStyleValue(entry.paint, 'text-halo-width', 0, properties, zoom),
    priority: /* alloc */ ['place_labels', 'place'].includes(entry['source-layer']) ? 0
      : /* alloc */ ['street_labels', 'transportation_name'].includes(entry['source-layer']) ? 1 : 2,
        });
      }
    }
