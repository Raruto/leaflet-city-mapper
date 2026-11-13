/**
 * Offset a 3D point downward by the bridge deck thickness.
 *
 * @param {Array<number>} p Input point.
 *
 * @returns {Array<number>} Offset point.
 */
export function below(p) {
  return /* alloc */ [p[0], p[1] - 1.2, p[2]];
}
