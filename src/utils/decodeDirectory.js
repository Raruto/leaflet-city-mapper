/** Decode delta/varint directory columns, rejecting malformed entries. */

export function decodeDirectory(data) {
  const bytes = new Uint8Array(data);
  let cursor = 0;
  const varint = () => {
    let value = 0;
    for (let factor = 1; factor <= 2 ** 49; factor *= 128) {
      if (cursor >= bytes.length) throw new Error('Truncated PMTiles directory');
      const byte = bytes[cursor++];
      value += (byte & 127) * factor;
      if (!Number.isSafeInteger(value)) throw new Error('Invalid PMTiles directory integer');
      if (byte < 128) return value;
    }
    throw new Error('Invalid PMTiles directory integer');
  };
  const count = varint();
  if (count > (bytes.length - cursor) / 4) throw new Error('Invalid PMTiles directory count');
  const entries = [];
  let tileId = 0;
  for (let i = 0; i < count; i++) {
    tileId += varint();
    if (!Number.isSafeInteger(tileId) || (i && tileId <= entries[i - 1].tileId)) {
      throw new Error('Invalid PMTiles directory tile IDs');
    }
    entries.push({ tileId });
  }
  for (const entry of entries) entry.runLength = varint();
  for (const entry of entries) {
    entry.length = varint();
    if (!entry.length) throw new Error('Invalid PMTiles directory length');
  }
  entries.forEach((entry, i) => {
    const value = varint();
    if (!value && !i) throw new Error('Invalid PMTiles directory offset');
    entry.offset = value ? value - 1 : entries[i - 1].offset + entries[i - 1].length;
  });
  if (cursor !== bytes.length) throw new Error('Trailing PMTiles directory data');
  return entries;
}
