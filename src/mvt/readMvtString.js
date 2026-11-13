import { mvtTextDecoder } from '../globals/mvtTextDecoder.js';
import { readMvtMessage } from './readMvtMessage.js';

/**
 * Decode a length-delimited UTF-8 string.
 *
 * @param {Object} reader MVT byte reader.
 * @param {number} wire Protobuf wire type.
 *
 * @returns {string} Decoded string.
 */
export function readMvtString(reader, wire) {
  return mvtTextDecoder.decode(readMvtMessage(reader, wire).bytes);
}
