import { archiveHeaderByLayer } from '../weakmaps/archiveHeaderByLayer.js';
import { sceneLayers } from '../weakmaps/sceneLayers.js';
import { decodeHeader } from './decodeHeader.js';
import { read } from './readArchiveRange.js';

/**
 * Cache header initialization; failures remain visible to all callers.
 *
 * @param {L.Layer|Object} layer Archive layer or external archive provider.
 *
 * @returns {Promise<Object>} Decoded archive header.
 */
export function getHeader(layer) {
  if (!sceneLayers.has(layer)) return layer.getHeader();
  if (layer.options.archive && layer.options.archive !== layer) return getHeader(layer.options.archive);
  let header = archiveHeaderByLayer.get(layer);
  if (!header) {
    header = read(layer, 0, 127).then(decodeHeader);
    archiveHeaderByLayer.set(layer, header);
  }
  return header;
}
