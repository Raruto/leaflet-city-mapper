import { varint } from './varint.js';
import { state as sharedState } from '../state.js';
/** Decode delta/varint directory columns, rejecting malformed entries. */

export function decodeDirectory(data) {
  const reader = sharedState.directoryReader;
  const bytes = /* allocation: required -- The byte view must reference this directory input. */ new Uint8Array(data);
  reader.bytes = bytes;
  reader.cursor = 0;
  try {
    const count = varint(reader);
    if (count > (bytes.length - reader.cursor) / 4) {
      throw /* allocation: required -- Preserve the stack of this malformed directory. */ new Error('Invalid PMTiles directory count');
    }
    const entries = /* allocation: required -- Cached directories must own independent entry arrays. */ [];
    let tileId = 0;
    let i, entry, value;
    for (i = 0; i < count; i++) {
      tileId += varint(reader);
      if (!Number.isSafeInteger(tileId) || (i && tileId <= entries[i - 1].tileId)) {
        throw /* allocation: required -- Preserve the stack of this malformed directory. */ new Error('Invalid PMTiles directory tile IDs');
      }
      entries.push(/* allocation: required -- Each returned entry has independent mutable fields. */ { tileId });
    }
    for (entry of entries) entry.runLength = varint(reader);
    for (entry of entries) {
      entry.length = varint(reader);
      if (!entry.length) {
        throw /* allocation: required -- Preserve the stack of this malformed directory. */ new Error('Invalid PMTiles directory length');
      }
    }
    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      value = varint(reader);
      if (!value && !i) {
        throw /* allocation: required -- Preserve the stack of this malformed directory. */ new Error('Invalid PMTiles directory offset');
      }
      entry.offset = value ? value - 1 : entries[i - 1].offset + entries[i - 1].length;
    }
    if (reader.cursor !== bytes.length) {
      throw /* allocation: required -- Preserve the stack of this malformed directory. */ new Error('Trailing PMTiles directory data');
    }
    return entries;
  } finally {
    // Decoding is synchronous; release the input before reusing this reader.
    reader.bytes = null;
    reader.cursor = 0;
  }
}
