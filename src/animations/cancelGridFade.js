import { fadeFrameByLayer } from '../weakmaps/fadeFrameByLayer.js';
import { pendingGridFades } from '../globals/pendingGridFades.js';
import { gridFadeFrame } from '../globals/gridFadeFrame.js';

/**
 * Remove a layer's pending fade and cancel the shared frame if no fades remain.
 *
 * @param {L.GridLayer} layer Layer whose fade should stop.
 */
export function cancelGridFade(layer) {
  pendingGridFades.delete(layer);
  fadeFrameByLayer.set(layer, null);
  if (!pendingGridFades.size && gridFadeFrame.value !== null) {
    cancelAnimationFrame(gridFadeFrame.value);
    gridFadeFrame.value = null;
  }
}
