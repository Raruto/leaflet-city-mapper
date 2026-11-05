export function minimumX(ring) {
  const values = [];
  for (const point of ring) values.push(point.x);
  return Math.min(...values);
}
