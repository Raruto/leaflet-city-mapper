import { buildAreaFeature } from './buildAreaFeature.js';

/**
 * Process features in time-limited batches, stopping if the area request is aborted.
 *
 * @param {Object} context Area build context.
 * @param {Object} area Area state and abort controller.
 * @param {Array<Object>} features GeoJSON features to process.
 *
 * @returns {Promise<void>} Completion of feature processing.
 */
export async function buildAreaFeatures(context, area, features) {
  let deadline = performance.now() + 4, feature;
  for (feature of features) {
    if (area.request.signal.aborted) return;
    if (performance.now() >= deadline) {
      await /* alloc */ new Promise(requestAnimationFrame);
      if (area.request.signal.aborted) return;
      deadline = performance.now() + 4;
    }
    buildAreaFeature(context, feature);
  }
}
