export function mix(a, b, t) {
  const values = [];
  for (let i = 0; i < a.length; i++) values.push(a[i] + (b[i] - a[i]) * t);
  return values;
}
