import { buildAreaFeature } from './buildAreaFeature.js';

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
