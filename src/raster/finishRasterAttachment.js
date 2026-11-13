import { addedByLayer } from '../weakmaps/addedByLayer.js';
import { terrain3DByMap } from '../weakmaps/terrain3DByMap.js';
import { setRasterTerrain } from "./setRasterTerrain.js";

/**
 * Complete raster attachment and bind the current terrain, reporting failures.
 *
 * @param {L.Layer} layer Raster layer.
 * @param {L.Map} map Map containing the layer.
 * @param {Promise} attached Shared scene attachment.
 *
 * @returns {Promise<void>} Completion of the attachment attempt.
 */
export async function finishAttachment(layer, map, attached) {
  try {
    await attached;
    addedByLayer.get(layer).resolve();
    setRasterTerrain(layer, terrain3DByMap.get(map));
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
