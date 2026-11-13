import { addedByLayer } from '../weakmaps/addedByLayer.js';
import * as attach from './attachSharedScene.js';

/**
 * Attach a layer to the shared scene and report attachment errors.
 *
 * @param {L.Layer} layer Layer to attach.
 * @param {L.Map} map Map containing the layer.
 *
 * @returns {Promise<void>} Completion of the attachment attempt.
 */
export async function attachLayer(layer, map) {
  try {
    await attach.attach(layer, map);
    addedByLayer.get(layer).resolve();
  } catch (error) {
    layer.fire('error', /* alloc */ { error });
  }
}
