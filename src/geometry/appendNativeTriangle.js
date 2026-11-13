/**
 * Project three native vertices and append them to a destination array.
 *
 * @param {Function} point Vertex projection function.
 * @param {Array<number>} target Destination array.
 * @param {L.Point} a First vertex.
 * @param {L.Point} b Second vertex.
 * @param {L.Point} c Third vertex.
 * @param {L.Point} [anchorA] First vertex anchor.
 * @param {L.Point} [anchorB] Second vertex anchor.
 * @param {L.Point} [anchorC] Third vertex anchor.
 *
 * @returns {number} New destination length.
 */
export function triangle(point, target, a, b, c, anchorA, anchorB, anchorC) {
  return target.push(...point(a, anchorA), ...point(b, anchorB), ...point(c, anchorC));
}
