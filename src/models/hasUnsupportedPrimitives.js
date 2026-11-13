/**
 * Check whether any mesh uses morph targets or a non-triangle primitive mode.
 *
 * @param {Array<Object>} meshes glTF meshes, if present.
 *
 * @returns {boolean} Whether unsupported primitives were found.
 */
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
