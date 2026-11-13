/**
 * Read one unsigned PMTiles varint and advance the reader cursor.
 *
 * @param {Object} reader Reader containing the bytes and cursor.
 *
 * @returns {number} Decoded safe integer.
 *
 * @throws {Error} If the directory ends before the varint.
 * @throws {Error} If the decoded value exceeds the safe integer range.
 * @throws {Error} If the varint does not terminate within the supported length.
 */
export function varint(reader) {
  const { bytes } = reader;
  let value = 0;
  let factor, byte;
  for (factor = 1; factor <= 2 ** 49; factor *= 128) {
    if (reader.cursor >= bytes.length) {
      throw /* alloc */ new Error('Truncated PMTiles directory');
    }
    byte = bytes[reader.cursor++];
    value += (byte & 127) * factor;
    if (!Number.isSafeInteger(value)) {
      throw /* alloc */ new Error('Invalid PMTiles directory integer');
    }
    if (byte < 128) return value;
  }
  throw /* alloc */ new Error('Invalid PMTiles directory integer');
}
