/**
 * Convert closed coordinate rings to point-object paths without duplicate closing vertices.
 *
 * @param {Array} rings Closed tile-coordinate rings.
 *
 * @returns {Array<Array<Object>>} Polygon point paths.
 */
export function mvtPolygonPaths(rings) {
  const paths = /* alloc */ [];
  let ring, i, path;
  for (ring of rings) {
    path = /* alloc */ [];
    for (i = 0; i < ring.length - 1; i++) {
      path.push(/* alloc */ { x: ring[i][0], y: ring[i][1] });
    }
    paths.push(path);
  }
  return paths;
}
