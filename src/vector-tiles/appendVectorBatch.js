import { vectorFeaturePaths } from './vectorFeaturePaths.js';

/**
 * Group feature paths by paint and style dependencies, splitting large batches.
 *
 * @param {Object} job Vector tile preparation job.
 * @param {Object} layer Decoded source layer.
 * @param {Object} entry Style layer entry.
 * @param {Object} feature Decoded feature.
 * @param {number} order Style layer order.
 * @param {Map} batches Batches indexed by paint and property values.
 * @param {Iterable<string>} dependencies Feature properties used by the style.
 * @param {Object} paint Evaluated paint.
 */
export function appendVectorBatch(job, layer, entry, feature, order, batches, dependencies, paint) {
  const values = /* alloc */ [];
  let key, batch, path, count;
  for (key of dependencies) values.push(feature.properties[key]);
  key = JSON.stringify(/* alloc */ [paint, values]);
  batch = batches.get(key);
  if (!batch) {
    batch = /* alloc */ { kind: entry.type, order, paint, properties: feature.properties, entry,
      paths: /* alloc */ [], coordinates: 0 };
    batches.set(key, batch);
  }
  for (path of vectorFeaturePaths(job, layer, entry, feature)) {
    count = entry.type === 'fill' ? 3 : path.length;
    if (batch.coordinates + count > 6000 && batch.paths.length) {
      job.output.push(/* alloc */ { ...batch, paths: batch.paths });
      batch.paths = /* alloc */ []; batch.coordinates = 0;
    }
    batch.paths.push(path); batch.coordinates += count;
  }
}
