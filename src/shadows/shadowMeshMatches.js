export function shadowMeshMatches(cache, mesh) {
  const previous = cache.meshes.get(mesh), range = mesh.geometry.drawRange;
  if (!(previous && previous.world === mesh._worldMatrixVersion && previous.geometry === mesh.geometry &&
    previous.start === range.start && previous.count === range.count &&
    previous.appearance === (mesh._appearance ?? 1))) return false;
  let attribute;
  for (attribute of Object.values(mesh.geometry.attributes)) {
    if (attribute.needsUpdate) return false;
  }
  return true;
}
