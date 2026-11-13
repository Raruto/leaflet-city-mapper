/**
 * Whether the stored vertex normal points opposite to a triangle's winding normal after transformation.
 *
 * @param {ArrayLike<number>} m Column-major world matrix.
 * @param {ArrayLike<number>} data Packed vertex normals.
 * @param {number} j Offset of the first vertex normal.
 * @param {number} nx Winding normal x.
 * @param {number} nz Winding normal z.
 *
 * @returns {boolean} True when the winding normal must be flipped.
 */
export function flipsNormal(m, data, j, nx, nz) {
  return (m[0] * data[j] + m[4] * data[j + 1] + m[8] * data[j + 2]) * nx +
    (m[2] * data[j] + m[6] * data[j + 1] + m[10] * data[j + 2]) * nz < 0;
}
