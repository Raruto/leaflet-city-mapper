import { decompress } from './decompress.js';
import { read } from './readArchiveRange.js';

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
