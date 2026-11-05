/** Area-weighted vertex normals, for indexed or non-indexed triangles. */

export function vertexNormals(p, indices) {
  // Accumulate area-weighted face normals for shared vertices, then normalize.
  const normals = new Float32Array(p.length);
  let i, a, b, c, u, v, j, n, index, length;
  for (i = 0; i < (indices?.length || p.length / 3); i += 3) {
    a = indices ? indices[i] : i, b = indices ? indices[i + 1] : i + 1, c = indices ? indices[i + 2] : i + 2;
    u = [], v = [];
    for (j = 0; j < 3; j++) {
      u.push(p[b * 3 + j] - p[a * 3 + j]);
      v.push(p[c * 3 + j] - p[a * 3 + j]);
    }
    n = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    ];
    for (index of [a, b, c]) {
      for (j = 0; j < 3; j++) {
        normals[index * 3 + j] += n[j];
      }
    }
  }
  for (i = 0; i < normals.length; i += 3) {
    length = Math.hypot(...normals.subarray(i, i + 3)) || 1;
    for (j = 0; j < 3; j++) {
      normals[i + j] /= length;
    }
  }
  return normals;
}
