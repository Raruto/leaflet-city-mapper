import { takeMvtBytes } from './takeMvtBytes.js';

/**
 * Read an unsigned protobuf varint as a bigint.
 *
 * @param {Object} reader MVT byte reader.
 *
 * @returns {bigint} Decoded integer.
 *
 * @throws {Error} If the tenth byte exceeds the 64-bit range.
 * @throws {Error} If the varint does not terminate within ten bytes.
 */
export function readMvtInteger(reader) {
  let value = 0n, i = 0, byte;
  for (; i < 10; i++) {
    byte = reader.bytes[takeMvtBytes(reader, 1)];
    if (i === 9 && byte > 1) throw /* alloc */ new Error('Invalid MVT varint');
    value |= BigInt(byte & 127) << BigInt(i * 7);
    if (byte < 128) return value;
  }
  throw /* alloc */ new Error('Invalid MVT varint');
}
