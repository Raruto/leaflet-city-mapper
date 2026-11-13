/**
 * Check whether all provided values are finite.
 *
 * @param {ArrayLike<number>} values Values to inspect, if present.
 *
 * @returns {boolean} Whether every value is finite.
 */
export function finiteCogValues(values) {
  let value;
  for (value of values || /* alloc */ []) if (!Number.isFinite(value)) return false;
  return true;
}
