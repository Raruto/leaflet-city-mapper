import { getDirectoryEntries } from './getDirectoryEntries.js';
import { findDirectoryEntry } from './findDirectoryEntry.js';
import { getTileData } from './getTileData.js';

export async function findTile(backend, header, id, signal) {
  let offset = header.rootDirectoryOffset, length = header.rootDirectoryLength;
  let firstOffset = -1, secondOffset = -1, thirdOffset = -1;
  let depth, entries, entry, tile;
  for (depth = 0; depth < 4; depth++) {
    if (offset === firstOffset || offset === secondOffset || offset === thirdOffset) {
      throw /* alloc */ new Error('Cyclic PMTiles directory');
    }
    if (depth === 0) firstOffset = offset;
    else if (depth === 1) secondOffset = offset;
    else if (depth === 2) thirdOffset = offset;
    entries = await getDirectoryEntries(backend, offset, length, header.internalCompression);
    signal?.throwIfAborted();
    entry = findDirectoryEntry(entries, id);
    if (!entry) return;
    if (entry.runLength) {
      tile = await getTileData(backend, header, entry, id, signal);
      return tile;
    }
    if (entry.offset + entry.length > header.leafDirectoryLength) {
      throw /* alloc */ new Error('PMTiles directory outside leaf section');
    }
    offset = header.leafDirectoryOffset + entry.offset;
    length = entry.length;
  }
  throw /* alloc */ new Error('PMTiles directory depth exceeds four levels');
}
