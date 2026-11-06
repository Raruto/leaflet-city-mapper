import { cameraByLayer } from '../weakmaps/cameraByLayer.js';
import { modelByLayer } from '../weakmaps/modelByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';



import { raycast } from './raycast.js';

/**
 * Translate a geometry hit into a configured model or batched source feature.
 * Sorted half-open face ranges permit binary search without a feature per triangle.
 * @returns {PickedFeature|null}
 */

export function findFeature(layer, event) {
  const model = modelByLayer.get(layer)
  if (!rootByLayer.get(layer) || !cameraByLayer.get(layer)) {
    return null;
  }
  let hit, object, ranges, low, high, middle, range;
  for (hit of raycast(layer, event, rootByLayer.get(layer).children, Boolean(model))) {
    if (model) {
      object = hit.object;
      while (object && object !== model) {
        object = object.parent;
      }
      if (object === model) {
        return /* alloc */ {
          id: model.id, properties: model.extras,
          model, mesh: hit.object, point: hit.point
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
        return /* alloc */ {
          ...range,
          mesh: hit.object,
          point: hit.point
        };
      }
    }
  }
  return null;
}
