export function sub(a, b) {
  const result = /* alloc */ new Array(a.length);
  let i;
  for (i = 0; i < result.length; i++) result[i] = a[i] - b[i];
  return result;
}
