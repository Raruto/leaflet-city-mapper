/**
 * Check a slice for a value, treating NaN as equal to NaN.
 *
 * @param {Array} values Input values.
 * @param {number} start Inclusive start index.
 * @param {number} end Exclusive end index.
 * @param {*} target Value to find.
 *
 * @returns {boolean} Whether the value occurs in the slice.
 */
export function arrayContainsRange(values, start, end, target) {
  let i = 0, value = null;
  for (i = start; i < end; i++) {
    value = values[i];
    if (value === target || (value !== value && target !== target)) return true;
  }
  return false;
}
