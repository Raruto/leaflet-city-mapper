import { evaluateStyle } from '../vector-style/evaluateStyle.js';
import { projectVectorPoint } from './projectVectorPoint.js';
import { vectorLabelProperty } from './vectorLabelProperty.js';
import { vectorStyleValue } from './vectorStyleValue.js';

export function prepareVectorLabel(job, layer, entry, feature, order) {
  let text = entry.layout?.['text-field'];
  const { properties } = feature, { zoom } = job;
  if (Array.isArray(text)) text = evaluateStyle(text, properties, zoom);
  if (typeof text !== 'string') return;
  text = text.replace(/\{([^}]+)\}/g, vectorLabelProperty.bind(null, properties));
  if (!text.trim()) return;
  if (entry.layout?.['text-transform'] === 'uppercase') text = text.toUpperCase();
  const path = feature.geometry[0];
  if (!path?.length) return;
  const point = path[Math.floor(path.length / 2)];
  if (point[0] < 0 || point[0] >= layer.extent || point[1] < 0 || point[1] >= layer.extent) return;
  job.labels.push(/* alloc */ { text, latlng: projectVectorPoint(point, job.coords, layer.extent),
    order, entry, properties,
    size: vectorStyleValue(entry.layout, 'text-size', 12, properties, zoom),
    color: vectorStyleValue(entry.paint, 'text-color', '#000', properties, zoom),
    halo: vectorStyleValue(entry.paint, 'text-halo-color', '#fff', properties, zoom),
    haloWidth: vectorStyleValue(entry.paint, 'text-halo-width', 0, properties, zoom),
    priority: /* alloc */ ['place_labels', 'place'].includes(entry['source-layer']) ? 0
      : /* alloc */ ['street_labels', 'transportation_name'].includes(entry['source-layer']) ? 1 : 2,
  });
}
