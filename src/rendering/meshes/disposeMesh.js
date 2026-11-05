import { setParent } from '../../scene/graph/setParent.js';
import { update } from '../../scene/lifecycle/update.js';

export function disposeMesh(backend, mesh) {
  if (!mesh) {
    return;
  }
  setParent(mesh, null);
  update(backend);
  for (const attribute of Object.values(mesh.geometry.attributes)) {
    attribute.buffer.destroy();
  }
}
