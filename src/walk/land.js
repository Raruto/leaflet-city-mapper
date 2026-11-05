import { sceneByLayer } from '../globals/sceneByLayer.js';
import { intersectMeshes } from '../collision/intersectMeshes.js';
import { traverse } from '../scene/traverse.js';
import { updateWorldMatrix } from '../scene/updateWorldMatrix.js';
import { collectVisibleMesh } from '../picking/collectVisibleMesh.js';
import { shouldSkipOther } from '../picking/shouldSkipOther.js';
import { local } from './local.js';

export function land(previousY) {
  const state = sceneByLayer.get(this.layer), ray = state.raycaster;
  const feet = local.call(this, this.local), root = state.root;
  const x = root.position[0] + feet[0] * root.scale[0];
  const y = root.position[1] + feet[1] * root.scale[1];
  const z = root.position[2] + feet[2] * root.scale[2];
  if (y > previousY || this.verticalSpeed > 0) return;
  updateWorldMatrix(state.scene);
  ray.origin[0] = x; ray.origin[1] = previousY + 0.01; ray.origin[2] = z;
  ray.direction[0] = 0; ray.direction[1] = -1; ray.direction[2] = 0;
  ray.meshes.length = 0;
  let layer, hit;
  for (layer of sceneByLayer.get(state._shared)._layers) {
    if (shouldSkipOther(layer, this.layer) || sceneByLayer.get(layer).kind === 'raster' || layer.options.nightLight) continue;
    traverse(sceneByLayer.get(layer).root, collectVisibleMesh, ray.meshes);
  }
  for (hit of intersectMeshes(ray, ray.meshes)) {
    if (hit.point[1] < y - 0.001) break;
    this.state.height += (hit.point[1] - y) / root.scale[1];
    this.verticalSpeed = 0;
    break;
  }
  ray.meshes.length = 0;
}
