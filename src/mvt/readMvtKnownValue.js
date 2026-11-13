import { expectMvtWire } from './expectMvtWire.js';
import { numericMvtValue } from './numericMvtValue.js';
import { readMvtInteger } from './readMvtInteger.js';
import { readMvtString } from './readMvtString.js';
import { takeMvtBytes } from './takeMvtBytes.js';

/**
 * Decode a known MVT value field according to its protobuf type.
 *
 * @param {Object} reader MVT byte reader.
 * @param {number} field Value field number.
 * @param {number} wire Protobuf wire type.
 *
 * @returns {string|number|boolean} Decoded value.
 */
export function readMvtKnownValue(reader, field, wire) {
  let offset, integer;
  if (field === 1) return readMvtString(reader, wire);
  if (field === 2 || field === 3) {
    expectMvtWire(wire, field === 2 ? 5 : 1);
    offset = takeMvtBytes(reader, field === 2 ? 4 : 8);
    return field === 2 ? reader.view.getFloat32(offset, true) : reader.view.getFloat64(offset, true);
  }
  expectMvtWire(wire, 0);
  integer = readMvtInteger(reader);
  if (field === 4) return numericMvtValue(BigInt.asIntN(64, integer));
  if (field === 5) return numericMvtValue(integer);
  if (field === 6) return numericMvtValue((integer >> 1n) ^ -(integer & 1n));
  return integer !== 0n;
}
