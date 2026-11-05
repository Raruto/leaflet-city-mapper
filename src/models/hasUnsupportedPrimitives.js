export function hasUnsupportedPrimitives(meshes) {
  if (!meshes) return false;
  let mesh, primitive;
  for (mesh of meshes) {
    for (primitive of mesh.primitives) {
      if (primitive.targets || (primitive.mode !== undefined && primitive.mode !== 4)) return true;
    }
  }
  return false;
}
