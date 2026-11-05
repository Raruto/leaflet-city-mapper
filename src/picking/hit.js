import { pluginState } from '../core/pluginState.js';

import { traverse } from '../scene/traverse.js';
import { updateWorldMatrix } from '../scene/updateWorldMatrix.js';
import { shouldSkipOther } from './shouldSkipOther.js';
import { hitMesh } from './hitMesh.js';

// Horizontal normal of the nearest wall faced within `reach` metres of the feet at world (x, y, z), walking along
// the unit (dx, dz); knee and chest rays, so arches and tree crowns above the head let the walker through.
// ponytail: traffic vehicles and boats move on the GPU and are not obstacles.

export function hit(layer, x, y, z, dx, dz, reach, data) {
  updateWorldMatrix(pluginState(layer).scene);
  data.x = x, data.y = y, data.z = z, data.dx = dx, data.dz = dz, data.reach = reach;
  data.best = reach, data.found = false;
  let other;
  for (other of pluginState(pluginState(layer)._shared)._layers) {
    if (shouldSkipOther(other, layer)) continue;
    traverse(pluginState(other).root, hitMesh, data);
  }
  return data.found ? data.normal : null;
}
