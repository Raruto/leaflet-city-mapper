import { directoryReader } from '../globals/directoryReader.js';
import { varint } from './readVarint.js';

/** Decode delta/varint directory columns, rejecting malformed entries. */

export function decodeDirectory(data) {
  const reader = directoryReader;
  const bytes = /* alloc */ new Uint8Array(data);
  reader.bytes = bytes;
  reader.cursor = 0;
  try {
    const count = varint(reader);
    if (count > (bytes.length - reader.cursor) / 4) {
      throw /* alloc */ new Error('Invalid PMTiles directory count');
    }
    const entries = /* alloc */ new Array(count);
    let tileId = 0;
    let i, entry, value;
    for (i = 0; i < count; i++) {
      tileId += varint(reader);
      if (!Number.isSafeInteger(tileId) || (i && tileId <= entries[i - 1].tileId)) {
        throw /* alloc */ new Error('Invalid PMTiles directory tile IDs');
      }
      entries[i] = /* alloc */ { tileId, runLength: 0, length: 0, offset: 0 };
    }
    for (entry of entries) entry.runLength = varint(reader);
    for (entry of entries) {
      entry.length = varint(reader);
      if (!entry.length) {
        throw /* alloc */ new Error('Invalid PMTiles directory length');
      }
    }
    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      value = varint(reader);
      if (!value && !i) {
        throw /* alloc */ new Error('Invalid PMTiles directory offset');
      }
      entry.offset = value ? value - 1 : entries[i - 1].offset + entries[i - 1].length;
    }
    if (reader.cursor !== bytes.length) {
      throw /* alloc */ new Error('Trailing PMTiles directory data');
    }
    return entries;
  } finally {
    // Decoding is synchronous; release the input before reusing this reader.
    reader.bytes = null;
    reader.cursor = 0;
  }
}
