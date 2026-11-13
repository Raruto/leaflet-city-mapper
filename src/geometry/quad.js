/**
 * Append a quad as two triangles at a common height.
 *
 * @param {Function} addTriangle Triangle destination callback.
 * @param {Object} color Triangle color.
 * @param {Object} a First corner.
 * @param {Object} b Second corner.
 * @param {Object} c Third corner.
 * @param {Object} d Fourth corner.
 * @param {number} height Quad height.
 * @param {number|Array<number>} nx Normal x component or complete normal vector.
 * @param {number} ny Normal y component when nx is numeric.
 * @param {number} nz Normal z component when nx is numeric.
 */
export function quad(addTriangle, color, a, b, c, d, height, nx, ny, nz) {
  if (typeof nx !== 'number') {
    addTriangle(a, height, b, height, c, height, ...nx, color);
    addTriangle(a, height, c, height, d, height, ...nx, color);
  } else {
    addTriangle(a, height, b, height, c, height, nx, ny, nz, color);
    addTriangle(a, height, c, height, d, height, nx, ny, nz, color);
  }
}
