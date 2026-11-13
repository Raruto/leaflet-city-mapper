import { collectVisibleMesh } from './collectVisibleMesh.js';

/**
 * Traverse visible scene nodes, collecting camera-visible meshes and eligible shadow casters.
 *
 * @param {Object} mesh Scene node to visit.
 * @param {Object} sunlight Current sunlight state, if available.
 * @param {ArrayLike<number>} projection Camera projection-view matrix.
 * @param {Array} frustum Camera frustum planes.
 * @param {ArrayLike<number>} frustumLengths Lengths of the plane normals.
 * @param {Array<Object>} candidates Destination for visible meshes.
 * @param {Array<Object>} shadowMeshes Destination for shadow casters.
 */
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
