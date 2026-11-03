import { decodeDirectory } from './decodeDirectory';
import { decompress } from './decompress';
import { tileId } from './tileId';
import { read } from "./read";
import { getHeader } from './getHeader';

/** Nearest directory entry at/before the Hilbert ID, then follow leaf pointers. */

export async function getZxy(backend, z, x, y, signal) {
  if (backend.options.archive?.getZxy) {
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
  for (let depth = 0; depth < 4; depth++) {
    if (visited.has(offset)) {
      throw new Error('Cyclic PMTiles directory');
    }
    visited.add(offset);
    const key = `${offset}:${length}`;
    if (!backend._directories.has(key)) {
      if (backend._directories.size >= 32) {
        backend._directories.delete(backend._directories.keys().next().value);
      }
      const pending = read(backend, offset, length)
        .then(data => decompress(data, header.internalCompression))
        .then(decodeDirectory)
        .catch(error => {
          if (backend._directories.get(key) === pending) {
            backend._directories.delete(key);
          }
          throw error;
        });
      backend._directories.set(key, pending);
    }
    const entries = await backend._directories.get(key);
    signal?.throwIfAborted();
    let low = 0, high = entries.length - 1;
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (entries[mid].tileId <= id) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    const entry = entries[high];
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
      const data = await decompress(await read(backend, header.tileDataOffset + entry.offset, entry.length, signal), header.tileCompression);
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
