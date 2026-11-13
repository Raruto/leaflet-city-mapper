import { readMvtNumber } from './readMvtNumber.js';

/**
 * Read a protobuf field tag and split its field number and wire type.
 *
 * @param {Object} reader MVT byte reader.
 *
 * @returns {Array<number>} Field number and wire type.
 *
 * @throws {Error} If the field number is invalid.
 */
export function readMvtField(reader) {
  const tag = readMvtNumber(reader);
  const field = Math.floor(tag / 8), wire = tag % 8;
  if (!field || field > 536870911) throw /* alloc */ new Error('Invalid MVT field number');
  return /* alloc */ [field, wire];
}
