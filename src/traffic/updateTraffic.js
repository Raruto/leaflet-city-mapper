import { controlByLayer } from '../weakmaps/controlByLayer.js';
import { loadTraffic } from './loadTraffic.js';

/**
 * Reload lanes and tick the simulation when the clock changes or a relevant layer is removed.
 *
 * @param {Object} state Traffic layer state.
 * @param {Object} [event] Map event, optionally containing a removed layer.
 */
export function updateTraffic(state, event) {
  if (event?.layer && !controlByLayer.get(event.layer)?.time) return;
  cancelAnimationFrame(state.frame);
  loadTraffic(state);
  state.tick();
}
