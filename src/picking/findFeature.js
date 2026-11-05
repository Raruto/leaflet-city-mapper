import { pluginState } from '../core/pluginState.js';
import { raycast } from './raycast.js';

/**
 * Translate a geometry hit into a configured model or batched source feature.
 * Sorted half-open face ranges permit binary search without a feature per triangle.
 * @returns {PickedFeature|null}
 */

export function findFeature(backend, event) {
  if (!pluginState(backend).root || !pluginState(backend).camera) {
    return null;
  }
  let hit, object, ranges, low, high, middle, range;
  for (hit of raycast(backend, event, pluginState(backend).root.children, Boolean(pluginState(backend).model))) {
    if (pluginState(backend).model) {
      object = hit.object;
      while (object && object !== pluginState(backend).model) {
        object = object.parent;
      }
      if (object === pluginState(backend).model) {
        return /* allocation: required -- Return an independent model hit to each caller. */ {
          id: pluginState(backend).model.id, properties: pluginState(backend).model.extras,
          model: pluginState(backend).model, mesh: hit.object, point: hit.point
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
        return /* allocation: required -- Preserve each feature hit as an independent result. */ {
          ...range,
          mesh: hit.object,
          point: hit.point
        };
      }
    }
  }
  return null;
}
