import { createMvtReader } from './createMvtReader.js';
import { expectMvtWire } from './expectMvtWire.js';
import { readMvtNumber } from './readMvtNumber.js';
import { takeMvtBytes } from './takeMvtBytes.js';

/**
 * Read a length-delimited protobuf message into a bounded reader.
 *
 * @param {Object} reader Parent MVT byte reader.
 * @param {number} wire Protobuf wire type.
 *
 * @returns {Object} Reader for the message bytes.
 */
export function readMvtMessage(reader, wire) {
  expectMvtWire(wire, 2);
  const size = readMvtNumber(reader), start = takeMvtBytes(reader, size);
  return createMvtReader(reader.bytes.subarray(start, start + size));
}
