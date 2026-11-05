export function sub(a, b) {
  const result = /* allocation: required -- The caller owns this difference vector independently of its inputs. */ [];
  let i;
  for (i = 0; i < a.length; i++) result.push(a[i] - b[i]);
  return result;
}
