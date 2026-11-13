import { validateCogContentRange } from './validateCogContentRange.js';
import { invalidCogFullResponse } from './invalidCogFullResponse.js';

/**
 * Validate a COG HTTP response's entity tag, range and full-response size.
 *
 * @param {Object} source COG source whose ETag and size are updated.
 * @param {Response} response HTTP response.
 * @param {number} rangeStart Requested absolute byte offset.
 * @param {number} length Requested byte length.
 *
 * @throws {Error} If the source ETag changes.
 * @throws {Error} If a full response is unsupported or too large.
 */
export function validateCogResponse(source, response, rangeStart, length) {
  const etag = response.headers.get('ETag');
  if (source.etag && source.etag !== etag) throw /* alloc */ new Error('COG changed; recreate the layer');
  if (etag) source.etag = etag;
  const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(response.headers.get('Content-Range') || '');
  if (response.status === 206) {
    validateCogContentRange(source, range, rangeStart, length);
    if (source.baseOffset === undefined) source.size = Number(range[3]);
  } else if (invalidCogFullResponse(response)) {
    throw /* alloc */ new Error('COG server must support byte ranges for files over 32 MB');
  }
}
