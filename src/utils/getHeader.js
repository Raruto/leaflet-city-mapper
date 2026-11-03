import { decodeHeader } from './decodeHeader';
import { read } from "./read";

/** Cache header initialization; failures remain visible to all callers. */

export function getHeader(backend) {
  if (backend.options.archive) return backend.options.archive.getHeader();
  return backend._header ||= read(backend, 0, 127).then(decodeHeader);
}
