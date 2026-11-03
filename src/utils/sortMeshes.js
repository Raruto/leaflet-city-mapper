
export function sortMeshes(meshes) {
  return meshes.sort((a, b) => Number(a.program.transparent) - Number(b.program.transparent) ||
    (a.program.transparent
      ? (a.renderOrder || 0) - (b.renderOrder || 0) ||
      b._sortDepth - a._sortDepth || a.id - b.id
      : a.id - b.id)
  );
}
