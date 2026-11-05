export function collectMeshes(node, meshes) {
  if (node.geometry?.attributes.position) meshes.push(node);
  for (const child of node.children) collectMeshes(child, meshes);
}
