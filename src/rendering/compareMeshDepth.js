/**
 * Order opaque meshes front-to-back and transparent meshes by render order and depth.
 *
 * @param {Object} a First mesh.
 * @param {Object} b Second mesh.
 *
 * @returns {number} Sort comparison, breaking ties by mesh ID.
 */
export function compareMeshDepth(a, b) {
  return a.program.transparent
    ? (a.renderOrder || 0) - (b.renderOrder || 0) ||
      b._sortDepth - a._sortDepth || a.id - b.id
    : (a._sortDepth ?? 0) - (b._sortDepth ?? 0) || a.id - b.id;
}
