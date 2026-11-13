/**
 * Collect visible geometry for raycasting and skip invisible subtrees.
 *
 * @param {Object} mesh Scene node being visited.
 * @param {Object[]} meshes Output mesh list.
 *
 * @returns {boolean|undefined} True when traversal should skip the node's descendants.
 */
export function collectVisibleMesh(mesh, meshes) {
  if (!mesh.visible) return true;
  if (mesh.geometry && mesh._appearance !== 0) meshes.push(mesh);
}
