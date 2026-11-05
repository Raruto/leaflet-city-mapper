import { sceneByLayer } from '../globals/sceneByLayer.js';


import { raycast } from './raycast.js';

/**
 * Translate a geometry hit into a configured model or batched source feature.
 * Sorted half-open face ranges permit binary search without a feature per triangle.
 * @returns {PickedFeature|null}
 */

export function findFeature(backend, event) {
  if (!sceneByLayer.get(backend).root || !sceneByLayer.get(backend).camera) {
    return null;
  }
  let hit, object, ranges, low, high, middle, range;
  for (hit of raycast(backend, event, sceneByLayer.get(backend).root.children, Boolean(sceneByLayer.get(backend).model))) {
    if (sceneByLayer.get(backend).model) {
      object = hit.object;
      while (object && object !== sceneByLayer.get(backend).model) {
        object = object.parent;
      }
      if (object === sceneByLayer.get(backend).model) {
        return /* allocation: required -- Return an independent model hit to each caller. */ {
          id: sceneByLayer.get(backend).model.id, properties: sceneByLayer.get(backend).model.extras,
          model: sceneByLayer.get(backend).model, mesh: hit.object, point: hit.point
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
