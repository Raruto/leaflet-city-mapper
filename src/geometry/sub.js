export function sub(a, b) {
  const result = [];
  for (let i = 0; i < a.length; i++) result.push(a[i] - b[i]);
  return result;
}
