export function collectMeshes(node, meshes) {
  if (node.geometry?.attributes.position) meshes.push(node);
  let child;
  for (child of node.children) collectMeshes(child, meshes);
}
