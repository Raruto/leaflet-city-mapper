export function hasUnsupportedPrimitives(meshes) {
  if (!meshes) return false;
  for (const mesh of meshes) {
    for (const primitive of mesh.primitives) {
      if (primitive.targets || (primitive.mode !== undefined && primitive.mode !== 4)) return true;
    }
  }
  return false;
}
