/**
 * Write three local-space vertices transformed by matrix m into v.
 *
 * @param {number[]} v Output packed triangle coordinates.
 * @param {number[]} a First vertex.
 * @param {number[]} b Second vertex.
 * @param {number[]} d Third vertex.
 * @param {ArrayLike<number>} m Column-major transformation matrix.
 */
export function transformVertices(v, a, b, d, m) {
  let k, p;
  for (k = 0; k < 3; k++) {
    p = k === 0 ? a : k === 1 ? b : d;
    v[k * 3] = m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12];
    v[k * 3 + 1] = m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13];
    v[k * 3 + 2] = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
  }
}
