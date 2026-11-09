export function takeMvtBytes(reader, size) {
  if (!Number.isSafeInteger(size) || size < 0 || size > reader.bytes.length - reader.pos) {
    throw /* alloc */ new Error('Truncated MVT field');
  }
  const start = reader.pos;
  reader.pos += size;
  return start;
}
