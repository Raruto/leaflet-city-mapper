import { setParent } from '../scene/setParent.js';
import { update } from '../scene/scheduleSceneUpdate.js';

/**
 * Detach a mesh and destroy its geometry buffers.
 *
 * @param {L.Layer} layer Layer to refresh.
 * @param {Object} mesh Mesh to dispose, if present.
 */
export function disposeMesh(layer, mesh) {
  if (!mesh) {
    return;
  }
  setParent(mesh, null);
  update(layer);
  let attribute;
  for (attribute of Object.values(mesh.geometry.attributes)) {
    attribute.buffer.destroy();
  }
}
