export function triangle(position, normal, color, a, b, c, tint) {
  const u = [], v = [];
  for (let i = 0; i < b.length; i++) u.push(b[i] - a[i]);
  for (let i = 0; i < c.length; i++) v.push(c[i] - a[i]);
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], length = Math.hypot(...n);
  for (const point of [a, b, c]) {
    position.push(...point);
    for (const value of n) normal.push(value / length);
    color.push(...tint);
  }
}
