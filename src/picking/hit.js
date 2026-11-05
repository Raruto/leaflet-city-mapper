import { CELL } from '../constants/CELL.js';
import { collider } from '../collision/collider.js';
import { computeBounds } from '../geometry/computeBounds.js';
import { horizontalRay } from '../collision/horizontalRay.js';
import { traverse } from '../scene/traverse.js';
import { updateWorldMatrix } from '../scene/updateWorldMatrix.js';
import { shouldSkipOther } from './shouldSkipOther.js';
import { hitMesh } from './hitMesh.js';

// Horizontal normal of the nearest wall faced within `reach` metres of the feet at world (x, y, z), walking along
// the unit (dx, dz); knee and chest rays, so arches and tree crowns above the head let the walker through.
// ponytail: traffic vehicles and boats move on the GPU and are not obstacles.

export function hit(layer, x, y, z, dx, dz, reach) {
  updateWorldMatrix(layer.scene);
  const data = { x, y, z, dx, dz, reach, best: reach, found: null };
  for (const other of layer._shared._layers) {
    if (shouldSkipOther(other, layer)) continue;
    traverse(other.root, hitMesh, data);
  }
  return data.found;
}
