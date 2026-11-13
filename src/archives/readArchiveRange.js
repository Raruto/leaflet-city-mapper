import { etagByLayer } from '../weakmaps/etagByLayer.js';
import { urlByLayer } from '../weakmaps/urlByLayer.js';

/**
 * Read and validate a byte range from a PMTiles archive.
 *
 * @param {L.Layer} layer Archive layer containing the URL and cached ETag.
 * @param {number} offset Starting byte offset.
 * @param {number} length Number of bytes to read.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<ArrayBuffer>} Requested archive bytes.
 *
 * @throws {Error} If the requested byte range is invalid.
 * @throws {Error} If the HTTP request fails.
 * @throws {Error} If the archive ETag changes.
 * @throws {Error} If the range response headers or status are invalid.
 * @throws {Error} If the response length differs from the requested range.
 */
export async function read(layer, offset, length, signal) {
  signal?.throwIfAborted();
  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) ||
    offset < 0 || length <= 0 || !Number.isSafeInteger(offset + length)) {
    throw /* alloc */ new Error('Invalid PMTiles byte range');
  }
  const response = await fetch(urlByLayer.get(layer), /* alloc */ {
    headers: /* alloc */ { Range: `bytes=${offset}-${offset + length - 1}` }, signal,
  });
  if (!response.ok) {
    throw /* alloc */ new Error(`Unable to read PMTiles: HTTP ${response.status}`);
  }
  const etag = response.headers.get('ETag');
  if (etagByLayer.get(layer) && etag !== etagByLayer.get(layer)) {
    throw /* alloc */ new Error('PMTiles archive changed; recreate the layer');
  }
  if (etag) etagByLayer.set(layer, etag);
  let data = await response.arrayBuffer();
  if (response.status === 200) {
    data = data.slice(offset, offset + length);
  } else if (response.status !== 206 ||
    !response.headers.get('Content-Range')?.startsWith(`bytes ${offset}-${offset + length - 1}/`)) {
    throw /* alloc */ new Error('Invalid PMTiles range response');
  }
  if (data.byteLength !== length) {
    throw /* alloc */ new Error('Truncated PMTiles range');
  }
  return data;
}
