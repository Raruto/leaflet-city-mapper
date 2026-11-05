export function collectVisibleMesh(mesh, meshes) {
  if (!mesh.visible) return true;
  if (mesh.geometry && mesh._appearance !== 0) meshes.push(mesh);
}
