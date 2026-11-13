/**
 * Flatten polygon paths into a vertex array.
 *
 * @param {Array<Array<Object>>} paths Polygon paths.
 *
 * @returns {Array<Object>} Flattened vertices.
 */
export function mvtPathsVertices(paths) {
  const vertices = /* alloc */ [];
  let path, point;
  for (path of paths) {
    for (point of path) vertices.push(point);
  }
  return vertices;
}
