import { readMvtInteger } from './readMvtInteger.js';

/**
 * Read a protobuf varint as a safe JavaScript number.
 *
 * @param {Object} reader MVT byte reader.
 *
 * @returns {number} Decoded integer.
 *
 * @throws {Error} If the integer exceeds the safe numeric range.
 */
export function readMvtNumber(reader) {
  const value = readMvtInteger(reader);
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw /* alloc */ new Error('MVT integer exceeds safe range');
  }
  return Number(value);
}
