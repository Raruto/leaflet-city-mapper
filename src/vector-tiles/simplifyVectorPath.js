export function simplifyVectorPath(path, tolerance) {
  if (path.length < 3) return path;
  const keep = /* alloc */ new Uint8Array(path.length);
  const stack = /* alloc */ [/* alloc */ [0, path.length - 1]], output = /* alloc */ [];
  keep[0] = keep[path.length - 1] = 1;
  let start, end, a, b, dx, dy, length, index, distance, i, p, t, squared;
  while (stack.length) {
    [start, end] = stack.pop(); a = path[start]; b = path[end];
    dx = b[0] - a[0]; dy = b[1] - a[1]; length = dx * dx + dy * dy;
    index = -1; distance = tolerance * tolerance;
    for (i = start + 1; i < end; i++) {
      p = path[i];
      t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
      squared = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
      if (squared > distance) { distance = squared; index = i; }
    }
    if (index >= 0) { keep[index] = 1; stack.push(/* alloc */ [start, index], /* alloc */ [index, end]); }
  }
  for (i = 0; i < path.length; i++) if (keep[i]) output.push(path[i]);
  return output;
}
