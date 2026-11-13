/** Area-weighted vertex normals, for indexed or non-indexed triangles. */
export function vertexNormals(p, indices) {
  // Accumulate area-weighted face normals for shared vertices, then normalize.
  const normals = /* alloc */ new Float32Array(p.length);
  let i, a, b, c, ux, uy, uz, vx, vy, vz, j, nx, ny, nz, index, length;
  for (i = 0; i < (indices?.length || p.length / 3); i += 3) {
    a = indices ? indices[i] : i, b = indices ? indices[i + 1] : i + 1, c = indices ? indices[i + 2] : i + 2;
    ux = p[b * 3] - p[a * 3], uy = p[b * 3 + 1] - p[a * 3 + 1], uz = p[b * 3 + 2] - p[a * 3 + 2];
    vx = p[c * 3] - p[a * 3], vy = p[c * 3 + 1] - p[a * 3 + 1], vz = p[c * 3 + 2] - p[a * 3 + 2];
    nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (j = 0; j < 3; j++) {
      index = j === 0 ? a : j === 1 ? b : c;
      normals[index * 3] += nx;
      normals[index * 3 + 1] += ny;
      normals[index * 3 + 2] += nz;
    }
  }
  for (i = 0; i < normals.length; i += 3) {
    length = Math.hypot(normals[i], normals[i + 1], normals[i + 2]) || 1;
    for (j = 0; j < 3; j++) {
      normals[i + j] /= length;
    }
  }
  return normals;
}
