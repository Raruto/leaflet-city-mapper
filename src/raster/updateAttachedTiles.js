import { readyByLayer } from '../weakmaps/readyByLayer.js';
import { updateRasterTiles } from "./updateRasterTiles.js";

/**
 * Update tiles once scene attachment and archive initialization finish, reporting errors.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {L.Map} map Map to which the layer was attached.
 * @param {Promise} attached Shared scene attachment.
 *
 * @returns {Promise<void>} Completion of the update attempt.
 */
export async function updateAttachedTiles(layer, map, attached) {
  try {
    await Promise.all(/* alloc */ [attached, readyByLayer.get(layer)]);
    if (layer._map === map && map.hasLayer(layer)) updateRasterTiles(layer);
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
