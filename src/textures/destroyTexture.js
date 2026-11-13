import { rendererByLayer } from '../weakmaps/rendererByLayer.js';
import { destroyAfterSubmission } from './destroyTextureAfterSubmission.js';

/**
 * Schedule destruction of a GPU resource after the renderer's submitted work finishes.
 *
 * @param {L.Layer} layer Rendering layer used to report queue errors.
 * @param {GPUTexture|GPUBuffer} texture Resource to destroy.
 */
export function destroyTexture(layer, texture) {
  destroyAfterSubmission(layer, texture, rendererByLayer.get(layer).device.queue.onSubmittedWorkDone());
}
