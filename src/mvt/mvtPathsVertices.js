export function mvtPathsVertices(paths) {
  const vertices = /* alloc */ [];
  let path, point;
  for (path of paths) {
    for (point of path) vertices.push(point);
  }
  return vertices;
}
