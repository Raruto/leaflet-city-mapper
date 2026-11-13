import { controlByLayer } from '../weakmaps/controlByLayer.js';
import { L } from '../globals/L.js';

/**
 * Remove the control associated with this time layer.
 *
 * @returns {L.Control} The associated time control.
 */
export function removeTimeLayer() {
  return L.Control.prototype.remove.call(controlByLayer.get(this));
}
