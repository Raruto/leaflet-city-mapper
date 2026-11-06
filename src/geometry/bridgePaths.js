export function bridgePaths(rings, pixels) {
  const paths = /* alloc */ [];
  let start = 0, ring, path, i;
  for (ring of rings) {
    path = /* alloc */ [];
    for (i = 0; i < ring.length; i++) path.push(/* alloc */ { x: pixels[start + i][0], y: pixels[start + i][1] });
    paths.push(path);
    start += ring.length;
  }
  return paths;
}
