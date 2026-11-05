export function sub(a, b) {
  const result = /* alloc */ [];
  let i;
  for (i = 0; i < a.length; i++) result.push(a[i] - b[i]);
  return result;
}
