export function validateCogRange(source, offset, length) {
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || offset < 0 ||
    length <= 0 || length > 32000000 || !Number.isSafeInteger(offset + length) ||
    source.size !== undefined && offset + length > source.size) {
    throw /* alloc */ new Error('Invalid COG byte range');
  }
}
