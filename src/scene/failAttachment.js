import { rendererReadyByLayer } from '../weakmaps/rendererReadyByLayer.js';
import { renderers } from '../weakmaps/renderers.js';
import { showWebGPUWarning } from '../gpu/showWebGPUWarning.js';

/**
 * Report renderer initialization failure, reject readiness and clear the shared renderer.
 *
 * @param {Error} error Initialization error.
 * @param {L.Layer} layer Shared renderer owner.
 * @param {L.Map} map Map whose renderer failed.
 *
 * @throws {Error} The supplied error.
 */
export function failAttachment(error, layer, map) {
  showWebGPUWarning(map);
  rendererReadyByLayer.get(layer).reject(error);
  renderers.delete(map);
  throw error;
}
