import { setParent } from '../scene/setParent.js';
import { update } from '../scene/scheduleSceneUpdate.js';

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
