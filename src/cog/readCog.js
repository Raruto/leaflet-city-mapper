import { validateCogRange } from './validateCogRange.js';
import { validateCogResponse } from './validateCogResponse.js';
import { readCogBody } from './readCogBody.js';

/**
 * Read a validated byte range from a COG source, caching an accepted full response.
 *
 * @param {Object} source COG byte source and response state.
 * @param {number} offset Byte offset relative to the source.
 * @param {number} length Number of bytes to read.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<ArrayBuffer>} Requested bytes.
 *
 * @throws {Error} If the HTTP response is unsuccessful.
 * @throws {Error} If a full PMTiles container response is truncated.
 * @throws {Error} If the resulting byte range is truncated.
 */
export async function readCog(source, offset, length, signal) {
  signal?.throwIfAborted();
  validateCogRange(source, offset, length);
  if (source.full) return source.full.slice(offset, offset + length);
  const rangeStart = (source.baseOffset || 0) + offset;
  const response = await fetch(source.url, /* alloc */ {
    headers: /* alloc */ { Range: `bytes=${rangeStart}-${rangeStart + length - 1}` }, signal,
  });
  if (!response.ok) throw /* alloc */ new Error(`Unable to read COG: HTTP ${response.status}`);
  validateCogResponse(source, response, rangeStart, length);
  const data = await readCogBody(response, length);
  if (response.status === 200) {
    if (source.baseOffset === undefined) source.size = data.byteLength;
    else if (data.byteLength !== source.containerSize) throw /* alloc */ new Error('Truncated PMTiles COG container');
    source.full = source.baseOffset === undefined ? data.buffer
      : data.slice(source.baseOffset, source.baseOffset + source.size);
  }
  const result = response.status === 200 ? source.full.slice(offset, offset + length) : data.buffer;
  if (result.byteLength !== length) throw /* alloc */ new Error('Truncated COG byte range');
  return result;
}
