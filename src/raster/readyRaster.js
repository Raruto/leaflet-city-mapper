import { headerByLayer } from '../weakmaps/headerByLayer.js';
import { getHeader } from "../archives/getHeader.js";

/**
 * Read the raster archive header, set zoom defaults and emit the ready event.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {Object} archive Archive to inspect.
 *
 * @returns {Promise<L.Layer>} The initialized layer.
 */
export async function readyRaster(layer, archive) {
  const header = await getHeader(archive);
  layer.options.archive = archive;
  headerByLayer.set(layer, header);
  if (layer.options.maxNativeZoom === undefined) {
    layer.options.maxNativeZoom = header.maxZoom;
  }
  layer.options.maxZoom = Math.max(layer.options.minZoom || 0, layer.options.maxZoom);
  layer.fire('ready');
  return layer;
}
