export function mix(a, b, t, values) {
  values ||= /* allocation: required -- Callers without an output buffer own an independent interpolation. */ [];
  values.length = a.length;
  let i;
  for (i = 0; i < a.length; i++) values[i] = a[i] + (b[i] - a[i]) * t;
  return values;
}
