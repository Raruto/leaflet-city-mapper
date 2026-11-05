import { pluginState } from '../core/pluginState.js';
import { loadDirectory } from './loadDirectory.js';
import { decompress } from './decompress.js';
import { tileId } from './tileId.js';
import { read } from './read.js';
import { getHeader } from './getHeader.js';

/** Nearest directory entry at/before the Hilbert ID, then follow leaf pointers. */

export async function getZxy(backend, z, x, y, signal) {
  if (backend.options.archive && backend.options.archive !== backend && pluginState(backend.options.archive).getZxy) {
    return pluginState(backend.options.archive).getZxy(z, x, y, signal);
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
      throw /* allocation: required -- Preserve the stack of this cyclic archive request. */ new Error('Cyclic PMTiles directory');
    }
    if (depth === 0) firstOffset = offset;
    else if (depth === 1) secondOffset = offset;
    else if (depth === 2) thirdOffset = offset;
    key = `${offset}:${length}`;
    if (!pluginState(backend)._directories.has(key)) {
      if (pluginState(backend)._directories.size >= 32) {
        pluginState(backend)._directories.delete(pluginState(backend)._directories.keys().next().value);
      }
      pluginState(backend)._directories.set(key, loadDirectory(backend, offset, length, header.internalCompression));
    }
    pending = pluginState(backend)._directories.get(key);
    entries = void 0;
    try {
      entries = await pending;
    } catch (error) {
      if (pluginState(backend)._directories.get(key) === pending) pluginState(backend)._directories.delete(key);
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
        throw /* allocation: required -- Preserve the stack of this invalid tile request. */ new Error('PMTiles tile outside data section');
      }
      data = await decompress(await read(backend, header.tileDataOffset + entry.offset, entry.length, signal), header.tileCompression);
      signal?.throwIfAborted();
      return /* allocation: required -- Concurrent callers own independent tile results. */ { data };
    }
    if (entry.offset + entry.length > header.leafDirectoryLength) {
      throw /* allocation: required -- Preserve the stack of this invalid directory request. */ new Error('PMTiles directory outside leaf section');
    }
    offset = header.leafDirectoryOffset + entry.offset;
    length = entry.length;
  }
  throw /* allocation: required -- Preserve the stack of this excessive directory traversal. */ new Error('PMTiles directory depth exceeds four levels');
}
