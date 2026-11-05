import { raycast } from './raycast.js';

/**
 * Translate a geometry hit into a configured model or batched source feature.
 * Sorted half-open face ranges permit binary search without a feature per triangle.
 * @returns {PickedFeature|null}
 */

export function findFeature(backend, event) {
  if (!backend.root || !backend.camera) {
    return null;
  }
  let hit, object, ranges, low, high, middle, range;
  for (hit of raycast(backend, event, backend.root.children, Boolean(backend.model))) {
    if (backend.model) {
      object = hit.object;
      while (object && object !== backend.model) {
        object = object.parent;
      }
      if (object === backend.model) {
        return {
          id: backend.model.id, properties: backend.model.extras,
          model: backend.model, mesh: hit.object, point: hit.point
        };
      }
    }
    ranges = hit.object.extras?.featureFaces;
    if (!ranges) {
      continue;
    }
    low = 0, high = ranges.length - 1;
    while (low <= high) {
      middle = (low + high) >> 1;
      range = ranges[middle];
      if (hit.faceIndex < range.faceStart) {
        high = middle - 1;
      } else if (hit.faceIndex >= range.faceEnd) {
        low = middle + 1;
      } else {
        return {
          ...range,
          mesh: hit.object,
          point: hit.point
        };
      }
    }
  }
  return null;
}
