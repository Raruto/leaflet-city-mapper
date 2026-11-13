import { fadeFrameByLayer } from '../weakmaps/fadeFrameByLayer.js';
import { fadeVersionByLayer } from '../weakmaps/fadeVersionByLayer.js';
import { pendingGridFades } from '../globals/pendingGridFades.js';
import { gridFadeFrame } from '../globals/gridFadeFrame.js';
import { runGridFades } from './runGridFades.js';

/**
 * Queue the latest fade version for a layer on the shared animation frame.
 *
 * @param {L.GridLayer} layer Layer whose tiles should fade.
 */
export function scheduleGridFade(layer) {
  fadeVersionByLayer.set(layer, (fadeVersionByLayer.get(layer) || 0) + 1);
  pendingGridFades.set(layer, fadeVersionByLayer.get(layer));
  if (gridFadeFrame.value === null) gridFadeFrame.value = requestAnimationFrame(runGridFades);
  fadeFrameByLayer.set(layer, gridFadeFrame.value);
}
