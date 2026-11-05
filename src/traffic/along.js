/** Point and unit direction at distance `s` along `points` ([x, z, y?]) with cumulative `lengths`. */

export function along(points, lengths, s) {
  let i = 1, end = lengths.length - 1;
  let middle;
  while (i < end) {
    middle = i + Math.floor((end - i) / 2);
    if (lengths[middle] < s) i = middle + 1;
    else end = middle;
  }
  const a = points[i - 1], b = points[i], d = lengths[i] - lengths[i - 1] || 1;
  const t = (s - lengths[i - 1]) / d;
  return { x: a[0] + (b[0] - a[0]) * t, y: (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t, z: a[1] + (b[1] - a[1]) * t, dx: (b[0] - a[0]) / d, dz: (b[1] - a[1]) / d };
}
