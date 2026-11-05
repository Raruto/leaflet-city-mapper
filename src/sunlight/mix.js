export function mix(a, b, t) {
  const values = [];
  let i;
  for (i = 0; i < a.length; i++) values.push(a[i] + (b[i] - a[i]) * t);
  return values;
}
