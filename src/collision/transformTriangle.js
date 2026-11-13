/**
 * Write three indexed or sequential positions transformed by matrix m into v.
 *
 * @param {number[]} v Output packed triangle coordinates.
 * @param {ArrayLike<number>} p Packed input positions.
 * @param {Object|undefined} index Optional geometry index attribute.
 * @param {number} i First vertex or index offset.
 * @param {ArrayLike<number>} m Column-major transformation matrix.
 */
export function transformTriangle(v, p, index, i, m) {
  let k, j, x, y, z;
  for (k = 0; k < 3; k++) {
    j = (index ? index.data[i + k] : i + k) * 3, x = p[j], y = p[j + 1], z = p[j + 2];
    v[k * 3] = m[0] * x + m[4] * y + m[8] * z + m[12];
    v[k * 3 + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    v[k * 3 + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  }
}
