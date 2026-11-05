import { varint } from './varint.js';
/** Decode delta/varint directory columns, rejecting malformed entries. */

export function decodeDirectory(data) {
  const bytes = new Uint8Array(data);
  const reader = { bytes, cursor: 0 };
  const count = varint(reader);
  if (count > (bytes.length - reader.cursor) / 4) throw new Error('Invalid PMTiles directory count');
  const entries = [];
  let tileId = 0;
  for (let i = 0; i < count; i++) {
    tileId += varint(reader);
    if (!Number.isSafeInteger(tileId) || (i && tileId <= entries[i - 1].tileId)) {
      throw new Error('Invalid PMTiles directory tile IDs');
    }
    entries.push({ tileId });
  }
  for (const entry of entries) entry.runLength = varint(reader);
  for (const entry of entries) {
    entry.length = varint(reader);
    if (!entry.length) throw new Error('Invalid PMTiles directory length');
  }
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const value = varint(reader);
    if (!value && !i) throw new Error('Invalid PMTiles directory offset');
    entry.offset = value ? value - 1 : entries[i - 1].offset + entries[i - 1].length;
  }
  if (reader.cursor !== bytes.length) throw new Error('Trailing PMTiles directory data');
  return entries;
}
