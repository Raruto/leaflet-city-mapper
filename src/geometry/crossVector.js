/**
 * Compute the cross product of two three-dimensional vectors.
 *
 * @param {ArrayLike<number>} a First vector.
 * @param {ArrayLike<number>} b Second vector.
 *
 * @returns {Array<number>} Cross product.
 */
export function cross(a, b) {
  return /* alloc */ [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}
