export function dot(a, b) {
  let sum = 0;
  let i;
  for (i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}
