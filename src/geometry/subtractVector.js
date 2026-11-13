/**
 * Subtract one vector from another component by component.
 *
 * @param {ArrayLike<number>} a First vector.
 * @param {ArrayLike<number>} b Vector to subtract.
 *
 * @returns {Array<number>} Difference vector.
 */
export function sub(a, b) {
  const result = /* alloc */ new Array(a.length);
  let i;
  for (i = 0; i < result.length; i++) result[i] = a[i] - b[i];
  return result;
}
