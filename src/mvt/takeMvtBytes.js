/**
 * Advance an MVT reader over a bounded number of bytes.
 *
 * @param {Object} reader MVT byte reader.
 * @param {number} size Number of bytes to take.
 *
 * @returns {number} Starting byte offset.
 *
 * @throws {Error} If the size is invalid or exceeds remaining bytes.
 */
export function takeMvtBytes(reader, size) {
  if (!Number.isSafeInteger(size) || size < 0 || size > reader.bytes.length - reader.pos) {
    throw /* alloc */ new Error('Truncated MVT field');
  }
  const start = reader.pos;
  reader.pos += size;
  return start;
}
