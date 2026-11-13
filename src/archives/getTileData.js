import { decompress } from './decompress.js';
import { read } from './readArchiveRange.js';

/**
 * Read and decompress tile data if the requested ID falls within the entry's run.
 *
 * @param {L.Layer} layer Archive layer.
 * @param {Object} header Decoded archive header.
 * @param {Object} entry Directory entry.
 * @param {number} id Requested tile ID.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<Object|undefined>} Object containing tile data, or undefined on a miss.
 *
 * @throws {Error} If the tile range extends outside the tile data section.
 */
export async function getTileData(layer, header, entry, id, signal) {
  if (id - entry.tileId >= entry.runLength) return;
  if (entry.offset + entry.length > header.tileDataLength) {
    throw /* alloc */ new Error('PMTiles tile outside data section');
  }
  const data = await decompress(await read(layer, header.tileDataOffset + entry.offset, entry.length, signal),
    header.tileCompression);
  signal?.throwIfAborted();
  return /* alloc */ { data };
}
