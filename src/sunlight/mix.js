export function mix(a, b, t, values) {
  values ||= /* alloc */ [];
  values.length = a.length;
  let i;
  for (i = 0; i < a.length; i++) values[i] = a[i] + (b[i] - a[i]) * t;
  return values;
}
