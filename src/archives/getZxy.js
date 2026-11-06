import { sceneByLayer } from '../globals/sceneByLayer.js';
import { tileId } from './tileId.js';
import { getHeader } from './getHeader.js';
import { findTile } from './findTile.js';

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
  if (z < header.minZoom || z > header.maxZoom) return;
  return findTile(backend, header, id, signal);
}
