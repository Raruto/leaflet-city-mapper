export function sub(a, b) {
  const result = [];
  let i;
  for (i = 0; i < a.length; i++) result.push(a[i] - b[i]);
  return result;
}
