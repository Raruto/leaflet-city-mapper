import { removeProgram } from './removeProgram.js';


export function disposeMesh(backend, mesh) {
  if (!mesh) {
    return;
  }
  backend.remove(mesh);
  for (const attribute of Object.values(mesh.geometry.attributes)) {
    attribute.buffer.destroy();
  }
  removeProgram(mesh.program);
}
