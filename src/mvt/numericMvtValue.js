/**
 * Convert an MVT integer to a number when safe, otherwise to a decimal string.
 *
 * @param {bigint} value Integer value.
 *
 * @returns {number|string} Safely represented integer.
 */
export function numericMvtValue(value) {
  return value >= BigInt(Number.MIN_SAFE_INTEGER) && value <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(value) : value.toString();
}
