/**
 * Append positioned meshes from a node and its descendants to the supplied array.
 *
 * @param {Object} node Scene node to traverse.
 * @param {Object[]} meshes Array receiving the meshes.
 */
export function collectMeshes(node, meshes) {
  if (node.geometry?.attributes.position) meshes.push(node);
  let child;
  for (child of node.children) collectMeshes(child, meshes);
}
