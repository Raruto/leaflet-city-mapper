/**
 * Interpolate corresponding color components into a reusable array.
 *
 * @param {number[]} a Starting components.
 * @param {number[]} b Ending components.
 * @param {number} t Interpolation factor.
 * @param {number[]} [values] Output array to reuse.
 *
 * @returns {number[]} Interpolated components.
 */
export function mix(a, b, t, values) {
  values ||= /* alloc */ [];
  values.length = a.length;
  let i;
  for (i = 0; i < a.length; i++) values[i] = a[i] + (b[i] - a[i]) * t;
  return values;
}
