export function compareMeshes(a, b) {
  return Number(Boolean(b.ground)) - Number(Boolean(a.ground)) ||
    (a.ground && b.ground ? (a.renderOrder || 0) - (b.renderOrder || 0) ||
      a.tile.coords.z - b.tile.coords.z : 0) ||
    Number(a.program.transparent) - Number(b.program.transparent) ||
    (a.program.transparent
      ? (a.renderOrder || 0) - (b.renderOrder || 0) ||
      b._sortDepth - a._sortDepth || a.id - b.id
      : (a._sortDepth ?? 0) - (b._sortDepth ?? 0) || a.id - b.id);
}
