/**
 * Validate a requested COG byte range against size and numeric limits.
 *
 * @param {Object} source COG source with optional known size.
 * @param {number} offset Source-relative byte offset.
 * @param {number} length Requested byte length.
 *
 * @throws {Error} If the range is invalid or exceeds the supported bounds.
 */
export function validateCogRange(source, offset, length) {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 ||
    length <= 0 || length > 32000000 || !Number.isSafeInteger(offset + length) ||
    source.size !== undefined && offset + length > source.size) {
    throw /* alloc */ new Error('Invalid COG byte range');
  }
}
