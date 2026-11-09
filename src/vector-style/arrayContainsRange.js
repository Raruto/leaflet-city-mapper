export function arrayContainsRange(values, start, end, target) {
  let i = 0, value = null;
  for (i = start; i < end; i++) {
    value = values[i];
    if (value === target || (value !== value && target !== target)) return true;
  }
  return false;
}
