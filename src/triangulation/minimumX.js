export function minimumX(ring) {
  let minimum = Infinity;
  let point;
  for (point of ring) minimum = Math.min(minimum, point.x);
  return minimum;
}
