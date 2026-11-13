import { readMvtMessage } from './readMvtMessage.js';
import { readMvtNumber } from './readMvtNumber.js';

/**
 * Append packed or unpacked protobuf integers to a destination array.
 *
 * @param {Object} reader MVT byte reader.
 * @param {number} wire Protobuf wire type.
 * @param {Array<number>} target Destination array.
 */
export function readMvtNumbers(reader, wire, target) {
  let packed;
  if (wire === 0) target.push(readMvtNumber(reader));
  else {
    packed = readMvtMessage(reader, wire);
    while (packed.pos < packed.bytes.length) target.push(readMvtNumber(packed));
  }
}
