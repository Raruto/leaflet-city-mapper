import { setParent } from '../scene/setParent.js';
import { update } from '../scene/update.js';

export function disposeMesh(backend, mesh) {
  if (!mesh) {
    return;
  }
  setParent(mesh, null);
  update(backend);
  let attribute;
  for (attribute of Object.values(mesh.geometry.attributes)) {
    attribute.buffer.destroy();
  }
}
