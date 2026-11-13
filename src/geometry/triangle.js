/**
 * Append a colored triangle and its normalized face normal.
 *
 * @param {Array<number>} position Destination positions.
 * @param {Array<number>} normal Destination normals.
 * @param {Array<number>} color Destination colors.
 * @param {Array<number>} a First vertex.
 * @param {Array<number>} b Second vertex.
 * @param {Array<number>} c Third vertex.
 * @param {Array<number>} tint RGB color.
 */
export function triangle(position, normal, color, a, b, c, tint) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
  const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const length = Math.hypot(nx, ny, nz);
  let i, point;
  for (i = 0; i < 3; i++) {
    point = i === 0 ? a : i === 1 ? b : c;
    position.push(...point);
    normal.push(nx / length, ny / length, nz / length);
    color.push(...tint);
  }
}
