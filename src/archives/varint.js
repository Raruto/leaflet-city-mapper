

export function varint(reader) {
  const { bytes } = reader;
  let value = 0;
  let factor, byte;
  for (factor = 1; factor <= 2 ** 49; factor *= 128) {
    if (reader.cursor >= bytes.length) {
      throw /* allocation: required -- Preserve the stack of this truncated directory. */ new Error('Truncated PMTiles directory');
    }
    byte = bytes[reader.cursor++];
    value += (byte & 127) * factor;
    if (!Number.isSafeInteger(value)) {
      throw /* allocation: required -- Preserve the stack of this invalid integer. */ new Error('Invalid PMTiles directory integer');
    }
    if (byte < 128) return value;
  }
  throw /* allocation: required -- Preserve the stack of this overlong integer. */ new Error('Invalid PMTiles directory integer');
}
