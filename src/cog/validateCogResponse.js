import { validateCogContentRange } from './validateCogContentRange.js';
import { invalidCogFullResponse } from './invalidCogFullResponse.js';

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
