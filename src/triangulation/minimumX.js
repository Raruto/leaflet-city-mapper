export function minimumX(ring) {
  const values = [];
  let point;
  for (point of ring) values.push(point.x);
  return Math.min(...values);
}
