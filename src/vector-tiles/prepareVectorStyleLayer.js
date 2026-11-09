import { vectorStyleDependencies } from './vectorStyleDependencies.js';
import { vectorFeatureZoom } from './vectorFeatureZoom.js';
import { prepareVectorLabel } from './prepareVectorLabel.js';
import { vectorFeaturePaint } from './vectorFeaturePaint.js';
import { vectorPaint } from '../vector-style/vectorPaint.js';
import { appendVectorBatch } from './appendVectorBatch.js';

export function prepareVectorStyleLayer(job, layer, entry, order) {
  const batches = /* alloc */ new Map(), dependencies = vectorStyleDependencies(entry);
  const outlineColor = entry.type === 'fill' ? entry.paint?.['fill-outline-color'] : null;
  const outline = outlineColor ? /* alloc */ { ...entry, type: 'line',
    paint: /* alloc */ { 'line-color': outlineColor, 'line-width': 1 } } : null;
  let feature, sampleZoom, paint, batch;
  for (feature of layer.features) {
    sampleZoom = vectorFeatureZoom(entry, feature.properties, job.zoom, job.maxZoom);
    if (sampleZoom < 0) continue;
    if (entry.type === 'symbol') {
      prepareVectorLabel(job, layer, entry, feature, order);
      continue;
    }
    paint = vectorFeaturePaint(entry, feature, sampleZoom, job.maxZoom);
    if (!paint) continue;
    appendVectorBatch(job, layer, entry, feature, order, batches, dependencies, paint);
    if (outline && feature.type === 3) {
      appendVectorBatch(job, layer, outline, feature, order, batches, dependencies,
        vectorPaint(outline, feature.properties, sampleZoom));
    }
  }
  for (batch of batches.values()) if (batch.paths.length) job.output.push(batch);
}
