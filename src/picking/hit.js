import { layersByLayer } from '../weakmaps/layersByLayer.js';
import { rootByLayer } from '../weakmaps/rootByLayer.js';
import { sceneByLayer } from '../weakmaps/sceneByLayer.js';
import { sharedByLayer } from '../weakmaps/sharedByLayer.js';




import { traverse } from '../scene/traverse.js';
import { updateWorldMatrix } from '../transforms/updateWorldMatrix.js';
import { shouldSkipOther } from './shouldSkipOther.js';
import { hitMesh } from './hitMesh.js';

// Horizontal normal of the nearest wall faced within `reach` metres of the feet at world (x, y, z), walking along
// the unit (dx, dz); knee and chest rays, so arches and tree crowns above the head let the walker through.
// ponytail: traffic vehicles and boats move on the GPU and are not obstacles.

export function hit(layer, x, y, z, dx, dz, reach, data) {
  updateWorldMatrix(sceneByLayer.get(layer));
  data.x = x, data.y = y, data.z = z, data.dx = dx, data.dz = dz, data.reach = reach;
  data.best = reach, data.found = false;
  let other;
  for (other of layersByLayer.get(sharedByLayer.get(layer))) {
    if (shouldSkipOther(other, layer)) continue;
    traverse(rootByLayer.get(other), hitMesh, data);
  }
  return data.found ? data.normal : null;
}
