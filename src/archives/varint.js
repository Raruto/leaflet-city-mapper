

export function varint(reader) {
  const { bytes } = reader;
  let value = 0;
  let factor, byte;
  for (factor = 1; factor <= 2 ** 49; factor *= 128) {
    if (reader.cursor >= bytes.length) throw new Error('Truncated PMTiles directory');
    byte = bytes[reader.cursor++];
    value += (byte & 127) * factor;
    if (!Number.isSafeInteger(value)) throw new Error('Invalid PMTiles directory integer');
    if (byte < 128) return value;
  }
  throw new Error('Invalid PMTiles directory integer');
}
