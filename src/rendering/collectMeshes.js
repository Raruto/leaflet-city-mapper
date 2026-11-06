import { collectVisibleMesh } from './collectVisibleMesh.js';

export function collectMeshes(mesh, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes) {
  if (!mesh.visible) return;
  if (mesh.geometry) {
    if (sunlight?.altitude >= 3 && !mesh.tile && mesh._appearance !== 0 &&
      !mesh.program.nightLight && mesh.program.depthTest !== false) shadowMeshes.push(mesh);
    collectVisibleMesh(mesh, projection, frustum, frustumLengths, candidates);
  }
  let child;
  for (child of mesh.children) {
    collectMeshes(child, sunlight, projection, frustum, frustumLengths, candidates, shadowMeshes);
  }
}
