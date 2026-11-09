import { vectorStyleDependencies } from './vectorStyleDependencies.js';
import { vectorFeatureZoom } from './vectorFeatureZoom.js';
import { prepareVectorLabel } from './prepareVectorLabel.js';
import { vectorFeaturePaint } from './vectorFeaturePaint.js';
import { appendVectorBatch } from './appendVectorBatch.js';

export function prepareVectorStyleLayer(job, layer, entry, order) {
  const batches = /* alloc */ new Map(), dependencies = vectorStyleDependencies(entry);
  let feature, sampleZoom, paint, batch;
  for (feature of layer.features) {
    sampleZoom = vectorFeatureZoom(entry, feature.properties, job.zoom, job.maxZoom);
    if (sampleZoom < 0) continue;
    if (entry.type === 'symbol') {
      prepareVectorLabel(job, layer, entry, feature, order);
      continue;
    }
    paint = vectorFeaturePaint(entry, feature, sampleZoom, job.maxZoom);
    if (paint) appendVectorBatch(job, layer, entry, feature, order, batches, dependencies, paint);
  }
  for (batch of batches.values()) if (batch.paths.length) job.output.push(batch);
}
