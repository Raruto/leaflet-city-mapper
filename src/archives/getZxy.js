import { sceneLayers } from '../weakmaps/sceneLayers.js';
import { tileId } from './tileId.js';
import { getHeader } from './getHeader.js';
import { findTile } from './findTile.js';

/**
 * Retrieve an archive tile by XYZ coordinates, following leaf pointers when necessary.
 *
 * @param {L.Layer|Object} layer Archive layer or external archive provider.
 * @param {number} z Tile zoom level.
 * @param {number} x Tile column.
 * @param {number} y Tile row.
 * @param {AbortSignal} [signal] Request cancellation signal.
 *
 * @returns {Promise<Object|undefined>} Tile data, or undefined when unavailable.
 */
export async function getZxy(layer, z, x, y, signal) {
  if (!sceneLayers.has(layer)) return layer.getZxy(z, x, y, signal);
  if (layer.options.archive && layer.options.archive !== layer) {
    return getZxy(layer.options.archive, z, x, y, signal);
  }
  const id = tileId(z, x, y);
  signal?.throwIfAborted();
  const header = await getHeader(layer);
  signal?.throwIfAborted();
  if (z < header.minZoom || z > header.maxZoom) return;
  return findTile(layer, header, id, signal);
}
