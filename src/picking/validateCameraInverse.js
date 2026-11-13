/**
 * Verify that all components of an inverse camera matrix are finite.
 *
 * @param {DOMMatrix} matrix Inverse camera matrix.
 *
 * @throws {Error} If any matrix component is not finite.
 */
export function validateCameraInverse(matrix) {
  let column, row;
  for (column = 1; column <= 4; column++) {
    for (row = 1; row <= 4; row++) {
      if (!Number.isFinite(matrix[`m${column}${row}`])) throw /* alloc */ new Error('Singular 3D transform');
    }
  }
}
