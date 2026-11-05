import { sceneByLayer } from '../globals/sceneByLayer.js';


import { loadDirectory } from './loadDirectory.js';
import { decompress } from './decompress.js';
import { tileId } from './tileId.js';
import { read } from './read.js';
import { getHeader } from './getHeader.js';

/** Nearest directory entry at/before the Hilbert ID, then follow leaf pointers. */

export async function getZxy(backend, z, x, y, signal) {
  if (!sceneByLayer.has(backend)) return backend.getZxy(z, x, y, signal);
  if (backend.options.archive && backend.options.archive !== backend) {
    return getZxy(backend.options.archive, z, x, y, signal);
  }
  const id = tileId(z, x, y);
  signal?.throwIfAborted();
  const header = await getHeader(backend);
  signal?.throwIfAborted();
  if (z < header.minZoom || z > header.maxZoom) {
    return;
  }
  let offset = header.rootDirectoryOffset, length = header.rootDirectoryLength;
  let firstOffset = -1, secondOffset = -1, thirdOffset = -1;
  let depth, key, pending, entries, low, high, mid, entry, data;
  for (depth = 0; depth < 4; depth++) {
    if (offset === firstOffset || offset === secondOffset || offset === thirdOffset) {
      throw /* alloc */ new Error('Cyclic PMTiles directory');
    }
    if (depth === 0) firstOffset = offset;
    else if (depth === 1) secondOffset = offset;
    else if (depth === 2) thirdOffset = offset;
    key = `${offset}:${length}`;
    if (!sceneByLayer.get(backend)._directories.has(key)) {
      if (sceneByLayer.get(backend)._directories.size >= 32) {
        sceneByLayer.get(backend)._directories.delete(sceneByLayer.get(backend)._directories.keys().next().value);
      }
      sceneByLayer.get(backend)._directories.set(key, loadDirectory(backend, offset, length, header.internalCompression));
    }
    pending = sceneByLayer.get(backend)._directories.get(key);
    entries = void 0;
    try {
      entries = await pending;
    } catch (error) {
      if (sceneByLayer.get(backend)._directories.get(key) === pending) sceneByLayer.get(backend)._directories.delete(key);
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
        throw /* alloc */ new Error('PMTiles tile outside data section');
      }
      data = await decompress(await read(backend, header.tileDataOffset + entry.offset, entry.length, signal), header.tileCompression);
      signal?.throwIfAborted();
      return /* alloc */ { data };
    }
    if (entry.offset + entry.length > header.leafDirectoryLength) {
      throw /* alloc */ new Error('PMTiles directory outside leaf section');
    }
    offset = header.leafDirectoryOffset + entry.offset;
    length = entry.length;
  }
  throw /* alloc */ new Error('PMTiles directory depth exceeds four levels');
}
