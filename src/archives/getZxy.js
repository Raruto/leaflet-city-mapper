import { loadDirectory } from './loadDirectory.js';
import { decompress } from './decompress.js';
import { tileId } from './tileId.js';
import { read } from './read.js';
import { getHeader } from './getHeader.js';

/** Nearest directory entry at/before the Hilbert ID, then follow leaf pointers. */

export async function getZxy(backend, z, x, y, signal) {
  if (backend.options.archive && backend.options.archive !== backend && backend.options.archive.getZxy) {
    return backend.options.archive.getZxy(z, x, y, signal);
  }
  const id = tileId(z, x, y);
  signal?.throwIfAborted();
  const header = await getHeader(backend);
  signal?.throwIfAborted();
  if (z < header.minZoom || z > header.maxZoom) {
    return;
  }
  let offset = header.rootDirectoryOffset, length = header.rootDirectoryLength;
  const visited = new Set();
  let depth, key, pending, entries, low, high, mid, entry, data;
  for (depth = 0; depth < 4; depth++) {
    if (visited.has(offset)) {
      throw new Error('Cyclic PMTiles directory');
    }
    visited.add(offset);
    key = `${offset}:${length}`;
    if (!backend._directories.has(key)) {
      if (backend._directories.size >= 32) {
        backend._directories.delete(backend._directories.keys().next().value);
      }
      backend._directories.set(key, loadDirectory(backend, offset, length, header.internalCompression));
    }
    pending = backend._directories.get(key);
    entries = void 0;
    try {
      entries = await pending;
    } catch (error) {
      if (backend._directories.get(key) === pending) backend._directories.delete(key);
      throw error;
    }
    signal?.throwIfAborted();
    low = 0, high = entries.length - 1;
    while (low <= high) {
      mid = (low + high) >> 1;
      if (entries[mid].tileId <= id) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    entry = entries[high];
    if (!entry) {
      return;
    }
    if (entry.runLength) {
      if (id - entry.tileId >= entry.runLength) {
        return;
      }
      if (entry.offset + entry.length > header.tileDataLength) {
        throw new Error('PMTiles tile outside data section');
      }
      data = await decompress(await read(backend, header.tileDataOffset + entry.offset, entry.length, signal), header.tileCompression);
      signal?.throwIfAborted();
      return { data };
    }
    if (entry.offset + entry.length > header.leafDirectoryLength) {
      throw new Error('PMTiles directory outside leaf section');
    }
    offset = header.leafDirectoryOffset + entry.offset;
    length = entry.length;
  }
  throw new Error('PMTiles directory depth exceeds four levels');
}
